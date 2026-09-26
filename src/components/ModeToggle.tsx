import { he } from '@/i18n/he';
import { CalendarDays, MapIcon } from '@/ui/icons';
import { motion } from '@/ui/motion';

export type Mode = 'map' | 'itinerary';

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const items: Array<{ id: Mode; label: string; Icon: typeof MapIcon }> = [
    { id: 'map', label: he.modes.map, Icon: MapIcon },
    { id: 'itinerary', label: he.modes.itinerary, Icon: CalendarDays },
  ];
  return (
    <div role="tablist" aria-label="מצב תצוגה" className="relative flex rounded-full bg-white/90 p-1 shadow-soft backdrop-blur">
      {items.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`relative z-10 flex min-h-[40px] items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-ink-soft'}`}
          >
            {active && <motion.span layoutId="mode-pill" className="absolute inset-0 -z-10 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <Icon size={16} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
