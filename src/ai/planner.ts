import type { Activity, GeoPoint, ItineraryItem, LocalDate, TripBundle } from '@/domain/types';
import { detectConflicts } from '@/domain/conflicts';
import { eachDate, formatTime, zonedToIso } from '@/domain/time';
import { parsePlan, type AiPlan } from './schema';

/**
 * Trip planner, following the spec pipeline:
 * Normalize -> Anchors -> Dates & times -> Opening hours -> Group by location -> Travel time -> Daily schedule -> Conflicts -> Draft.
 * Output is exactly the AI JSON contract (schema.ts) and passes parsePlan, so an LLM Edge Function can replace this
 * function later without touching the UI. Travel times are straight-line estimates until a maps provider is connected.
 */
export type Pace = 'relaxed' | 'balanced' | 'packed';
export const PACE: Record<Pace, { label: string; perDay: number; dayStart: string; dayEnd: string; buffer: number }> = {
  relaxed: { label: 'רגוע', perDay: 1, dayStart: '10:00', dayEnd: '19:00', buffer: 30 },
  balanced: { label: 'מאוזן', perDay: 2, dayStart: '09:30', dayEnd: '21:00', buffer: 20 },
  packed: { label: 'אינטנסיבי', perDay: 3, dayStart: '09:00', dayEnd: '22:00', buffer: 10 },
};

export const PIPELINE = ['איסוף הנתונים', 'זיהוי עוגנים', 'בדיקת תאריכים ושעות', 'שעות פתיחה', 'קיבוץ לפי אזור', 'חישוב זמני נסיעה', 'בניית לו״ז יומי', 'זיהוי התנגשויות', 'טיוטה מוכנה'];

const MIN = 60000;
const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const toHhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Estimate door to door: walk under 1.5 km, metro above. */
export function travel(a: GeoPoint | undefined, b: GeoPoint | undefined): { minutes: number; mode: 'walk' | 'metro' } {
  if (!a || !b) return { minutes: 20, mode: 'metro' };
  const km = distanceKm(a, b) * 1.3;
  if (km < 1.5) return { minutes: Math.max(5, Math.round(km * 13)), mode: 'walk' };
  return { minutes: Math.round(12 + km * 3), mode: 'metro' };
}

function geoOf(b: TripBundle, i: ItineraryItem): GeoPoint | undefined {
  if (!i.referenceId) return undefined;
  return b.activities.find((a) => a.id === i.referenceId)?.location ?? b.hotels.find((h) => h.id === i.referenceId)?.location ?? b.events.find((e) => e.id === i.referenceId)?.geo;
}

interface Slot {
  id: string;
  start: number; // minutes from local midnight
  end: number;
  geo?: GeoPoint;
}

export interface Placement {
  activity: Activity;
  date: LocalDate;
  start: string;
  end: string;
  reason: string;
  travelMinutes: number;
  replaces: string[];
}
export interface Draft {
  plan: AiPlan;
  placements: Placement[];
  unplaced: Array<{ activity: Activity; reason: string }>;
}

const WEEKDAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export function planTrip(b: TripBundle, pace: Pace, wishIds?: string[]): Draft {
  const tz = b.trip.timezone;
  const cfg = PACE[pace];
  const dates = eachDate(b.trip.startDate, b.trip.endDate);
  const hotel = b.hotels[0]?.location;
  const wish = b.activities.filter((a) => !a.startAt && a.status === 'planned' && (!wishIds || wishIds.includes(a.id)));

  // Occupied time per day: every item already in the itinerary (anchors and the user's own items stay put).
  const busy = new Map<LocalDate, Slot[]>();
  for (const d of dates) {
    busy.set(
      d,
      b.itinerary
        .filter((i) => i.date === d && i.itemType !== 'free_time')
        .map((i) => ({ id: i.id, start: toMin(formatTime(i.startAt, tz)), end: i.endAt ? toMin(formatTime(i.endAt, tz)) : toMin(formatTime(i.startAt, tz)) + 60, geo: geoOf(b, i) ?? undefined }))
        .sort((x, y) => x.start - y.start),
    );
  }
  // Arrival and departure days: nothing before landing, nothing after leaving for the airport.
  const window_ = new Map<LocalDate, { after: number; before: number }>();
  for (const d of dates) {
    const day = b.itinerary.filter((i) => i.date === d).sort((x, y) => x.startAt.localeCompare(y.startAt));
    let after = 0;
    let before = 24 * 60;
    day.forEach((i, k) => {
      if (i.itemType !== 'flight') return;
      const f = b.flights.find((x) => x.id === i.referenceId);
      const arriving = f ? f.arrivalTimezone === tz : k === 0;
      if (arriving) after = Math.max(after, toMin(formatTime(i.endAt ?? i.startAt, tz)));
      else {
        const prev = day[k - 1];
        before = Math.min(before, prev && prev.itemType === 'transport' ? toMin(formatTime(prev.startAt, tz)) : toMin(formatTime(i.startAt, tz)) - 180);
      }
    });
    window_.set(d, { after, before });
  }
  const added = new Map<LocalDate, number>();
  const placements: Placement[] = [];
  const unplaced: Draft['unplaced'] = [];

  // Hardest first: the fewest open days, then the longest visit.
  const openDays = (a: Activity) => dates.filter((d) => !a.openingHours?.closedWeekdays?.includes(new Date(`${d}T12:00:00Z`).getUTCDay()));
  const order = [...wish].sort((x, y) => openDays(x).length - openDays(y).length || (y.durationMinutes ?? 60) - (x.durationMinutes ?? 60));

  for (const a of order) {
    const dur = a.durationMinutes ?? 60;
    const open = a.openingHours ? toMin(a.openingHours.open) : 0;
    const close = a.openingHours ? toMin(a.openingHours.close) : 24 * 60;
    let best: { d: LocalDate; start: number; score: number; travel: number; near?: string } | null = null;
    for (const d of openDays(a)) {
      if ((added.get(d) ?? 0) >= cfg.perDay) continue;
      const slots = busy.get(d)!;
      // Group by location: prefer the day whose other stops are closest to this place.
      const centre = slots.filter((s) => s.geo).map((s) => distanceKm(s.geo!, a.location ?? hotel!));
      const areaScore = centre.length ? Math.min(...centre) : 5;
      const w = window_.get(d)!;
      const dayStart = Math.max(toMin(cfg.dayStart), open, w.after);
      const dayEnd = Math.min(toMin(cfg.dayEnd), close, w.before);
      const edges: Array<{ from?: Slot; to?: Slot }> = [];
      const inDay = slots.filter((s) => s.end > dayStart && s.start < dayEnd);
      edges.push({ to: inDay[0] });
      for (let k = 0; k < inDay.length; k++) edges.push({ from: inDay[k], to: inDay[k + 1] });
      for (const { from, to } of edges) {
        const tIn = travel(from?.geo ?? hotel, a.location).minutes;
        const tOut = to ? travel(a.location, to.geo ?? hotel).minutes : 0;
        const start = Math.ceil((Math.max(dayStart, from ? from.end + tIn + cfg.buffer / 2 : dayStart)) / 5) * 5;
        const end = start + dur;
        const leave = !to && w.before < 24 * 60 ? w.before - travel(a.location, hotel).minutes - cfg.buffer / 2 : Infinity;
        const limit = Math.min(dayEnd, to ? to.start - tOut - cfg.buffer / 2 : dayEnd, leave);
        if (end <= limit) {
          const score = areaScore * 10 + (added.get(d) ?? 0) * 8 + tIn / 10;
          if (!best || score < best.score) {
            const near = slots.filter((s) => s.geo).sort((x, y) => distanceKm(x.geo!, a.location!) - distanceKm(y.geo!, a.location!))[0];
            best = { d, start, score, travel: tIn, near: near ? b.itinerary.find((i) => i.id === near.id)?.title : undefined };
          }
          break;
        }
      }
    }
    if (!best) {
      const closed = a.openingHours?.closedWeekdays?.length ? ` (סגור בימי ${a.openingHours.closedWeekdays.map((w) => WEEKDAY_HE[w]).join(', ')})` : '';
      unplaced.push({ activity: a, reason: `לא נמצא חלון פנוי שמתאים לשעות הפתיחה ולקצב שבחרת${closed}` });
      continue;
    }
    const slot: Slot = { id: a.id, start: best.start, end: best.start + dur, geo: a.location };
    const list = busy.get(best.d)!;
    list.push(slot);
    list.sort((x, y) => x.start - y.start);
    added.set(best.d, (added.get(best.d) ?? 0) + 1);
    const parts = [best.near ? `קרוב ל"${best.near}"` : 'באזור המלון'];
    if (a.openingHours) parts.push(`פתוח ${a.openingHours.open}–${a.openingHours.close}`);
    parts.push(`כ-${best.travel} דק׳ נסיעה`);
    const replaces = b.itinerary
      .filter((i) => i.date === best!.d && i.itemType === 'free_time')
      .filter((i) => toMin(formatTime(i.startAt, tz)) < best!.start + dur + 30 && (i.endAt ? toMin(formatTime(i.endAt, tz)) : 24 * 60) > best!.start)
      .map((i) => i.id);
    placements.push({ activity: a, date: best.d, start: toHhmm(best.start), end: toHhmm(best.start + dur), reason: parts.join(' · '), travelMinutes: best.travel, replaces });
  }

  const plan: AiPlan = {
    days: dates.map((d) => ({
      date: d,
      items: [
        ...b.itinerary
          .filter((i) => i.date === d && i.isLocked)
          .map((i) => ({ source_type: i.itemType === 'note' ? 'free_time' : i.itemType, source_id: i.id, start: formatTime(i.startAt, tz), end: i.endAt ? formatTime(i.endAt, tz) : toHhmm(Math.min(toMin(formatTime(i.startAt, tz)) + 60, 23 * 60 + 59)), reason: 'עוגן קבוע' }) as AiPlan['days'][number]['items'][number]),
        ...placements.filter((p) => p.date === d).map((p) => ({ source_type: 'activity' as const, source_id: p.activity.id, start: p.start, end: p.end, reason: p.reason })),
      ].sort((x, y) => x.start.localeCompare(y.start)),
    })),
    conflicts: [],
    unplaced_items: unplaced.map((u) => ({ source_id: u.activity.id, reason: u.reason })),
  };
  // Conflicts on the draft (existing items + new placements).
  const merged = applyDraft(b, { plan, placements, unplaced });
  for (const d of dates) {
    for (const c of detectConflicts(merged.filter((i) => i.date === d))) plan.conflicts.push({ item_ids: [...c.itemIds], message: c.kind === 'overlap' ? 'חפיפה' : 'זמן נסיעה קצר' });
  }
  const locked = new Map(b.itinerary.filter((i) => i.isLocked).map((i) => [i.id, { date: i.date, start: formatTime(i.startAt, tz) }]));
  const check = parsePlan(plan, locked);
  if (!check.ok) throw new Error(`planner produced an invalid plan: ${check.errors.join('; ')}`);
  return { plan, placements, unplaced };
}

