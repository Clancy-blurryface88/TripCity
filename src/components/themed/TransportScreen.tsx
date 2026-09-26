import { useState } from 'react';
import type { CityKey, Transport, TripBundle } from '@/domain/types';
import type { TransportTab } from '@/city/hotspots';
import { formatTime, localDateOf, minutesBetween, shortDate } from '@/domain/time';
import { motion } from '@/ui/motion';
import { CarTaxiFront, TrainFront } from '@/ui/icons';
import { ThemedHero } from './CityCrop';

/** Split-flap style characters, like a station departure board. */
function Flap({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex gap-[2px] ${className}`} dir="ltr">
      {text.split('').map((ch, i) => (
        <motion.span key={`${i}-${ch}`} initial={{ rotateX: -90 }} animate={{ rotateX: 0 }} transition={{ delay: i * 0.035, duration: 0.25 }} className="relative grid min-w-[0.72em] place-items-center rounded-[3px] bg-[#232a3a] px-[1px] leading-[1.35] text-[#ffd84d] shadow-[inset_0_-1px_0_rgba(0,0,0,.6)]">
          {ch === ' ' ? '\u00a0' : ch}
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/50" aria-hidden />
        </motion.span>
      ))}
    </span>
  );
}

function TrainRow({ t, tz }: { t: Transport; tz: string }) {
  const m = minutesBetween(t.departureAt, t.arrivalAt);
  return (
    <div className="rounded-2xl bg-[#171c28] p-3 text-white shadow-[0_12px_24px_-14px_rgba(0,0,0,.8)]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span>{shortDate(localDateOf(t.departureAt, tz))}</span>
        <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] text-white">{t.operator ?? 'TRAIN'}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Flap text={formatTime(t.departureAt, tz)} className="text-lg font-black" />
        <div className="relative mx-1 h-0.5 flex-1 rounded bg-slate-600">
          <motion.span className="absolute -top-[5px] h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" initial={{ right: '0%' }} animate={{ right: ['0%', '92%'] }} transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }} />
        </div>
        <Flap text={formatTime(t.arrivalAt, tz)} className="text-lg font-black" />
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[12px] font-semibold">
        <span className="truncate">{t.origin}</span>
        <span className="shrink-0 text-slate-400">{m} דק׳</span>
        <span className="truncate text-left">{t.destination}</span>
      </div>
    </div>
  );
}

function TaxiRow({ t, tz }: { t: Transport; tz: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#ffd23f] text-[#2a2100] shadow-[0_12px_24px_-14px_rgba(180,130,0,.9)]">
      <div className="h-2.5 bg-[length:10px_10px] [background-image:linear-gradient(45deg,#1f1a00_25%,transparent_25%,transparent_75%,#1f1a00_75%),linear-gradient(45deg,#1f1a00_25%,transparent_25%,transparent_75%,#1f1a00_75%)] [background-position:0_0,5px_5px]" aria-hidden />
      <div className="flex items-center gap-3 p-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1f1a00] text-[#ffd23f]">
          <CarTaxiFront size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold opacity-70">
            {shortDate(localDateOf(t.departureAt, tz))} · {t.operator ?? 'מונית'}
          </p>
          <p className="truncate text-sm font-black">{t.origin}</p>
          <p className="truncate text-sm font-black">← {t.destination}</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black leading-none">{formatTime(t.departureAt, tz)}</p>
          <p className="text-[10px] font-bold opacity-70">איסוף</p>
        </div>
      </div>
    </div>
  );
}

export function TransportScreen({ bundle, city, tab }: { bundle: TripBundle; city: CityKey; tab?: TransportTab }) {
  const [t, setT] = useState<TransportTab>(tab ?? 'train');
  const tz = bundle.trip.timezone;
  const list = bundle.transport.filter((x) => (t === 'taxi' ? x.mode === 'taxi' : x.mode !== 'taxi')).sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  return (
    <div>
      <motion.div key={t} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        <ThemedHero
          city={city}
          spot={t}
          fw={t === 'train' ? 0.6 : 0.46}
          color={t === 'train' ? '#16a34a' : '#eab308'}
          icon={t === 'train' ? <TrainFront size={26} aria-hidden /> : <CarTaxiFront size={26} aria-hidden />}
          title="תחבורה"
          subtitle={t === 'train' ? `${bundle.transport.filter((x) => x.mode !== 'taxi').length} נסיעות ברכבת` : `${bundle.transport.filter((x) => x.mode === 'taxi').length} נסיעות מונית`}
        />
      </motion.div>
      <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold" role="tablist">
        {(['train', 'taxi'] as const).map((k) => (
          <button key={k} role="tab" aria-selected={t === k} type="button" onClick={() => setT(k)} className="relative flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl">
            {t === k && <motion.span layoutId="tr-tab" className="absolute inset-0 rounded-xl shadow-sm" style={{ background: k === 'train' ? '#16a34a' : '#ffd23f' }} transition={{ type: 'spring', damping: 26, stiffness: 380 }} />}
            <span className={`relative flex items-center gap-1.5 ${t === k ? (k === 'train' ? 'text-white' : 'text-[#2a2100]') : 'text-ink-soft'}`}>
              {k === 'train' ? <TrainFront size={16} aria-hidden /> : <CarTaxiFront size={16} aria-hidden />}
              {k === 'train' ? 'רכבות' : 'מוניות'}
            </span>
          </button>
        ))}
      </div>
      {t === 'train' && list.length > 0 && <p className="mb-1 mt-4 text-[11px] font-bold tracking-wide text-ink-soft">לוח יציאות</p>}
      <ul className="mt-2 space-y-2.5">
        {list.map((x, i) => (
          <motion.li key={x.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            {x.mode === 'taxi' ? <TaxiRow t={x} tz={tz} /> : <TrainRow t={x} tz={tz} />}
          </motion.li>
        ))}
      </ul>
      {!list.length && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-center text-sm text-ink-soft">{t === 'taxi' ? 'אין נסיעות מונית מתוכננות.' : 'אין נסיעות רכבת.'}</p>}
    </div>
  );
}
