import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-4 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="סגירה"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
