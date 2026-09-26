import type { CityKey, TripBundle, TripDocument } from '@/domain/types';
import { BedDouble, Camera, FileText, Plane, Plus, Ticket, TrainFront, Upload, type LucideIcon } from '@/ui/icons';
import { motion } from '@/ui/motion';
import { PageHero } from './themed/CityCrop';

const GROUPS: Array<{ l: string; types: Array<TripDocument['linkedType']>; color: string; tint: string; Icon: LucideIcon }> = [
  { l: 'טיסות', types: ['flight'], color: '#2f80ed', tint: '#eaf2fe', Icon: Plane },
  { l: 'מלונות', types: ['hotel_check_in', 'hotel_check_out'], color: '#8b5cf6', tint: '#f3eefe', Icon: BedDouble },
  { l: 'אטרקציות ואירועים', types: ['activity', 'event'], color: '#e11d48', tint: '#fdecef', Icon: Ticket },
  { l: 'תחבורה ורכב', types: ['transport', 'car_pickup', 'car_dropoff'], color: '#16a34a', tint: '#e9f7ee', Icon: TrainFront },
];
const OTHER = { l: 'אחר', color: '#64748b', tint: '#f1f5f9', Icon: FileText };

function linkedName(b: TripBundle, d: TripDocument): string | undefined {
  if (!d.linkedId) return undefined;
  const f = b.flights.find((x) => x.id === d.linkedId);
  if (f) return `${f.flightNumber} · ${f.origin} → ${f.destination}`;
  return b.hotels.find((x) => x.id === d.linkedId)?.name ?? b.activities.find((x) => x.id === d.linkedId)?.name ?? b.events.find((x) => x.id === d.linkedId)?.name;
}

export function DocumentsView({ bundle, onAdd, fresh, city }: { bundle: TripBundle; onAdd: () => void; fresh?: Set<string>; city?: CityKey }) {
  const docs = bundle.documents;
  const other = docs.filter((d) => !GROUPS.some((g) => g.types.includes(d.linkedType)));
  const groups = [...GROUPS.map((g) => ({ ...g, items: docs.filter((d) => g.types.includes(d.linkedType)) })), { ...OTHER, items: other }].filter((g) => g.items.length);
  let n = 0;
  return (
    <div className="px-4 pb-32 pt-2">
      <PageHero
        city={city ?? bundle.trip.cityKey}
        at={{ x: 40, y: 22 }}
        fw={0.75}
        color="#0f766e"
        icon={<FileText size={24} aria-hidden />}
        title="המסמכים"
        subtitle={`${bundle.trip.name} · ${docs.length} מסמכים`}
        stamp={<><p className="text-lg font-black leading-none">{docs.length}</p><p className="text-[8px] font-black tracking-wider">DOCS</p></>}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={onAdd} className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-sm font-black text-white shadow-[0_12px_22px_-14px_rgba(13,148,136,.9)]">
          <Camera size={20} aria-hidden /> צלם מסמך
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={onAdd} className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-300 bg-white text-sm font-black text-teal-700">
          <Upload size={20} aria-hidden /> העלה קובץ
        </motion.button>
      </div>

      {groups.map((g) => (
        <section key={g.l} className="relative mt-6">
          <div className="relative z-10 -mb-3 me-auto flex w-fit items-center gap-1.5 rounded-t-2xl px-3.5 pb-4 pt-1.5 text-xs font-black text-white" style={{ background: g.color }}>
            <g.Icon size={14} aria-hidden /> {g.l}
            <span className="rounded-full bg-white/25 px-1.5 text-[10px]">{g.items.length}</span>
          </div>
          <ul className="relative z-20 space-y-2 rounded-3xl p-2.5 ring-1 ring-black/5" style={{ background: g.tint }}>
            {g.items.map((d) => {
              const k = n++;
              const pdf = d.mimeType === 'application/pdf';
              return (
                <motion.li key={d.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * k }} className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_4px_12px_-8px_rgba(31,42,68,.4)]">
                  <span className="absolute inset-y-0 right-0 w-1.5" style={{ background: g.color }} aria-hidden />
                  <span className="relative grid h-12 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                    <span className="absolute left-0 top-0 h-3 w-3 rounded-br-md bg-slate-200" aria-hidden />
                    <span className={`mt-3 rounded px-1 text-[8px] font-black text-white ${pdf ? 'bg-rose-500' : 'bg-sky-500'}`}>{pdf ? 'PDF' : 'IMG'}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-ink">{d.title}</p>
                    <p className="truncate text-[11px] font-medium" style={{ color: g.color }} dir="auto">{linkedName(bundle, d) ?? 'לא מקושר'}</p>
                  </div>
                  {fresh?.has(d.id) ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">חדש</motion.span>
                  ) : (
                    d.sizeBytes ? <span className="text-[10px] text-ink-faint" dir="ltr">{Math.round(d.sizeBytes / 1000)}KB</span> : null
                  )}
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}
      {!docs.length && (
        <button type="button" onClick={onAdd} className="mt-6 flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 bg-white/70 p-8 text-sm text-ink-soft">
          <Plus size={28} aria-hidden /> עוד אין מסמכים. צלם כרטיס טיסה, אישור מלון או כרטיס כניסה.
        </button>
      )}
      <p className="mt-4 text-center text-[11px] text-ink-faint">PDF · JPG · PNG · WebP · כל מסמך מקושר לפריט בטיול</p>
    </div>
  );
}
