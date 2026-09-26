import type { CategoryId } from '@/domain/types';
import type { CategorySummary } from '@/domain/progress';
import { CATEGORIES, CATEGORY_ORDER } from '@/domain/categories';
import { he } from '@/i18n/he';
import { CATEGORY_ICON } from './categoryIcon';
import { Check } from '@/ui/icons';

export function TripProgress({ summary, onSelect }: { summary: Record<CategoryId, CategorySummary>; onSelect: (id: CategoryId) => void }) {
  return (
    <section aria-label={he.tripProgress} className="rounded-3xl bg-white p-4 shadow-soft">
      <h3 className="mb-3 text-sm font-extrabold text-ink">{he.tripProgress}</h3>
      <ul className="grid grid-cols-2 gap-2">
        {CATEGORY_ORDER.map((id) => {
          const s = summary[id];
          const Icon = CATEGORY_ICON[id];
          const meta = CATEGORIES[id];
          return (
            <li key={id}>
              <button onClick={() => onSelect(id)} className="flex w-full items-center gap-2 rounded-2xl p-2 text-start hover:bg-slate-50">
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: meta.tint, color: meta.color }}>
                  <Icon size={16} aria-hidden />
                </span>
                <span className="flex-1 text-xs font-semibold text-ink">{he.categories[id]}</span>
                {s.total !== undefined ? (
                  <span className="text-xs font-bold text-ink-soft" dir="ltr">{s.done}/{s.total}</span>
                ) : s.ready ? (
                  <Check size={16} className="text-emerald-500" aria-label="מוכן" />
                ) : (
                  <span className="text-xs text-ink-faint">-</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
