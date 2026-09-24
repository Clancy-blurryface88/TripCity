import { Building2 } from "lucide-react";

export default function GenericCityBackground() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/70 text-slate-400 shadow-sm">
        <Building2 size={34} strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">האיור של היעד הזה בדרך</p>
    </div>
  );
}
