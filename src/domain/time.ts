import type { ISODateTime, LocalDate } from './types';

/** Format an instant as HH:mm in the given IANA timezone (24h). */
export function formatTime(iso: ISODateTime, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(new Date(iso));
}

/** The calendar date (YYYY-MM-DD) of an instant in the given timezone. */
export function localDateOf(iso: ISODateTime, timeZone: string): LocalDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Inclusive list of local dates between start and end. */
export function eachDate(start: LocalDate, end: LocalDate): LocalDate[] {
  const out: LocalDate[] = [];
  const d = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/** "12.04" style short date, derived from the local date string (no timezone math needed). */
export function shortDate(date: LocalDate): string {
  const [, m, d] = date.split('-');
  return `${d}.${m}`;
}

const HE_MONTHS = ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'];
const HE_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

/** "יום שני, 12 באפריל" for a local date. */
export function longHebrewDate(date: LocalDate): string {
  const d = new Date(`${date}T12:00:00Z`);
  return `יום ${HE_WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${HE_MONTHS[d.getUTCMonth()]}`;
}

/** "12–16 באפריל 2027" range label. */
export function rangeLabel(start: LocalDate, end: LocalDate): string {
  const s = new Date(`${start}T12:00:00Z`);
  const e = new Date(`${end}T12:00:00Z`);
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}–${e.getUTCDate()} ${HE_MONTHS[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
  }
  return `${s.getUTCDate()} ${HE_MONTHS[s.getUTCMonth()]} – ${e.getUTCDate()} ${HE_MONTHS[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
}

export function minutesBetween(a: ISODateTime, b: ISODateTime): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

/** Wall-clock date + time in an IANA zone -> UTC ISO instant. */
export function zonedToIso(date: LocalDate, time: string, timeZone: string): ISODateTime {
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(guess);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asZone = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'));
  return new Date(guess.getTime() - (asZone - guess.getTime())).toISOString();
}
