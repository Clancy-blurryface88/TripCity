import { useRef, useState } from 'react';
import { destinationCity, parseTravelText, type Extraction } from '@/ai/extract';
import { extractPdfText } from '@/services/pdfText';
import { cityInfo } from '@/domain/cities';
import type { CityKey } from '@/domain/types';
import { Camera, Check, FileText, Hash, PencilLine, Sparkles, Upload } from '@/ui/icons';

export type AddMethod = 'camera' | 'gallery' | 'pdf' | 'paste' | 'flight' | 'manual';
export interface PickedFile {
  name: string;
  mime: string;
  size: number;
}
export interface SaveResult {
  extraction: Extraction;
  file?: PickedFile;
  city: CityKey | null;
}

type Step = { s: 'choose' } | { s: 'paste' } | { s: 'flight' } | { s: 'reading'; name: string } | { s: 'review'; e: Extraction; file?: PickedFile; note?: string; auto: boolean };

const EMPTY: Extraction = {
  kind: 'flight', airline: null, flight_number: null, origin: null, destination: null, date: null, departure_time: null,
  arrival_time: null, departure_terminal: null, gate: null, booking_reference: null, hotel_name: null, check_in: null, check_out: null, address: null,
};

const SAMPLE = `El Al booking confirmation
Booking reference: R8M4TZ
Flight LY 385  TLV - FCO
20/10/2027  Departure 07:15  Arrival 10:05
Terminal 3`;

const FLIGHT_FIELDS: Array<[keyof Extraction, string, boolean?]> = [
  ['airline', 'חברת תעופה'], ['flight_number', 'מספר טיסה', true], ['origin', 'מוצא (קוד שדה)', true], ['destination', 'יעד (קוד שדה)', true],
  ['date', 'תאריך', true], ['departure_time', 'שעת המראה', true], ['arrival_time', 'שעת נחיתה', true], ['departure_terminal', 'טרמינל', true],
  ['gate', 'שער', true], ['booking_reference', 'קוד הזמנה', true],
];
const HOTEL_FIELDS: Array<[keyof Extraction, string, boolean?]> = [
  ['hotel_name', 'שם המלון'], ['address', 'כתובת'], ['check_in', "צ'ק-אין", true], ['check_out', "צ'ק-אאוט", true], ['booking_reference', 'מספר הזמנה', true],
];

export function AddDocument(props: Parameters<typeof AddDocumentInner>[0]) {
  return <div className="pt-9"><AddDocumentInner {...props} /></div>;
}

