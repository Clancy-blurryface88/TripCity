import type { CarRental, CityKey, TripBundle } from '@/domain/types';
import { formatTime, localDateOf, shortDate } from '@/domain/time';
import { motion } from '@/ui/motion';
import { Camera, Car, KeyRound, PencilLine, Upload } from '@/ui/icons';
import type { AddMethod } from '../AddDocument';
import { CityCrop, ThemedHero } from './CityCrop';

function RentalCard({ c, tz }: { c: CarRental; tz: string }) {
  const days = Math.max(1, Math.round((new Date(c.dropoffAt).getTime() - new Date(c.pickupAt).getTime()) / 86400000));
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-orange-100">
      <div className="flex items-center gap-3 bg-gradient-to-l from-orange-500 to-amber-400 p-3 text-white">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
          <KeyRound size={22} aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-base font-black">{c.company}</p>
          <p className="text-xs opacity-90">{c.carModel ?? 'דגם יתעדכן'} · {days} ימים</p>
        </div>
        {c.bookingReference && (
          <span className="rounded-lg bg-white/25 px-2 py-1 font-mono text-xs font-bold" dir="ltr">
            {c.bookingReference}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {[
          ['איסוף', c.pickupLocation, c.pickupAt],
          ['החזרה', c.dropoffLocation, c.dropoffAt],
        ].map(([l, where, at]) => (
          <div key={l} className="rounded-2xl bg-orange-50 p-2.5">
            <p className="text-[11px] font-bold text-orange-700">{l}</p>
            <p className="text-lg font-black text-ink">{formatTime(at, tz)}</p>
            <p className="text-[11px] text-ink-soft">{shortDate(localDateOf(at, tz))}</p>
            <p className="mt-1 truncate text-[11px] font-semibold text-ink">{where}</p>
          </div>
        ))}
      </div>
      <div className="px-3 pb-3">
        <p className="mb-1 text-[11px] font-bold text-ink-soft">להחזיר עם מיכל מלא</p>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-lime-400" initial={{ width: '8%' }} animate={{ width: '100%' }} transition={{ duration: 1.4, ease: 'easeOut' }} />
        </div>
      </div>
    </div>
  );
}

export function CarScreen({ bundle, city, onAdd }: { bundle: TripBundle; city: CityKey; onAdd?: (m: AddMethod) => void }) {
  const tz = bundle.trip.timezone;
  return (
    <div>
      <ThemedHero city={city} spot="rental" fw={0.42} color="#f97316" icon={<Car size={26} aria-hidden />} title="השכרת רכב" subtitle={bundle.carRentals.length ? `${bundle.carRentals.length} הזמנות` : 'עוד אין הזמנה'} />
      {bundle.carRentals.length ? (
        <ul className="mt-4 space-y-3">
          {bundle.carRentals.map((c) => (
            <li key={c.id}>
              <RentalCard c={c} tz={tz} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-b from-orange-50 to-white p-4 text-center ring-1 ring-orange-100">
          <div className="mx-auto w-40 overflow-hidden rounded-2xl ring-4 ring-white">
            <CityCrop city={city} at={{ x: 84, y: 61 }} fw={0.22} ratio={0.7} animate={false} />
          </div>
          <p className="mt-3 text-base font-black text-ink">החניון מחכה לרכב שלך</p>
          <p className="mt-1 text-xs text-ink-soft">מוסיפים הזמנה ונשמור חברה, דגם, מקום ושעת איסוף והחזרה, ומספר הזמנה. יום לפני תקבל תזכורת לרישיון ולכרטיס האשראי.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { l: 'צלם', I: Camera, m: 'choose' as AddMethod },
              { l: 'העלה', I: Upload, m: 'choose' as AddMethod },
              { l: 'ידני', I: PencilLine, m: 'manual' as AddMethod },
            ].map(({ l, I, m }) => (
              <motion.button key={l} whileTap={{ scale: 0.93 }} type="button" disabled={!onAdd} onClick={() => onAdd?.(m)} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-2.5 text-[11px] font-bold text-ink shadow-sm ring-1 ring-orange-100 disabled:opacity-60">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-100 text-orange-600">
                  <I size={16} aria-hidden />
                </span>
                {l}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
