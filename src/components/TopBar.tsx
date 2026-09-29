import { useEffect, useState, type ReactNode } from 'react';
import type { Trip } from '@/domain/types';
import { formatTime, rangeLabel, eachDate } from '@/domain/time';
import { he } from '@/i18n/he';
import { Clock } from '@/ui/icons';

export function TopBar({ trip, account }: { trip: Trip; account?: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const days = eachDate(trip.startDate, trip.endDate).length;
  return (
    <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 items-center gap-3">
        {account ?? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-cat-hotels text-sm font-bold text-white shadow-soft" aria-hidden>
            ד
          </div>
        )}
        <div className="min-w-0">
          <h1 className="flex items-center gap-1.5 text-xl font-extrabold leading-tight text-ink">
            פריז
          </h1>
          <p className="truncate text-xs text-ink-soft">
            {rangeLabel(trip.startDate, trip.endDate)} · {he.days(days)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-ink shadow-soft backdrop-blur" title={trip.timezone}>
        <Clock size={14} className="text-brand" aria-hidden />
        <span className="hidden text-ink-soft sm:inline lg:inline">{he.parisTime}</span>
        <span dir="ltr">{formatTime(now.toISOString(), trip.timezone)}</span>
      </div>
    </header>
  );
}