/** Turn accepted placements into itinerary items (marked as AI) next to what the user already has. */
export function applyDraft(b: TripBundle, draft: Draft, only?: Set<string>): ItineraryItem[] {
  const tz = b.trip.timezone;
  const newItems: ItineraryItem[] = draft.placements
    .filter((p) => !only || only.has(p.activity.id))
    .map((p, k) => ({
      id: `it-ai-${p.activity.id}`,
      tripId: b.trip.id,
      date: p.date,
      startAt: zonedToIso(p.date, p.start, tz),
      endAt: zonedToIso(p.date, p.end, tz),
      itemType: 'activity',
      referenceId: p.activity.id,
      title: p.activity.name,
      subtitle: p.reason,
      orderIndex: 1000 + k,
      source: 'ai',
      isLocked: false,
      aiGenerated: true,
    }));
  const ids = new Set(newItems.map((i) => i.id));
  const replaced = new Set(draft.placements.filter((p) => !only || only.has(p.activity.id)).flatMap((p) => p.replaces));
  const all = [...b.itinerary.filter((i) => !ids.has(i.id) && !replaced.has(i.id)), ...newItems].map((i) => ({ ...i }));
  // Travel estimates around the new stops.
  const hotel = b.hotels[0]?.location;
  const geo = (i: ItineraryItem) => geoOf(b, i) ?? hotel;
  for (const d of new Set(newItems.map((i) => i.date))) {
    const day = all.filter((i) => i.date === d).sort((x, y) => x.startAt.localeCompare(y.startAt));
    day.forEach((it, k) => {
      const next = day[k + 1];
      if (!next) return;
      if (ids.has(it.id) || ids.has(next.id)) it.travelToNext = travel(geo(it), geo(next));
    });
  }
  return all;
}

export const _test = { toMin, toHhmm, MIN };
