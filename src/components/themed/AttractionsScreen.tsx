import { useMemo, useState } from 'react';
import type { Activity, CityKey, TripBundle } from '@/domain/types';
import { CATEGORIES } from '@/domain/categories';
import { cityInfo } from '@/domain/cities';
import { formatTime, shortDate } from '@/domain/time';
import { AnimatePresence, motion } from '@/ui/motion';
import { Clock, FileText, MapPin, Ticket, Timer } from '@/ui/icons';
import { CityCrop, ThemedHero } from './CityCrop';

type Filter = 'all' | 'purchased' | 'needed' | 'flex';
const FILTERS: [Filter, string][] = [
  ['all', 'הכל'],
  ['purchased', 'יש כרטיס'],
  ['needed', 'צריך כרטיס'],
  ['flex', 'בלי תאריך'],
];
const MONTHS = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'];

function isLandmark(a: Activity, landmarkHe?: string) {
  return Boolean(landmarkHe && (a.name.includes(landmarkHe) || landmarkHe.includes(a.name)));
}

/** Ticket-stub card: date stub on the right, perforation, details on the left. */
function Stub({ a, tz, onOpen, landmark }: { a: Activity; tz: string; onOpen: () => void; landmark: boolean }) {
  const d = a.date ? new Date(`${a.date}T12:00:00Z`) : null;
  const tone = a.ticketStatus === 'purchased' ? { bg: '#e11d48', soft: '#fff1f3', t: 'יש כרטיס' } : a.ticketStatus === 'needed' ? { bg: '#f59e0b', soft: '#fff8eb', t: 'צריך כרטיס' } : { bg: '#94a3b8', soft: '#f5f7fa', t: 'כניסה חופשית' };
  return (
    <motion.button whileTap={{ scale: 0.97, rotate: -0.6 }} type="button" onClick={onOpen} className="relative flex w-full overflow-hidden rounded-2xl text-right shadow-[0_10px_22px_-14px_rgba(225,29,72,.55)]" style={{ background: tone.soft }}>
      <div className="flex w-16 shrink-0 flex-col items-center justify-center py-3 text-white" style={{ background: tone.bg }}>
        {d ? (
          <>
            <span className="text-2xl font-black leading-none">{d.getUTCDate()}</span>
            <span className="text-[10px] font-bold opacity-90">{MONTHS[d.getUTCMonth()]}</span>
          </>
        ) : (
          <span className="text-[11px] font-bold">גמיש</span>
        )}
      </div>
      <div className="relative w-3 shrink-0" aria-hidden>
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white" />
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white" />
        <span className="absolute inset-y-2 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dotted border-slate-300" />
      </div>
      <div className="min-w-0 flex-1 py-2.5 pl-3">
        <div className="flex items-center gap-1.5">
          {landmark && <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-black text-amber-700">★ לנדמרק</span>}
          <p className="truncate text-[15px] font-black text-ink">{a.name}</p>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-soft">
          <Clock size={11} aria-hidden />
          {a.startAt ? formatTime(a.startAt, tz) : a.openingHours ? `פתוח ${a.openingHours.open}–${a.openingHours.close}` : 'שעה גמישה'}
          {a.durationMinutes ? ` · ${Math.round((a.durationMinutes / 60) * 10) / 10} שע׳` : ''}
        </p>
        <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: tone.bg }}>
          {tone.t}
        </span>
      </div>
    </motion.button>
  );
}

