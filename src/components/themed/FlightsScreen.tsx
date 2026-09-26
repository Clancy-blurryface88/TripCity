import { useMemo, useState } from 'react';
import type { CityKey, TripBundle } from '@/domain/types';
import { CATEGORIES } from '@/domain/categories';
import { motion } from '@/ui/motion';
import { Camera, Hash, Plane, Upload } from '@/ui/icons';
import type { AddMethod } from '../AddDocument';
import { ThemedHero } from './CityCrop';
import { BoardingPass } from './BoardingPass';

type Tab = 'all' | 'out' | 'back';

export function FlightsScreen({ bundle, city, onAdd, onOpenDocs }: { bundle: TripBundle; city: CityKey; onAdd?: (m: AddMethod) => void; onOpenDocs?: () => void }) {
  const [tab, setTab] = useState<Tab>('all');
  const flights = useMemo(() => [...bundle.flights].sort((a, b) => a.departureAt.localeCompare(b.departureAt)), [bundle.flights]);
  const outId = flights[0]?.id;
  const shown = flights.filter((f) => tab === 'all' || (tab === 'out' ? f.id === outId : f.id !== outId));
  const days = flights[0] ? Math.ceil((new Date(flights[0].departureAt).getTime() - Date.now()) / 86400000) : null;
  const color = CATEGORIES.flights.color;

  return (
    <div>
      <ThemedHero
        city={city}
        spot="airport"
        fw={0.62}
        color={color}
        icon={<Plane size={26} aria-hidden />}
        title="טיסות"
        subtitle={`${flights.length} טיסות · הכול במקום אחד`}
        chip={days !== null && days > 0 ? <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-cat-flights shadow-sm backdrop-blur">✈︎ ההמראה בעוד {days} ימים</span> : undefined}
      >
        <Plane size={26} className="tc-fly absolute left-0 top-[20%] rotate-45 fill-white text-white drop-shadow-md" aria-hidden />
      </ThemedHero>

      <div className="mt-4 grid grid-cols-3 rounded-2xl bg-sky-50 p-1 text-sm font-bold" role="tablist">
        {(
          [
            ['all', 'הכל'],
            ['out', 'הלוך'],
            ['back', 'חזור'],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="relative min-h-[38px] rounded-xl">
            {tab === k && <motion.span layoutId="flight-tab" className="absolute inset-0 rounded-xl bg-white shadow-sm" transition={{ type: 'spring', damping: 26, stiffness: 380 }} />}
            <span className={`relative ${tab === k ? 'text-cat-flights' : 'text-ink-soft'}`}>{l}</span>
          </button>
        ))}
      </div>

      <div className="-mx-1 mt-4 space-y-4 px-1">
        {shown.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: i * 0.08, type: 'spring', damping: 20, stiffness: 220 }}>
            <BoardingPass f={f} label={f.id === outId ? 'הלוך' : 'חזור'} doc={bundle.documents.find((d) => d.linkedId === f.id)} onOpenDoc={onOpenDocs} />
          </motion.div>
        ))}
      </div>

      <div className="mt-5 rounded-3xl bg-gradient-to-b from-sky-50 to-white p-3 ring-1 ring-sky-100">
        <p className="mb-2 px-1 text-xs font-bold text-sky-800">להוסיף טיסה</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'צלם כרטיס', I: Camera, m: 'choose' as AddMethod },
            { l: 'העלה PDF', I: Upload, m: 'choose' as AddMethod },
            { l: 'מספר טיסה', I: Hash, m: 'flight' as AddMethod },
          ].map(({ l, I, m }) => (
            <motion.button key={l} whileTap={{ scale: 0.94 }} type="button" disabled={!onAdd} onClick={() => onAdd?.(m)} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-[11px] font-bold text-ink shadow-sm ring-1 ring-sky-100">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-cat-flights">
                <I size={18} aria-hidden />
              </span>
              {l}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
