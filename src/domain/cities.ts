import type { CityKey } from './types';

export interface CityInfo {
  key: Exclude<CityKey, 'generic'>;
  en: string;
  he: string;
  country: string; // ISO 3166-1 alpha-2
  landmarkHe: string;
  aliases: string[]; // lowercase extra names and main airport IATA codes
}

/** The 30 illustrated capitals. Anything else falls back to the generic board. */
export const CITIES: CityInfo[] = [
  { key: 'paris', en: 'Paris', he: 'פריז', country: 'FR', landmarkHe: 'מגדל אייפל', aliases: ['cdg', 'ory'] },
  { key: 'rome', en: 'Rome', he: 'רומא', country: 'IT', landmarkHe: 'הקולוסיאום', aliases: ['roma', 'fco', 'cia'] },
  { key: 'london', en: 'London', he: 'לונדון', country: 'GB', landmarkHe: 'ביג בן', aliases: ['lhr', 'lgw', 'stn', 'ltn'] },
  { key: 'amsterdam', en: 'Amsterdam', he: 'אמסטרדם', country: 'NL', landmarkHe: 'הרייקסמוזיאום', aliases: ['ams'] },
  { key: 'madrid', en: 'Madrid', he: 'מדריד', country: 'ES', landmarkHe: 'הארמון המלכותי', aliases: ['mad'] },
  { key: 'lisbon', en: 'Lisbon', he: 'ליסבון', country: 'PT', landmarkHe: 'מגדל בלם', aliases: ['lisboa', 'lis'] },
  { key: 'berlin', en: 'Berlin', he: 'ברלין', country: 'DE', landmarkHe: 'שער ברנדנבורג', aliases: ['ber'] },
  { key: 'vienna', en: 'Vienna', he: 'וינה', country: 'AT', landmarkHe: 'קתדרלת סטפן הקדוש', aliases: ['wien', 'vie'] },
  { key: 'prague', en: 'Prague', he: 'פראג', country: 'CZ', landmarkHe: 'טירת פראג', aliases: ['praha', 'prg'] },
  { key: 'budapest', en: 'Budapest', he: 'בודפשט', country: 'HU', landmarkHe: 'בניין הפרלמנט', aliases: ['bud'] },
  { key: 'athens', en: 'Athens', he: 'אתונה', country: 'GR', landmarkHe: 'האקרופוליס', aliases: ['athina', 'ath'] },
  { key: 'dublin', en: 'Dublin', he: 'דבלין', country: 'IE', landmarkHe: 'בית המכס', aliases: ['dub'] },
  { key: 'brussels', en: 'Brussels', he: 'בריסל', country: 'BE', landmarkHe: 'האטומיום', aliases: ['bruxelles', 'bru'] },
  { key: 'copenhagen', en: 'Copenhagen', he: 'קופנהגן', country: 'DK', landmarkHe: 'בת הים הקטנה', aliases: ['cph'] },
  { key: 'stockholm', en: 'Stockholm', he: 'שטוקהולם', country: 'SE', landmarkHe: 'בניין העירייה', aliases: ['arn'] },
  { key: 'oslo', en: 'Oslo', he: 'אוסלו', country: 'NO', landmarkHe: 'בית האופרה', aliases: ['osl'] },
  { key: 'warsaw', en: 'Warsaw', he: 'ורשה', country: 'PL', landmarkHe: 'ארמון התרבות והמדע', aliases: ['warszawa', 'waw'] },
  { key: 'bern', en: 'Bern', he: 'ברן', country: 'CH', landmarkHe: 'מגדל השעון', aliases: ['berne', 'brn'] },
  { key: 'helsinki', en: 'Helsinki', he: 'הלסינקי', country: 'FI', landmarkHe: 'קתדרלת הלסינקי', aliases: ['hel'] },
  { key: 'reykjavik', en: 'Reykjavik', he: 'רייקיאוויק', country: 'IS', landmarkHe: 'כנסיית הלגרימס', aliases: ['reykjavík', 'kef'] },
  { key: 'tokyo', en: 'Tokyo', he: 'טוקיו', country: 'JP', landmarkHe: 'מגדל טוקיו', aliases: ['hnd', 'nrt'] },
  { key: 'seoul', en: 'Seoul', he: 'סיאול', country: 'KR', landmarkHe: 'ארמון גיונגבוקגונג', aliases: ['icn', 'gmp'] },
  { key: 'bangkok', en: 'Bangkok', he: 'בנגקוק', country: 'TH', landmarkHe: 'וואט ארון', aliases: ['bkk', 'dmk'] },
  { key: 'beijing', en: 'Beijing', he: 'בייג׳ינג', country: 'CN', landmarkHe: 'העיר האסורה', aliases: ['בייג\'ינג', 'peking', 'pek', 'pkx'] },
  { key: 'washington', en: 'Washington D.C.', he: 'וושינגטון', country: 'US', landmarkHe: 'הקפיטול', aliases: ['washington', 'washington dc', 'washington d.c.', 'dc', 'iad', 'dca'] },
  { key: 'ottawa', en: 'Ottawa', he: 'אוטווה', country: 'CA', landmarkHe: 'גבעת הפרלמנט', aliases: ['yow'] },
  { key: 'mexico-city', en: 'Mexico City', he: 'מקסיקו סיטי', country: 'MX', landmarkHe: 'ארמון האמנויות', aliases: ['ciudad de mexico', 'ciudad de méxico', 'cdmx', 'mex'] },
  { key: 'buenos-aires', en: 'Buenos Aires', he: 'בואנוס איירס', country: 'AR', landmarkHe: 'האובליסק', aliases: ['eze', 'aep'] },
  { key: 'cairo', en: 'Cairo', he: 'קהיר', country: 'EG', landmarkHe: 'הפירמידות', aliases: ['cai'] },
  { key: 'canberra', en: 'Canberra', he: 'קנברה', country: 'AU', landmarkHe: 'בית הפרלמנט', aliases: ['cbr'] },
];

const INDEX = new Map<string, CityInfo>();
for (const c of CITIES) for (const n of [c.key, c.en, c.he, ...c.aliases]) INDEX.set(n.toLowerCase(), c);

/** Resolve a destination string (English/Hebrew name, alias or airport code, optionally with ", Country") to a board. */
export function resolveCityKey(destination: string): CityKey {
  const q = destination.trim().toLowerCase();
  const hit = INDEX.get(q) ?? INDEX.get(q.split(',')[0].trim());
  return hit ? hit.key : 'generic';
}

export function cityInfo(key: CityKey): CityInfo | undefined {
  return CITIES.find((c) => c.key === key);
}
