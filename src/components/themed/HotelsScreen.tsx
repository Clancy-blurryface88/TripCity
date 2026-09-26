import { useState } from 'react';
import type { CityKey, Hotel, TripBundle } from '@/domain/types';
import { CATEGORIES } from '@/domain/categories';
import { cityInfo } from '@/domain/cities';
import { eachDate, formatTime, localDateOf, shortDate } from '@/domain/time';
import { motion } from '@/ui/motion';
import { BedDouble, ChevronLeft, Coffee, FileText, MapPin, Phone } from '@/ui/icons';
import { CityCrop, ThemedHero } from './CityCrop';

const WEEK = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function stayNights(h: Hotel, tz: string) {
  const d = eachDate(localDateOf(h.checkInAt, tz), localDateOf(h.checkOutAt, tz));
  return d.slice(0, -1);
}

/** Row of nights: each night is a little moon tile that lights up in sequence. */
function NightStrip({ h, tz }: { h: Hotel; tz: string }) {
  const nights = stayNights(h, tz);
  return (
    <div className="flex items-stretch gap-1" dir="rtl">
      {nights.map((d, i) => (
        <motion.div key={d} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }} className="flex flex-1 flex-col items-center rounded-xl bg-gradient-to-b from-[#312e81] to-[#6d28d9] py-1.5 text-white">
          <span className="text-[13px] leading-none">🌙</span>
          <span className="mt-1 text-[10px] font-bold opacity-90">{WEEK[new Date(`${d}T12:00:00Z`).getUTCDay()]}</span>
          <span className="text-[10px] opacity-75">{shortDate(d)}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** Room key card: booking number on a hotel key. Tilts slightly on press. */
function KeyCard({ h }: { h: Hotel }) {
  return (
    <motion.div whileTap={{ rotate: -2, scale: 0.98 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#a78bfa] p-4 text-white shadow-[0_18px_30px_-16px_rgba(124,58,237,.8)]">
      <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/10" aria-hidden />
      <div className="absolute -bottom-12 left-16 h-28 w-28 rounded-full bg-white/10" aria-hidden />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-80">Room key</p>
          <p className="mt-1 max-w-[190px] text-base font-black leading-tight">{h.name}</p>
        </div>
        <span className="grid h-9 w-11 place-items-center rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner" aria-hidden>
          <span className="h-5 w-7 rounded-sm border border-amber-600/40" />
        </span>
      </div>
      <p className="mt-5 text-[10px] opacity-80">מספר הזמנה</p>
      <p className="font-mono text-xl font-black tracking-[0.2em]" dir="ltr">
        {h.bookingNumber ?? '—'}
      </p>
      <div className="mt-3 h-2 rounded-full bg-black/25" aria-hidden />
    </motion.div>
  );
}

function HotelDetail({ h, bundle, city, onBack, onOpenDocs }: { h: Hotel; bundle: TripBundle; city: CityKey; onBack: () => void; onOpenDocs?: () => void }) {
  const tz = bundle.trip.timezone;
  const doc = bundle.documents.find((d) => d.linkedId === h.id);
  return (
    <motion.div initial={{ opacity: 0.4, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
      <div className="relative -mx-5 -mt-8">
        <CityCrop city={city} spot="hotel" fw={0.42} ratio={0.62} className="rounded-t-4xl">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
        </CityCrop>
        <button type="button" onClick={onBack} className="absolute right-4 top-4 z-20 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur">
          → כל המלונות
        </button>
      </div>
      <h3 className="relative z-10 -mt-6 text-2xl font-black text-ink">{h.name}</h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
        <MapPin size={13} aria-hidden /> {h.address}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ['צ׳ק-אין', h.checkInAt, 'from-emerald-50 to-white text-emerald-700'],
          ['צ׳ק-אאוט', h.checkOutAt, 'from-rose-50 to-white text-rose-700'],
        ].map(([l, iso, c]) => (
          <div key={l} className={`relative rounded-2xl bg-gradient-to-b p-3 ring-1 ring-slate-100 ${c}`}>
            <span className="absolute left-3 top-3 h-3 w-3 rounded-full bg-white ring-2 ring-current" aria-hidden />
            <p className="text-[11px] font-bold">{l}</p>
            <p className="text-lg font-black text-ink">{formatTime(iso, tz)}</p>
            <p className="text-[11px] text-ink-soft">{shortDate(localDateOf(iso, tz))}</p>
          </div>
        ))}
      </div>

      <p className="mb-1.5 mt-4 text-xs font-bold text-ink-soft">{stayNights(h, tz).length} לילות</p>
      <NightStrip h={h} tz={tz} />

      <div className="mt-4">
        <KeyCard h={h} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-ink">
        {h.notes && (
          <div className="rounded-2xl bg-amber-50 p-2.5">
            <Coffee size={18} className="mx-auto mb-1 text-amber-600" aria-hidden />
            {h.notes}
          </div>
        )}
        {h.phone && (
          <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="rounded-2xl bg-violet-50 p-2.5">
            <Phone size={18} className="mx-auto mb-1 text-violet-600" aria-hidden />
            להתקשר למלון
          </a>
        )}
        <button type="button" onClick={onOpenDocs} className="rounded-2xl bg-sky-50 p-2.5">
          <FileText size={18} className="mx-auto mb-1 text-sky-600" aria-hidden />
          {doc ? 'אישור הזמנה' : 'אין מסמך'}
        </button>
      </div>
    </motion.div>
  );
}

export function HotelsScreen({ bundle, city, onOpenDocs }: { bundle: TripBundle; city: CityKey; onOpenDocs?: () => void }) {
  const [open, setOpen] = useState<Hotel | null>(null);
  const tz = bundle.trip.timezone;
  const color = CATEGORIES.hotels.color;
  return (
    <>
      {open ? (
        <HotelDetail key="d" h={open} bundle={bundle} city={city} onBack={() => setOpen(null)} onOpenDocs={onOpenDocs} />
      ) : (
        <motion.div key="l" initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <ThemedHero city={city} spot="hotel" fw={0.55} ratio={0.56} color={color} icon={<BedDouble size={26} aria-hidden />} title={`מלונות ב${cityInfo(city)?.he ?? bundle.trip.destination}`} subtitle={`${bundle.hotels.length} הזמנות`} />
          <ul className="mt-4 space-y-3">
            {bundle.hotels.map((h, i) => (
              <motion.li key={h.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.07 }}>
                <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={() => setOpen(h)} className="flex w-full gap-3 rounded-3xl bg-white p-2.5 text-right shadow-soft ring-1 ring-violet-100">
                  <div className="relative w-28 shrink-0 overflow-hidden rounded-2xl">
                    <CityCrop city={city} spot="hotel" fw={0.3} ratio={1.05} animate={false} />
                    <span className="absolute bottom-1.5 right-1.5 rotate-[-8deg] rounded-md border-2 border-emerald-500 bg-white/90 px-1.5 text-[10px] font-black text-emerald-600">מאושר</span>
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <p className="truncate text-[15px] font-black text-ink">{h.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-soft">{h.address}</p>
                    <p className="mt-2 text-[11px] font-bold text-violet-700">
                      {shortDate(localDateOf(h.checkInAt, tz))} – {shortDate(localDateOf(h.checkOutAt, tz))} · {stayNights(h, tz).length} לילות
                    </p>
                    <div className="mt-1.5 flex gap-0.5" aria-hidden>
                      {stayNights(h, tz).map((d) => (
                        <span key={d} className="h-1.5 flex-1 rounded-full bg-violet-400" />
                      ))}
                    </div>
                  </div>
                  <ChevronLeft size={18} className="self-center text-ink-faint" aria-hidden />
                </motion.button>
              </motion.li>
            ))}
          </ul>
          {!bundle.hotels.length && <p className="mt-4 rounded-2xl bg-violet-50 p-4 text-center text-sm text-violet-800">עוד לא הוספת מלון. צלם או העלה את אישור ההזמנה.</p>}
        </motion.div>
      )}
    </>
  );
}
