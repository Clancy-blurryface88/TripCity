import { CATEGORIES, type MapMarker } from "../../types/domain";
import { CATEGORY_ICONS } from "./categoryIcons";

interface CategoryMarkerProps {
  marker: MapMarker;
  index: number;
  onSelect: (marker: MapMarker) => void;
}

export default function CategoryMarker({ marker, index, onSelect }: CategoryMarkerProps) {
  const meta = CATEGORIES[marker.category];
  const Icon = CATEGORY_ICONS[marker.category];

  return (
    <button
      type="button"
      onClick={() => onSelect(marker)}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      aria-label={meta.label}
    >
      <span
        className="flex flex-col items-center opacity-0"
        style={{
          animation: "marker-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
          animationDelay: `${0.15 + index * 0.06}s`,
        }}
      >
        <span
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/70 transition-transform active:scale-90"
          style={{ backgroundColor: meta.colorVar, boxShadow: "0 6px 14px -4px rgba(0,0,0,0.35)" }}
        >
          <Icon size={19} strokeWidth={2.25} />
          {marker.count > 0 && (
            <span className="absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-slate-700 shadow">
              {marker.count}
            </span>
          )}
        </span>
        <span className="mt-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          {meta.label}
        </span>
      </span>
    </button>
  );
}
