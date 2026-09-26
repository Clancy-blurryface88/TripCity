import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useDragControls } from '@/ui/motion';
import { X } from '@/ui/icons';
import { he } from '@/i18n/he';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  labelledBy?: string;
}

/** Mobile bottom sheet. Drag down, tap the backdrop or press Escape to close. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const drag = useDragControls();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-4xl bg-white shadow-soft"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
          >
            <div className="absolute inset-x-0 top-0 z-10 h-8 cursor-grab touch-none pt-3" onPointerDown={(e) => drag.start(e)}>
              <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-300/90 shadow-sm" aria-hidden />
            </div>
            <button onClick={onClose} className="absolute left-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-soft shadow-sm backdrop-blur" aria-label={he.close}>
              <X size={18} />
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-t-4xl px-5 pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
