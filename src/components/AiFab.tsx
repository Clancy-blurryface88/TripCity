import { he } from '@/i18n/he';
import { Sparkles } from '@/ui/icons';
import { motion } from '@/ui/motion';

export function AiFab({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="tc-ai-fab flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-l from-[#7c3aed] via-[#5b5bf7] to-[#2f80ed] px-4 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(91,91,247,0.7)]"
      aria-label={he.aiButton}
    >
      <Sparkles size={18} aria-hidden />
      {!compact && <span>{he.aiButton}</span>}
    </motion.button>
  );
}
