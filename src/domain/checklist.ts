import type { ChecklistCategory, ChecklistItem, TripBundle } from './types';
import { eachDate } from './time';

export const CHECK_CATEGORIES: ChecklistCategory[] = ['documents', 'clothes', 'electronics', 'health', 'other'];

const norm = (s: string) => s.replace(/[\s\-'"׳״().]/g, '').toLowerCase();

export function toggleItem(list: ChecklistItem[], id: string): ChecklistItem[] {
  return list.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
}

export function removeItem(list: ChecklistItem[], id: string): ChecklistItem[] {
  return list.filter((c) => c.id !== id).map((c, i) => ({ ...c, orderIndex: i }));
}

let seq = 0;
export function addItem(list: ChecklistItem[], tripId: string, label: string, category: ChecklistCategory): ChecklistItem[] {
  const clean = label.trim().slice(0, 80);
  if (!clean || list.some((c) => norm(c.label) === norm(clean))) return list;
  const id = `ck-u-${Date.now().toString(36)}-${(seq++).toString(36)}`;
  return [...list, { id, tripId, category, label: clean, done: false, orderIndex: list.length }];
}

/** Power plug types by country (IEC). Only countries the app ships cities for, plus common extras. */
const PLUGS: Record<string, string> = {
  FR: 'E', BE: 'E', CZ: 'E', PL: 'E', SK: 'E',
  DE: 'F', AT: 'F', NL: 'F', ES: 'F', PT: 'F', HU: 'F', GR: 'F', SE: 'F', NO: 'F', FI: 'F', DK: 'F/K', RU: 'F', TR: 'F', HR: 'F', RO: 'F',
  IT: 'L/F', CH: 'J', GB: 'G', IE: 'G', MT: 'G', CY: 'G', AE: 'G', SG: 'G', HK: 'G',
  US: 'A/B', CA: 'A/B', MX: 'A/B', JP: 'A', TH: 'A/C', AR: 'I', AU: 'I', CN: 'A/I', IN: 'D', BR: 'N', EG: 'C', MA: 'E', IL: 'H',
};
/** Suggest an adapter for any non-Israeli destination; the socket type is shown so the user buys the right one. */
export function plugAdvice(country: string): string | null {
  const t = PLUGS[country];
  if (!t || country === 'IL') return null;
  return `מתאם חשמל (Type ${t})`;
}

export interface ChecklistSuggestion {
  label: string;
  category: ChecklistCategory;
  reason: string;
}

/** Trip-aware suggestions, skipping anything already on the list (fuzzy label match). */
export function suggestItems(bundle: TripBundle): ChecklistSuggestion[] {
  const { trip } = bundle;
  const out: ChecklistSuggestion[] = [];
  const nights = Math.max(1, eachDate(trip.startDate, trip.endDate).length - 1);
  const intl = bundle.flights.length > 0 && trip.country !== 'IL';
  if (intl) out.push({ label: 'דרכון', category: 'documents', reason: 'טיסה לחו״ל' });
  if (bundle.flights.length) out.push({ label: 'כרטיסי טיסה', category: 'documents', reason: `${bundle.flights.length} טיסות בטיול` });
  if (bundle.hotels.length) out.push({ label: 'אישור מלון', category: 'documents', reason: bundle.hotels[0].name });
  if (bundle.insurance.length) out.push({ label: 'ביטוח נסיעות', category: 'documents', reason: bundle.insurance[0].provider });
  if (bundle.carRentals.length) {
    out.push({ label: 'רישיון נהיגה', category: 'documents', reason: `השכרת רכב ב-${bundle.carRentals[0].company}` });
    out.push({ label: 'רישיון נהיגה בינלאומי', category: 'documents', reason: 'חלק מחברות ההשכרה דורשות' });
    out.push({ label: 'כרטיס אשראי לפיקדון', category: 'documents', reason: 'פיקדון על הרכב' });
  }
  const tickets = bundle.activities.filter((a) => a.ticketStatus === 'purchased').length + bundle.events.length;
  if (tickets) out.push({ label: 'כרטיסי כניסה והזמנות', category: 'documents', reason: `${tickets} כרטיסים והזמנות` });
  const plug = plugAdvice(trip.country);
  if (plug) out.push({ label: plug, category: 'electronics', reason: `שקעים ב${trip.destination}` });
  out.push({ label: 'סוללה ניידת', category: 'electronics', reason: 'ימים ארוכים בחוץ' });
  out.push({ label: 'אוזניות', category: 'electronics', reason: 'לטיסה' });
  out.push({ label: 'תחתונים וגרביים', category: 'clothes', reason: `${nights + 1} זוגות ל-${nights} לילות` });
  if (bundle.activities.length + bundle.events.length >= 4) out.push({ label: 'נעלי הליכה', category: 'clothes', reason: `${bundle.activities.length} אטרקציות` });
  if (bundle.events.some((e) => e.kind === 'restaurant' || e.kind === 'show' || e.kind === 'theatre')) out.push({ label: 'בגד לערב', category: 'clothes', reason: 'מסעדה או הופעה בטיול' });
  out.push({ label: 'תרופות קבועות', category: 'health', reason: 'בכבודת היד' });
  out.push({ label: 'משכך כאבים', category: 'health', reason: 'ליתר ביטחון' });

  const have = new Set(bundle.checklist.map((c) => norm(c.label.replace(/\s*\(.*\)$/, ''))));
  const seen = new Set<string>();
  return out.filter((s) => {
    const k = norm(s.label.replace(/\s*\(.*\)$/, ''));
    if (have.has(k) || seen.has(k) || [...have].some((h) => h.startsWith(k) || k.startsWith(h))) return false;
    seen.add(k);
    return true;
  });
}
