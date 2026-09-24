import { motion } from "motion/react";
import { CalendarDays, Map } from "lucide-react";
import type { ViewMode } from "../../types/domain";

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const options: { key: ViewMode; label: string; icon: typeof Map }[] = [
  { key: "map", label: "מפה", icon: Map },
  { key: "itinerary", label: "מסלול", icon: CalendarDays },
];

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="relative flex rounded-full bg-white/90 p-1 shadow-lg backdrop-blur-md">
      {options.map((opt) => {
        const active = opt.key === mode;
        const Icon = opt.icon;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className="relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{ color: active ? "white" : "#475569" }}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-blue-500"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={15} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
