import { motion } from "motion/react";
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
    <motion.button
      type="button"
      onClick={() => onSelect(marker)}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      initial={{ opacity: 0, y: -10, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.06, type: "spring", stiffness: 260, damping: 18 }}
      whileTap={{ scale: 0.88 }}
      aria-label={meta.label}
    >
      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/70"
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
    </motion.button>
  );
}
