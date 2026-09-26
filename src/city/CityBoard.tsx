import { memo, useEffect, useRef, useState } from 'react';
import type { CategoryId, CityKey } from '@/domain/types';
import { CATEGORIES } from '@/domain/categories';
import { CATEGORY_ICON } from '@/components/categoryIcon';
import { he } from '@/i18n/he';
import { boardImage } from './boardImages';
import { HOTSPOTS, type Hotspot, type TransportTab } from './hotspots';

const RATIO = 9 / 16;

export interface CityBoardProps {
  city: CityKey;
  counts: Record<CategoryId, number>;
  selected: CategoryId | null;
  onSelect: (id: CategoryId, tab?: TransportTab) => void;
  /** Extra top/bottom UI covering the board (px), used to keep markers clear of bars. */
  insetTop?: number;
  insetBottom?: number;
}

function spotLabel(s: Hotspot): string {
  if (s.id === 'taxi') return he.spots.taxi;
  if (s.id === 'train') return he.spots.train;
  return he.categories[s.category];
}

/**
 * The city board: one 9:16 illustration covering the area, with the same eight tap zones on every city.
 * The image is scaled like object-fit: cover, and markers are placed in image coordinates so they
 * stay glued to their buildings on any screen size.
 */
export const CityBoard = memo(function CityBoard({ city, counts, selected, onSelect, insetTop = 0 }: CityBoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 390, h: 760 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  // cover-fit the 9:16 board
  const availH = Math.max(box.h - insetTop, 1);
  const imgH = Math.max(box.w / RATIO, availH);
  const imgW = imgH * RATIO;
  const offX = (box.w - imgW) / 2;
  const offY = insetTop + (availH - imgH) / 2;
  const board = boardImage(city);

  return (
    <div ref={ref} className="relative h-full w-full select-none overflow-hidden bg-gradient-to-b from-[#eaf3ff] to-[#cfe6ff]" role="group" aria-label="מפת העיר" data-board={board.key}>
      {board.url && (
        <img src={board.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: offX, top: offY, width: imgW, height: imgH }} />
      )}
      {HOTSPOTS.map((s, k) => {
        const cx = offX + (s.x / 100) * imgW;
        const cy = offY + (s.y / 100) * imgH;
        const zw = (s.w / 100) * imgW;
        const zh = (s.h / 100) * imgH;
        const meta = CATEGORIES[s.category];
        const Icon = CATEGORY_ICON[s.category];
        const label = spotLabel(s);
        const count = counts[s.category];
        // keep markers on screen when the sides of the board are cropped
        const mx = Math.min(Math.max(cx, 34), box.w - 34);
        const my = Math.max(cy - zh / 2 - 2, insetTop + 50);
        const isSel = selected === s.category;
        return (
          <div key={s.id}>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="absolute rounded-3xl"
              style={{ left: cx - zw / 2, top: cy - zh / 2, width: zw, height: zh }}
              onClick={() => onSelect(s.category, s.tab)}
              data-zone={s.id}
            />
            <button
              type="button"
              aria-label={`${label}: ${he.categoryCount[s.category](count)}`}
              aria-pressed={isSel}
              data-marker={s.id}
              onClick={() => onSelect(s.category, s.tab)}
              className="absolute outline-none"
              style={{ left: mx, top: my, transform: 'translate(-50%, -100%)' }}
            >
              <span className="tc-bob flex flex-col items-center gap-0.5" style={{ animationDelay: `${k * -0.45}s` }}>
              <span className="relative grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-white text-white shadow-[0_3px_8px_rgba(31,42,68,0.35)]" style={{ background: meta.color }}>
                {isSel && <span className="tc-pulse absolute inset-[-6px] rounded-full" style={{ background: meta.color, opacity: 0.25 }} />}
                <Icon size={17} strokeWidth={2.3} aria-hidden />
                {count > 0 && s.category !== 'checklist' && s.id !== 'taxi' && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold" style={{ color: meta.color }}>
                    {count}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap rounded-full bg-white/95 px-2 py-[1px] text-[10.5px] font-semibold text-ink shadow-sm">{label}</span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
});
