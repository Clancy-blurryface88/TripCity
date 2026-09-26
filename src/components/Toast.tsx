import { AnimatePresence, motion } from '@/ui/motion';
import { Bell, X } from '@/ui/icons';

export interface ToastMsg {
  id: string;
  title: string;
  body: string;
}

export function Toast({ msg, onClose }: { msg: ToastMsg | null; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <AnimatePresence>
        {msg && (
          <motion.div key={msg.id} role="status" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-100">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand">
              <Bell size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{msg.title}</p>
              <p className="text-xs text-ink-soft">{msg.body}</p>
            </div>
            <button type="button" aria-label="סגור" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-ink-faint">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OfflineBar({ online }: { online: boolean }) {
  if (online) return null;
  return <div className="bg-amber-100 px-3 py-1.5 text-center text-xs font-semibold text-amber-900">אין חיבור לרשת · מוצג המידע השמור במכשיר</div>;
}
