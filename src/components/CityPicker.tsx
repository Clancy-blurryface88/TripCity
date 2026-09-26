import type { CityKey } from '@/domain/types';
import { CITIES } from '@/domain/cities';
import { hasBoard } from '@/city/boardImages';

/** Preview switch: shows the board of any city. The trip's own destination picks the board by default. */
export function CityPicker({ value, onChange }: { value: CityKey; onChange: (k: CityKey) => void }) {
  return (
    <label className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
      <span className="text-ink-soft">עיר:</span>
      <select aria-label="החלף עיר לתצוגה" value={value} onChange={(e) => onChange(e.target.value as CityKey)} className="bg-transparent text-[11px] font-semibold outline-none">
        {CITIES.map((c) => (
          <option key={c.key} value={c.key}>
            {c.he}
            {hasBoard(c.key) ? '' : ' (בקרוב)'}
          </option>
        ))}
        <option value="generic">עיר כללית</option>
      </select>
    </label>
  );
}
