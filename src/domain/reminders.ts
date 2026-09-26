import type { CategoryId, ISODateTime, TripBundle } from './types';
import { formatTime, localDateOf, shortDate, zonedToIso } from './time';

export type ReminderKind = 'flight_checkin' | 'leave_airport' | 'hotel' | 'activity' | 'car' | 'checklist' | 'documents';

export const REMINDER_KINDS: ReminderKind[] = ['flight_checkin', 'leave_airport', 'hotel', 'activity', 'car', 'checklist', 'documents'];

export interface Reminder {
  id: string;
  kind: ReminderKind;
  at: ISODateTime; // UTC instant the notification should fire
  title: string;
  body: string;
  category: CategoryId;
  /** Timezone used to show the time to the user. */
  tz: string;
}

export interface NotificationPrefs {
  enabled: boolean;
  kinds: Record<ReminderKind, boolean>;
  /** Minutes before a timed activity. */
  activityLead: number;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  kinds: { flight_checkin: true, leave_airport: true, hotel: true, activity: true, car: true, checklist: true, documents: true },
  activityLead: 60,
};

const H = 3600_000;
const shift = (iso: ISODateTime, ms: number) => new Date(new Date(iso).getTime() + ms).toISOString();

/** Pure: derive every reminder for a trip. Filtering by prefs/time happens in `upcoming`. */
export function buildReminders(bundle: TripBundle, prefs: NotificationPrefs = DEFAULT_PREFS): Reminder[] {
  const tz = bundle.trip.timezone;
  const out: Reminder[] = [];
  const flights = [...bundle.flights].sort((a, b) => a.departureAt.localeCompare(b.departureAt));

  for (const f of flights) {
    out.push({
      id: `ci-${f.id}`, kind: 'flight_checkin', at: shift(f.departureAt, -24 * H), category: 'flights', tz: f.departureTimezone,
      title: `הצ׳ק-אין לטיסה ${f.flightNumber} נפתח`,
      body: `${f.origin} → ${f.destination}, יציאה ${formatTime(f.departureAt, f.departureTimezone)}${f.bookingReference ? ` · הזמנה ${f.bookingReference}` : ''}`,
    });
    out.push({
      id: `go-${f.id}`, kind: 'leave_airport', at: shift(f.departureAt, -4 * H), category: 'flights', tz: f.departureTimezone,
      title: `זמן לצאת לשדה (${f.origin})`,
      body: `טיסה ${f.flightNumber} ב-${formatTime(f.departureAt, f.departureTimezone)}${f.departureTerminal ? `, טרמינל ${f.departureTerminal}` : ''}. מומלץ להגיע 3 שעות לפני.`,
    });
  }

  for (const h of bundle.hotels) {
    out.push({
      id: `ht-${h.id}`, kind: 'hotel', at: shift(h.checkInAt, -3 * H), category: 'hotels', tz,
      title: `צ׳ק-אין ב-${h.name} היום`,
      body: `מ-${formatTime(h.checkInAt, tz)} · ${h.address}${h.bookingNumber ? ` · הזמנה ${h.bookingNumber}` : ''}`,
    });
    out.push({
      id: `hto-${h.id}`, kind: 'hotel', at: zonedToIso(localDateOf(h.checkOutAt, tz), '08:00', tz), category: 'hotels', tz,
      title: `צ׳ק-אאוט עד ${formatTime(h.checkOutAt, tz)}`,
      body: `${h.name} · לשמור את המזוודה בקבלה אם יש עוד זמן בעיר`,
    });
  }

  const lead = prefs.activityLead * 60_000;
  for (const a of bundle.activities) {
    if (!a.startAt || a.status === 'cancelled') continue;
    out.push({
      id: `ac-${a.id}`, kind: 'activity', at: shift(a.startAt, -lead), category: 'attractions', tz,
      title: `${a.name} ב-${formatTime(a.startAt, tz)}`,
      body: a.ticketStatus === 'purchased' ? 'יש לך כרטיס. כדאי לצאת עכשיו.' : a.ticketStatus === 'needed' ? 'עדיין צריך כרטיס.' : a.address ?? 'כדאי לצאת עכשיו.',
    });
  }
  for (const e of bundle.events) {
    out.push({
      id: `ev-${e.id}`, kind: 'activity', at: shift(e.startAt, -lead), category: 'attractions', tz,
      title: `${e.name} ב-${formatTime(e.startAt, tz)}`,
      body: e.location ?? (e.bookingReference ? `הזמנה ${e.bookingReference}` : 'כדאי לצאת עכשיו.'),
    });
  }

  for (const c of bundle.carRentals) {
    out.push({
      id: `car-${c.id}`, kind: 'car', at: shift(c.pickupAt, -2 * H), category: 'car', tz,
      title: `איסוף רכב ב-${formatTime(c.pickupAt, tz)}`,
      body: `${c.company} · ${c.pickupLocation}. רישיון נהיגה וכרטיס אשראי.`,
    });
    out.push({
      id: `card-${c.id}`, kind: 'car', at: shift(c.dropoffAt, -3 * H), category: 'car', tz,
      title: `החזרת רכב ב-${formatTime(c.dropoffAt, tz)}`,
      body: `${c.dropoffLocation}. לא לשכוח למלא דלק.`,
    });
  }

  const first = flights[0];
  const start = first?.departureAt ?? zonedToIso(bundle.trip.startDate, '09:00', tz);
  const left = bundle.checklist.filter((c) => !c.done);
  if (left.length) {
    out.push({
      id: 'pack-2d', kind: 'checklist', at: shift(start, -48 * H), category: 'checklist', tz: first?.departureTimezone ?? tz,
      title: `נשארו ${left.length} פריטים לארוז`,
      body: left.slice(0, 3).map((c) => c.label).join(', ') + (left.length > 3 ? '…' : ''),
    });
  }

  const missing = [
    ...bundle.flights.filter((f) => !f.documentId && !bundle.documents.some((d) => d.linkedId === f.id)).map((f) => `כרטיס טיסה ${f.flightNumber}`),
    ...bundle.hotels.filter((h) => !h.documentId && !bundle.documents.some((d) => d.linkedId === h.id)).map((h) => `אישור ${h.name}`),
    ...bundle.activities.filter((a) => a.ticketStatus === 'purchased' && !a.documentId && !bundle.documents.some((d) => d.linkedId === a.id)).map((a) => `כרטיס ${a.name}`),
  ];
  if (missing.length) {
    out.push({
      id: 'docs-3d', kind: 'documents', at: shift(start, -72 * H), category: 'flights', tz: first?.departureTimezone ?? tz,
      title: `חסרים ${missing.length} מסמכים לטיול`,
      body: missing.slice(0, 3).join(', ') + (missing.length > 3 ? '…' : ''),
    });
  }

  return out.sort((a, b) => a.at.localeCompare(b.at));
}

/** Reminders that are enabled and still ahead of `now`. */
export function upcoming(all: Reminder[], prefs: NotificationPrefs, now: Date = new Date()): Reminder[] {
  if (!prefs.enabled) return [];
  return all.filter((r) => prefs.kinds[r.kind] && new Date(r.at).getTime() > now.getTime());
}

/** Human label for when a reminder fires, in its own timezone. */
export function whenLabel(r: Reminder): string {
  return `${shortDate(localDateOf(r.at, r.tz))} · ${formatTime(r.at, r.tz)}`;
}
