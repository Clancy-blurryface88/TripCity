import { z } from 'zod';
import type { CityKey } from '@/domain/types';
import { resolveCityKey } from '@/domain/cities';

/**
 * Document extraction contract (spec §9, §10, §21).
 * In production an Edge Function runs OCR + an LLM with Structured Outputs and returns exactly this shape.
 * Until the backend is connected, `parseTravelText` fills it from plain text with rules.
 */
export const extractionSchema = z
  .object({
    kind: z.enum(['flight', 'hotel', 'unknown']),
    airline: z.string().nullable(),
    flight_number: z.string().nullable(),
    origin: z.string().nullable(),
    destination: z.string().nullable(),
    date: z.string().nullable(), // YYYY-MM-DD
    departure_time: z.string().nullable(), // HH:mm
    arrival_time: z.string().nullable(),
    departure_terminal: z.string().nullable(),
    gate: z.string().nullable(),
    booking_reference: z.string().nullable(),
    hotel_name: z.string().nullable(),
    check_in: z.string().nullable(),
    check_out: z.string().nullable(),
    address: z.string().nullable(),
  })
  .strict();

export type Extraction = z.infer<typeof extractionSchema>;

export const AIRLINES: Record<string, string> = {
  LY: 'El Al', IZ: 'Arkia', '6H': 'Israir', AF: 'Air France', BA: 'British Airways', LH: 'Lufthansa', KL: 'KLM',
  W6: 'Wizz Air', W4: 'Wizz Air', FR: 'Ryanair', U2: 'easyJet', AZ: 'ITA Airways', IB: 'Iberia', TP: 'TAP Air Portugal',
  OS: 'Austrian', LX: 'SWISS', SK: 'SAS', AY: 'Finnair', LO: 'LOT', OK: 'Czech Airlines', A3: 'Aegean', EI: 'Aer Lingus',
  SN: 'Brussels Airlines', TK: 'Turkish Airlines', UA: 'United', DL: 'Delta', AA: 'American', AC: 'Air Canada',
  JL: 'Japan Airlines', NH: 'ANA', KE: 'Korean Air', TG: 'Thai Airways', CA: 'Air China', MS: 'EgyptAir', EK: 'Emirates',
  FZ: 'flydubai', QF: 'Qantas', AM: 'Aeromexico', AR: 'Aerolineas Argentinas', FI: 'Icelandair', DY: 'Norwegian', VY: 'Vueling',
};

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  ינואר: 1, פברואר: 2, מרץ: 3, אפריל: 4, מאי: 5, יוני: 6, יולי: 7, אוגוסט: 8, ספטמבר: 9, אוקטובר: 10, נובמבר: 11, דצמבר: 12,
};
const pad = (n: number) => String(n).padStart(2, '0');

function findDates(t: string): string[] {
  const out: { i: number; d: string }[] = [];
  for (const m of t.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)) out.push({ i: m.index!, d: `${m[1]}-${m[2]}-${m[3]}` });
  for (const m of t.matchAll(/\b(\d{1,2})[./](\d{1,2})[./](20\d{2}|\d{2})\b/g)) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    const d = Number(m[1]), mo = Number(m[2]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) out.push({ i: m.index!, d: `${y}-${pad(mo)}-${pad(d)}` });
  }
  for (const m of t.matchAll(/\b(\d{1,2})\s*(?:ב)?([A-Za-z\u05d0-\u05ea]{3,9})\.?\s*(20\d{2})\b/g)) {
    const mo = MONTHS[m[2].toLowerCase()] ?? MONTHS[m[2].toLowerCase().slice(0, 3)];
    if (mo) out.push({ i: m.index!, d: `${m[3]}-${pad(mo)}-${pad(Number(m[1]))}` });
  }
  return out.sort((a, b) => a.i - b.i).map((x) => x.d);
}

function near(t: string, words: RegExp, re: RegExp): string | null {
  const m = t.match(new RegExp(`(?:${words.source})[^\\n]{0,40}?${re.source}`, 'i'));
  return m ? m[m.length - 1] : null;
}

function bookingRef(t: string): string | null {
  const kw = /(booking|pnr|confirmation|reference|reservation|קוד הזמנה|מספר הזמנה|אסמכתא|הזמנה)/gi;
  for (const m of t.matchAll(kw)) {
    const after = t.slice(m.index! + m[0].length, m.index! + m[0].length + 50);
    const tok = after.match(/\b(?=[A-Z0-9]*\d|[A-Z]{6}\b)[A-Z0-9]{5,10}\b/);
    if (tok) return tok[0];
  }
  return null;
}