function AddDocumentInner({ initial = 'choose', onSave, onDone }: { initial?: AddMethod | 'choose'; onSave: (r: SaveResult) => void; onDone: () => void }) {
  const [step, setStep] = useState<Step>(initial === 'paste' ? { s: 'paste' } : initial === 'flight' ? { s: 'flight' } : initial === 'manual' ? { s: 'review', e: EMPTY, auto: false } : { s: 'choose' });
  const [text, setText] = useState('');
  const [saved, setSaved] = useState<SaveResult | null>(null);
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);
  const pdf = useRef<HTMLInputElement>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    const file = { name: f.name, mime: f.type || 'application/octet-stream', size: f.size };
    setStep({ s: 'reading', name: f.name });
    let e: Extraction | null = null;
    let note: string | undefined;
    if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
      const t = await extractPdfText(await f.arrayBuffer()).catch(() => '');
      const p = parseTravelText(t);
      if (p.kind !== 'unknown') e = p;
      else note = 'לא הצלחתי לקרוא טקסט מה-PDF הזה (כנראה סרוק). קריאה מלאה עם OCR ו-AI תעבוד אחרי חיבור השרת. בינתיים אפשר למלא ידנית.';
    } else {
      const p = parseTravelText(f.name.replace(/[_.-]+/g, ' '));
      if (p.kind !== 'unknown') e = p;
      note = 'קריאת תמונות (OCR + AI) תעבוד אחרי חיבור השרת. בינתיים אפשר למלא ידנית, או לנסות עם טקסט מודבק.';
    }
    setTimeout(() => setStep({ s: 'review', e: e ?? EMPTY, file, note, auto: !!e }), 500);
  }

  if (saved) {
    const c = saved.city ? cityInfo(saved.city) : undefined;
    const e = saved.extraction;
    return (
      <div className="py-4 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={28} /></div>
        <p className="mt-3 text-base font-bold text-ink">{e.kind === 'hotel' ? 'המלון נוסף לטיול' : 'הטיסה נוספה לטיול'}</p>
        <p className="mt-1 text-sm text-ink-soft">{e.kind === 'hotel' ? e.hotel_name : `${e.flight_number ?? ''} ${e.origin ?? ''} → ${e.destination ?? ''}`}</p>
        {c && <p className="mt-3 rounded-2xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800">זיהיתי שהיעד הוא {c.he}, והעיר התחלפה ל{c.he} 🏙️</p>}
        <button onClick={onDone} className="mt-5 w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white">חזרה לעיר</button>
      </div>
    );
  }

  if (step.s === 'choose') {
    const opts = [
      { l: 'צילום', sub: 'מצלמה', I: Camera, on: () => cam.current?.click() },
      { l: 'תמונה', sub: 'מהגלריה', I: Upload, on: () => gal.current?.click() },
      { l: 'PDF', sub: 'כרטיס או אישור', I: FileText, on: () => pdf.current?.click() },
      { l: 'הדבקת טקסט', sub: 'ממייל אישור', I: PencilLine, on: () => setStep({ s: 'paste' }) },
      { l: 'מספר טיסה', sub: 'למשל LY381', I: Hash, on: () => setStep({ s: 'flight' }) },
      { l: 'ידני', sub: 'מילוי שדות', I: PencilLine, on: () => setStep({ s: 'review', e: EMPTY, auto: false }) },
    ];
    return (
      <div>
        <p className="mb-3 text-sm text-ink-soft">מעלים כרטיס טיסה או אישור מלון, והאפליקציה מוצאת את הפרטים ומוסיפה לטיול.</p>
        <div className="grid grid-cols-3 gap-2">
          {opts.map(({ l, sub, I, on }) => (
            <button key={l} type="button" onClick={on} className="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 px-1 py-3 active:bg-slate-100">
              <I size={20} className="text-brand" aria-hidden />
              <span className="text-[13px] font-bold text-ink">{l}</span>
              <span className="text-[10px] text-ink-soft">{sub}</span>
            </button>
          ))}
        </div>
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(ev) => onFile(ev.target.files?.[0])} />
        <input ref={gal} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(ev) => onFile(ev.target.files?.[0])} />
        <input ref={pdf} type="file" accept="application/pdf" hidden onChange={(ev) => onFile(ev.target.files?.[0])} />
      </div>
    );
  }

  if (step.s === 'paste' || step.s === 'flight') {
    const isFlight = step.s === 'flight';
    return (
      <div>
        <p className="mb-2 text-sm text-ink-soft">{isFlight ? 'הקלד מספר טיסה, ואם יש גם מסלול ותאריך (למשל LY381 TLV-CDG 12/04/2027).' : 'הדבק כאן את הטקסט ממייל האישור של הטיסה או המלון.'}</p>
        {isFlight ? (
          <input dir="ltr" value={text} onChange={(e) => setText(e.target.value.toUpperCase())} placeholder="LY381" className="w-full rounded-2xl border border-slate-200 px-3 py-3 text-base font-semibold tracking-wide" />
        ) : (
          <textarea dir="auto" value={text} onChange={(e) => setText(e.target.value)} rows={7} placeholder="Booking reference… Flight… TLV - CDG…" className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
        )}
        {!isFlight && (
          <button type="button" onClick={() => setText(SAMPLE)} className="mt-2 text-xs font-semibold text-brand">נסה עם טקסט לדוגמה</button>
        )}
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => {
            const e = parseTravelText(text);
            setStep({ s: 'review', e: e.kind === 'unknown' ? EMPTY : e, auto: e.kind !== 'unknown', note: e.kind === 'unknown' ? 'לא מצאתי פרטי טיסה או מלון בטקסט. אפשר למלא ידנית.' : undefined });
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          <Sparkles size={16} aria-hidden /> מצא את הפרטים
        </button>
      </div>
    );
  }

  if (step.s === 'reading') {
    return (
      <div className="py-8 text-center">
        <Sparkles className="mx-auto animate-pulse text-brand" size={28} />
        <p className="mt-3 text-sm font-semibold text-ink">קורא את {step.name}…</p>
      </div>
    );
  }

  const e = step.e;
  const fields = e.kind === 'hotel' ? HOTEL_FIELDS : FLIGHT_FIELDS;
  const set = (k: keyof Extraction, v: string) => setStep({ ...step, e: { ...e, [k]: v || null } as Extraction });
  const city = destinationCity(e);
  const valid = e.kind === 'hotel' ? !!(e.hotel_name && e.check_in && e.check_out) : !!(e.flight_number && e.origin && e.destination && e.date && e.departure_time);
  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['flight', 'hotel'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setStep({ ...step, e: { ...e, kind: k } })} className={`flex-1 rounded-full py-1.5 text-xs font-bold ${e.kind === k ? 'bg-brand text-white' : 'bg-slate-100 text-ink-soft'}`}>
            {k === 'flight' ? 'טיסה' : 'מלון'}
          </button>
        ))}
      </div>
      {step.auto ? (
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink"><Sparkles size={15} className="text-brand" aria-hidden /> מצאנו את הפרטים האלה</p>
      ) : (
        <p className="mb-2 text-sm font-bold text-ink">מלא את הפרטים</p>
      )}
      {step.note && <p className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{step.note}</p>}
      {step.file && <p className="mb-2 flex items-center gap-1.5 text-xs text-ink-soft"><FileText size={14} aria-hidden /> <span dir="ltr">{step.file.name}</span></p>}
      <div className="space-y-2">
        {fields.map(([k, l, ltr]) => (
          <label key={k} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
            <span className="w-24 shrink-0 text-xs text-ink-soft">{l}</span>
            <input
              dir={ltr ? 'ltr' : 'auto'}
              value={(e[k] as string | null) ?? ''}
              onChange={(ev) => set(k, ev.target.value)}
              placeholder={k === 'date' || k === 'check_in' || k === 'check_out' ? 'YYYY-MM-DD' : k.endsWith('time') ? 'HH:MM' : ''}
              className={`min-w-0 flex-1 bg-transparent py-1 text-sm font-semibold text-ink outline-none ${ltr ? 'text-left' : ''}`}
            />
          </label>
        ))}
      </div>
      {city && <p className="mt-2 text-xs text-sky-700">היעד: {cityInfo(city)?.he}. אחרי האישור העיר תתחלף.</p>}
      <button
        type="button"
        disabled={!valid}
        onClick={() => {
          const r = { extraction: e, file: step.file, city };
          onSave(r);
          setSaved(r);
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-40"
      >
        <Check size={16} aria-hidden /> אישור והוספה לטיול
      </button>
    </div>
  );
}
