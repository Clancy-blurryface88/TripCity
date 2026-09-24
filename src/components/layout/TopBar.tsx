import { ChevronDown, Sun, User } from "lucide-react";
import type { Trip } from "../../types/domain";

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function tripLengthDays(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

interface TopBarProps {
  trip: Trip;
}

export default function TopBar({ trip }: TopBarProps) {
  return (
    <div className="flex items-start justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+14px)]">
      <div className="flex items-center gap-2 rounded-full bg-white/85 py-1.5 pr-1.5 pl-3 shadow-sm backdrop-blur-md">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <User size={16} />
        </span>
        <div className="text-right leading-tight">
          <div className="flex items-center gap-0.5 text-sm font-bold text-slate-800">
            {trip.destinationCity}
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500">{formatRange(trip.startDate, trip.endDate)}</p>
          <p className="text-[10px] font-semibold text-blue-500">
            {tripLengthDays(trip.startDate, trip.endDate)} ימים
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md">
        <Sun size={16} className="text-amber-400" />
        {trip.weatherTempC}°C
      </div>
    </div>
  );
}