const NOT_IATA = new Set(['THE', 'AND', 'FOR', 'PNR', 'REF', 'PDF', 'VIA', 'DEP', 'ARR', 'ETA', 'ETD', 'UTC', 'GMT', 'EUR', 'USD', 'ILS', 'NIS', 'TEL', 'FAX', 'SEAT', 'ROW']);

/** Rule-based reader for pasted confirmation text or a typed flight number. */
export function parseTravelText(raw: string): Extraction {
  const t = raw.replace(/\u00a0/g, ' ');
  const e: Extraction = {
    kind: 'unknown', airline: null, flight_number: null, origin: null, destination: null, date: null,
    departure_time: null, arrival_time: null, departure_terminal: null, gate: null, booking_reference: null,
    hotel_name: null, check_in: null, check_out: null, address: null,
  };

  const fn = t.match(/\b([A-Z]{2}|[A-Z]\d|\d[A-Z])\s?-?(\d{1,4})\b/g)?.map((s) => s.replace(/[\s-]/g, '')).find((s) => AIRLINES[s.slice(0, 2)]);
  if (fn) {
    e.flight_number = fn;
    e.airline = AIRLINES[fn.slice(0, 2)];
  }
  const route = t.match(/\b([A-Z]{3})\s*(?:-|–|—|→|->|>|to|אל|ל-)\s*([A-Z]{3})\b/);
  if (route && !NOT_IATA.has(route[1]) && !NOT_IATA.has(route[2])) {
    e.origin = route[1];
    e.destination = route[2];
  } else {
    const from = near(t, /from|origin|departure|מ-|יציאה|המראה/, /\b([A-Z]{3})\b/);
    const to = near(t, /to|destination|arrival|נחיתה|יעד/, /\b([A-Z]{3})\b/);
    if (from && !NOT_IATA.has(from)) e.origin = from;
    if (to && !NOT_IATA.has(to) && to !== e.origin) e.destination = to;
  }
  const times = [...t.matchAll(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g)].map((m) => `${pad(Number(m[1]))}:${m[2]}`);
  const dates = findDates(t);
  e.booking_reference = bookingRef(t);
  if (e.booking_reference && e.booking_reference === e.flight_number) e.booking_reference = null;
  e.departure_terminal = near(t, /terminal|טרמינל/, /\b([0-9A-Z]{1,2})\b/);
  e.gate = near(t, /gate|שער/, /\b([A-Z]?\d{1,3}[A-Z]?)\b/);

  const hotelWord = /\b(hotel|hôtel|hostel|inn|resort|suites|apartments?)\b|מלון/i;
  const checkIn = near(t, /check-?in|צ'?ק[- ]?אין|כניסה|הגעה/, /(\d{1,2}[./]\d{1,2}[./]\d{2,4}|20\d{2}-\d{2}-\d{2}|\d{1,2}\s*[A-Za-z\u05d0-\u05ea]{3,9}\.?\s*20\d{2})/);
  const checkOut = near(t, /check-?out|צ'?ק[- ]?אאוט|עזיבה|יציאה מהמלון/, /(\d{1,2}[./]\d{1,2}[./]\d{2,4}|20\d{2}-\d{2}-\d{2}|\d{1,2}\s*[A-Za-z\u05d0-\u05ea]{3,9}\.?\s*20\d{2})/);

  if (e.flight_number || e.origin) {
    e.kind = 'flight';
    e.date = dates[0] ?? null;
    e.departure_time = times[0] ?? null;
    e.arrival_time = times[1] ?? null;
  } else if (hotelWord.test(t) || checkIn) {
    e.kind = 'hotel';
    const line = t.split('\n').map((l) => l.trim()).find((l) => hotelWord.test(l) && l.length < 80);
    e.hotel_name = line ? line.replace(/^(hotel name|שם המלון)\s*[:\-]\s*/i, '') : null;
    e.check_in = checkIn ? findDates(checkIn)[0] ?? null : dates[0] ?? null;
    e.check_out = checkOut ? findDates(checkOut)[0] ?? null : dates[1] ?? null;
    const addr = t.split('\n').map((l) => l.trim()).find((l) => /\d/.test(l) && /(rue|street|st\.|via|calle|straße|strasse|avenue|av\.|road|רחוב|רח')/i.test(l));
    e.address = addr ?? null;
  }
  return e;
}

/** Which illustrated city a document points to, if any. */
export function destinationCity(e: Extraction): CityKey | null {
  const q = e.kind === 'flight' ? e.destination : e.address?.split(',').slice(-2).map((s) => s.replace(/\d+/g, '').trim()).find((s) => resolveCityKey(s) !== 'generic') ?? null;
  if (!q) return null;
  const k = resolveCityKey(q);
  return k === 'generic' ? null : k;
}

export function hasUsefulFields(e: Extraction): boolean {
  return e.kind !== 'unknown';
}
