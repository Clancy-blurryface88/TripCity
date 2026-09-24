import { useState } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { CATEGORIES, type ItineraryItem, type Trip } from "../../types/domain";
import { CATEGORY_ICONS } from "./categoryIcons";
import { itineraryDays } from "../../data/mockParis";

interface ItineraryTimelineProps {
  trip: Trip;
  items: ItineraryItem[];
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default function ItineraryTimeline({ trip, items }: ItineraryTimelineProps) {
  const days = itineraryDays(trip);
  const [activeDay, setActiveDay] = useState(days[0]);
  const dayItems = items
    .filter((it) => it.date === activeDay)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const dayIndex = days.indexOf(activeDay) + 1;

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50">
      <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+18px)]">
        <h1 className="text-xl font-extrabold text-slate-800">המסלול שלי</h1>
        <p className="text-sm text-slate-500">
          {days.length} ימים · {formatDay(days[0])}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 px-4">
        {days.map((day, i) => {
          const active = day === activeDay;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors"
              style={{
                backgroundColor: active ? "#3b82f6" : "white",
                color: active ? "white" : "#475569",
                boxShadow: active ? "0 6px 14px -4px rgba(59,130,246,0.5)" : "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-3 px-5 text-center text-xs font-semibold text-slate-400">
        יום {dayIndex} · {formatDay(activeDay)}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-5 pb-32">
        <div className="relative">
          <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />
          <div className="flex flex-col gap-4">
            {dayItems.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">אין עדיין פריטים ליום הזה</p>
            )}
            {dayItems.map((item, i) => {
              const meta = CATEGORIES[item.itemType];
              const Icon = CATEGORY_ICONS[item.itemType];
              return (
                <motion.div
                  key={item.id}
                  className="relative flex items-start gap-3 pr-10"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span
                    className="absolute right-0 top-0.5 flex h-10 w-10 items-center justify-center rounded-full text-white ring-4 ring-slate-50"
                    style={{ backgroundColor: meta.colorVar }}
                  >
                    <Icon size={17} />
                  </span>
                  <div className="w-16 shrink-0 pt-2 text-left text-xs font-bold text-slate-500">
                    {item.startAt}
                  </div>
                  <div className="flex-1 rounded-2xl bg-white p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                        {item.subtitle && (
                          <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
                        )}
                      </div>
                      {item.isLocked && <Lock size={13} className="mt-1 shrink-0 text-slate-300" />}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {item.statusLabel && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          {item.statusLabel}
                        </span>
                      )}
                      {item.aiGenerated && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-500">
                          הוצע על ידי AI
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
