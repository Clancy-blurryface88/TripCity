import { Camera, ChevronLeft, FileEdit } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import { CATEGORIES, type MapMarker } from "../../types/domain";
import { CATEGORY_ICONS } from "./categoryIcons";

interface CategoryBottomSheetProps {
  marker: MapMarker | null;
  onClose: () => void;
}

export default function CategoryBottomSheet({ marker, onClose }: CategoryBottomSheetProps) {
  const meta = marker ? CATEGORIES[marker.category] : null;
  const Icon = marker ? CATEGORY_ICONS[marker.category] : null;

  return (
    <BottomSheet open={!!marker} onClose={onClose} title={meta?.label ?? ""}>
      {meta && Icon && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: meta.colorVar }}
            >
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {marker && marker.count > 0
                  ? `${marker.count} פריטים · ${meta.label}`
                  : `אין עדיין פרטים · ${meta.label}`}
              </p>
              <p className="text-xs text-slate-500">{meta.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3.5 text-right transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ChevronLeft size={18} className="text-slate-300" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">הזנה ידנית</p>
                  <p className="text-xs text-slate-500">הזן את הפרטים בעצמך</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <FileEdit size={17} />
                </span>
              </div>
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3.5 text-right transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ChevronLeft size={18} className="text-slate-300" />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">העלאת מסמך / תמונה</p>
                  <p className="text-xs text-slate-500">צלם או העלה קובץ ונזהה את הפרטים</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                  <Camera size={17} />
                </span>
              </div>
            </button>
          </div>

          <button
            type="button"
            className="w-full rounded-2xl py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.98]"
            style={{ backgroundColor: meta.colorVar }}
          >
            הוסף {meta.label}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