function ActivityDetail({ a, bundle, city, onBack, onOpenDocs, landmark }: { a: Activity; bundle: TripBundle; city: CityKey; onBack: () => void; onOpenDocs?: () => void; landmark: boolean }) {
  const tz = bundle.trip.timezone;
  const doc = bundle.documents.find((d) => d.linkedId === a.id);
  const day = a.date ? bundle.itinerary.filter((i) => i.date === a.date).sort((x, y) => x.startAt.localeCompare(y.startAt)) : [];
  return (
    <motion.div initial={{ opacity: 0.4, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
      <div className="relative -mx-5 -mt-8">
        <CityCrop city={city} at={landmark ? { x: 66, y: 36 } : { x: 50, y: 50 }} fw={landmark ? 0.6 : 0.8} ratio={0.72} className="rounded-t-4xl">
          {!landmark && <div className="absolute inset-0 bg-rose-900/30 backdrop-blur-[2px]" />}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
          {!landmark && (
            <span className="tc-float absolute left-1/2 top-[34%] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-3xl bg-white/90 text-cat-attractions shadow-pin">
              <Ticket size={30} aria-hidden />
            </span>
          )}
        </CityCrop>
        <button type="button" onClick={onBack} className="absolute right-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur">
          → כל האטרקציות
        </button>
      </div>
      <div className="relative z-10 -mt-6 flex items-center gap-2">
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">אטרקציה</span>
        {landmark && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">★ הלנדמרק של העיר</span>}
      </div>
      <h3 className="mt-1 text-2xl font-black text-ink">{a.name}</h3>
      {a.address && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
          <MapPin size={13} aria-hidden /> {a.address}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 divide-x divide-x-reverse divide-rose-100 rounded-2xl bg-rose-50/60 py-3 text-center">
        <div>
          <Timer size={18} className="mx-auto text-rose-500" aria-hidden />
          <p className="mt-1 text-[11px] font-bold text-ink">{a.durationMinutes ? `${Math.round((a.durationMinutes / 60) * 10) / 10} שעות` : '—'}</p>
        </div>
        <div>
          <Ticket size={18} className="mx-auto text-rose-500" aria-hidden />
          <p className="mt-1 text-[11px] font-bold text-ink">{a.ticketStatus === 'purchased' ? 'יש כרטיס' : a.ticketStatus === 'needed' ? 'צריך לקנות' : 'בלי כרטיס'}</p>
        </div>
        <div>
          <Clock size={18} className="mx-auto text-rose-500" aria-hidden />
          <p className="mt-1 text-[11px] font-bold text-ink">{a.startAt ? `${shortDate(a.date!)} · ${formatTime(a.startAt, tz)}` : a.openingHours ? `${a.openingHours.open}–${a.openingHours.close}` : 'גמיש'}</p>
        </div>
      </div>

      {a.ticketStatus === 'purchased' && (
        <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={onOpenDocs} className="mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-cat-attractions text-sm font-black text-white shadow-[0_12px_24px_-12px_rgba(225,29,72,.9)]">
          <FileText size={17} aria-hidden /> {doc ? 'הצג כרטיס' : 'צרף את הכרטיס'}
        </motion.button>
      )}

      {day.length > 0 && (
        <section className="mt-5">
          <p className="mb-2 text-xs font-bold text-ink-soft">היום הזה במסלול</p>
          <ol className="relative space-y-1.5 border-r-2 border-dashed border-rose-200 pr-4">
            {day.map((i) => {
              const me = i.referenceId === a.id;
              return (
                <li key={i.id} className={`relative rounded-xl px-3 py-2 text-xs ${me ? 'bg-cat-attractions font-black text-white' : 'bg-slate-50 text-ink-soft'}`}>
                  <span className={`absolute -right-[23px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-white ${me ? 'bg-cat-attractions' : 'bg-rose-200'}`} />
                  <span className="font-bold" dir="ltr">
                    {formatTime(i.startAt, tz)}
                  </span>{' '}
                  · {i.title}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </motion.div>
  );
}

export function AttractionsScreen({ bundle, city, onOpenDocs }: { bundle: TripBundle; city: CityKey; onOpenDocs?: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Activity | null>(null);
  const info = cityInfo(city);
  const tz = bundle.trip.timezone;
  const list = useMemo(() => {
    const sorted = [...bundle.activities].sort((a, b) => (a.startAt ?? 'z').localeCompare(b.startAt ?? 'z'));
    return sorted.filter((a) => (filter === 'all' ? true : filter === 'flex' ? !a.startAt : a.ticketStatus === filter));
  }, [bundle.activities, filter]);
  const withTicket = bundle.activities.filter((a) => a.ticketStatus === 'purchased').length;

  return (
    <>
      {open ? (
        <ActivityDetail key="d" a={open} bundle={bundle} city={city} onBack={() => setOpen(null)} onOpenDocs={onOpenDocs} landmark={isLandmark(open, info?.landmarkHe)} />
      ) : (
        <motion.div key="l" initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <ThemedHero
            city={city}
            spot="landmark"
            fw={0.72}
            ratio={0.56}
            color={CATEGORIES.attractions.color}
            icon={<Ticket size={26} aria-hidden />}
            title="אטרקציות"
            subtitle={`${bundle.activities.length} מקומות · ${withTicket} עם כרטיס`}
            chip={info?.landmarkHe ? <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-rose-600 shadow-sm backdrop-blur">★ {info.landmarkHe}</span> : undefined}
          />
          <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
            {FILTERS.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${filter === k ? 'text-white' : 'bg-rose-50 text-rose-700'}`}>
                {filter === k && <motion.span layoutId="attr-filter" className="absolute inset-0 rounded-full bg-cat-attractions" transition={{ type: 'spring', damping: 26, stiffness: 380 }} />}
                <span className="relative">{l}</span>
              </button>
            ))}
          </div>
          <motion.ul layout className="mt-3 space-y-2.5">
            <AnimatePresence initial={false}>
              {list.map((a, i) => (
                <motion.li key={a.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i, 8) * 0.035 } }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Stub a={a} tz={tz} onOpen={() => setOpen(a)} landmark={isLandmark(a, info?.landmarkHe)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </motion.div>
      )}
    </>
  );
}
