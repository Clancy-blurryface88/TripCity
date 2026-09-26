import type { CityKey, TripBundle } from '@/domain/types';
import { eachDate, shortDate } from '@/domain/time';
import { motion } from '@/ui/motion';
import { Phone, ShieldCheck } from '@/ui/icons';
import { ThemedHero } from './CityCrop';

export function InsuranceScreen({ bundle, city }: { bundle: TripBundle; city: CityKey }) {
  const tripDays = eachDate(bundle.trip.startDate, bundle.trip.endDate);
  return (
    <div>
      <ThemedHero city={city} spot="insurance" fw={0.34} color="#0d9488" icon={<ShieldCheck size={26} aria-hidden />} title="ביטוח" subtitle={bundle.insurance.length ? 'מכוסה לאורך כל הטיול' : 'אין פוליסה לטיול הזה'} />
      <ul className="mt-4 space-y-3">
        {bundle.insurance.map((p) => {
          const covered = new Set(eachDate(p.coverageStart, p.coverageEnd));
          const full = tripDays.every((d) => covered.has(d));
          return (
            <li key={p.id} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-500 p-4 text-white shadow-[0_18px_30px_-16px_rgba(13,148,136,.9)]">
              <ShieldCheck className="absolute -left-6 -top-4 h-36 w-36 text-white/10" aria-hidden />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-base font-black">{p.provider}</p>
                  <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black text-teal-700">
                    ✓ פעיל
                  </motion.span>
                </div>
                <p className="mt-3 text-[10px] opacity-80">מספר פוליסה</p>
                <p className="font-mono text-lg font-black tracking-widest" dir="ltr">
                  {p.policyNumber}
                </p>
                <p className="mb-1.5 mt-3 text-[11px] font-bold opacity-90">
                  כיסוי {shortDate(p.coverageStart)}–{shortDate(p.coverageEnd)} {full ? '· כל ימי הטיול' : '· לא כל הימים מכוסים!'}
                </p>
                <div className="flex gap-1">
                  {tripDays.map((d, i) => (
                    <motion.span key={d} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.25 + i * 0.06 }} className={`h-6 flex-1 origin-bottom rounded-md text-center text-[9px] font-bold leading-6 ${covered.has(d) ? 'bg-white/90 text-teal-700' : 'bg-rose-400 text-white'}`}>
                      {i + 1}
                    </motion.span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {bundle.insurance
        .filter((p) => p.emergencyPhone)
        .map((p) => (
          <motion.a key={p.id} whileTap={{ scale: 0.97 }} href={`tel:${p.emergencyPhone!.replace(/\s/g, '')}`} className="mt-3 flex min-h-[56px] items-center gap-3 rounded-2xl bg-rose-50 px-4 ring-1 ring-rose-100">
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-rose-500 text-white">
              <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/50" aria-hidden />
              <Phone size={18} aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-sm font-black text-rose-700">מוקד חירום 24/7</p>
              <p className="text-xs text-ink-soft" dir="ltr">
                {p.emergencyPhone}
              </p>
            </div>
          </motion.a>
        ))}
      {!bundle.insurance.length && <p className="mt-4 rounded-2xl bg-teal-50 p-4 text-center text-sm text-teal-800">עוד לא הוספת פוליסה. צלם או העלה את הפוליסה ונשמור את מספר החירום.</p>}
    </div>
  );
}
