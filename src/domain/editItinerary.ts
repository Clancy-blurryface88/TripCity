import type { ItineraryItem, LocalDate } from './types';
import { detectConflicts, type Conflict } from './conflicts';
import { formatTime, localDateOf, zonedToIso } from './time';

const MIN = 60000;
const DEFAULT_MIN = 60;
const GAP_MIN = 15;

const t = (iso: string) => new Date(iso).getTime();
const iso = (ms: number) => new Date(ms).toISOString();
const durationMs = (i: ItineraryItem) => (i.endAt ? t(i.endAt) - t(i.startAt) : DEFAULT_MIN * MIN);
const endMs = (i: ItineraryItem) => t(i.startAt) + durationMs(i);
const round5 = (ms: number) => Math.round(ms / (5 * MIN)) * 5 * MIN;

export function dayItems(all: ItineraryItem[], date: LocalDate): ItineraryItem[] {
  return all.filter((i) => i.date === date).sort((a, b) => a.startAt.localeCompare(b.startAt));
}

function replace(all: ItineraryItem[], item: ItineraryItem): ItineraryItem[] {
  return all.map((i) => (i.id === item.id ? item : i));
}

function withStart(item: ItineraryItem, startMs: number, tz: string): ItineraryItem {
  const d = durationMs(item);
  const s = iso(startMs);
  return { ...item, startAt: s, endAt: item.endAt ? iso(startMs + d) : undefined, date: localDateOf(s, tz), source: 'user', aiGenerated: false };
}

/** Change the start time (HH:mm, trip timezone), keeping the duration. Locked anchors never move. */
export function retime(all: ItineraryItem[], id: string, hhmm: string, tz: string): ItineraryItem[] | null {
  const item = all.find((i) => i.id === id);
  if (!item || item.isLocked) return null;
  return replace(all, withStart(item, t(zonedToIso(item.date, hhmm, tz)), tz));
}

/** Move to another day at the same wall-clock time. */
export function moveToDay(all: ItineraryItem[], id: string, date: LocalDate, tz: string): ItineraryItem[] | null {
  const item = all.find((i) => i.id === id);
  if (!item || item.isLocked) return null;
  return replace(all, withStart(item, t(zonedToIso(date, formatTime(item.startAt, tz), tz)), tz));
}

/**
 * Drag result: put `id` at position `toIndex` in its day and give it a start time that fits there
 * (right after the previous item plus travel, or before the next one). Anchors stay where they are.
 */
export function reorder(all: ItineraryItem[], id: string, toIndex: number, tz: string): ItineraryItem[] | null {
  const item = all.find((i) => i.id === id);
  if (!item || item.isLocked) return null;
  const rest = dayItems(all, item.date).filter((i) => i.id !== id);
  const k = Math.max(0, Math.min(toIndex, rest.length));
  const prev = rest[k - 1];
  const next = rest[k];
  let start: number;
  if (prev) start = endMs(prev) + (prev.travelToNext?.minutes ?? GAP_MIN) * MIN;
  else if (next) start = t(next.startAt) - durationMs(item) - (item.travelToNext?.minutes ?? GAP_MIN) * MIN;
  else return all;
  const moved = withStart(item, round5(start), tz);
  return replace(all, { ...moved, date: item.date });
}

export function removeItem(all: ItineraryItem[], id: string): ItineraryItem[] {
  return all.filter((i) => i.id !== id || i.isLocked);
}

export function setNote(all: ItineraryItem[], id: string, notes: string): ItineraryItem[] {
  return all.map((i) => (i.id === id ? { ...i, notes: notes || undefined } : i));
}

export function addFreeItem(all: ItineraryItem[], tripId: string, date: LocalDate, title: string, hhmm: string, minutes: number, tz: string): ItineraryItem[] {
  const s = zonedToIso(date, hhmm, tz);
  const item: ItineraryItem = {
    id: `it-user-${Date.now().toString(36)}`, tripId, date, startAt: s, endAt: iso(t(s) + minutes * MIN), itemType: 'free_time', title,
    orderIndex: 0, source: 'user', isLocked: false, aiGenerated: false,
  };
  return [...all, item];
}

const key = (c: Conflict) => `${c.kind}:${c.itemIds.join('|')}`;

/** Conflicts the change adds on the affected days (existing ones are not reported again). */
export function introducedConflicts(before: ItineraryItem[], after: ItineraryItem[], dates: LocalDate[]): Conflict[] {
  const out: Conflict[] = [];
  for (const d of new Set(dates)) {
    const old = new Set(detectConflicts(dayItems(before, d)).map(key));
    out.push(...detectConflicts(dayItems(after, d)).filter((c) => !old.has(key(c))));
  }
  return out;
}
