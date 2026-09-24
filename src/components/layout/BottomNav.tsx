import { Building2, FileText, Settings } from "lucide-react";

const items = [
  { key: "city", label: "עיר", icon: Building2 },
  { key: "documents", label: "מסמכים", icon: FileText },
  { key: "settings", label: "הגדרות", icon: Settings },
] as const;

interface BottomNavProps {
  active?: (typeof items)[number]["key"];
}

export default function BottomNav({ active = "city" }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around border-t border-slate-100 bg-white/95 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2 backdrop-blur-md">
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 2}
              className={isActive ? "text-blue-500" : "text-slate-400"}
            />
            <span
              className={`text-[11px] font-medium ${
                isActive ? "text-blue-500" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
