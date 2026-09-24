import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface FloatingAIButtonProps {
  onClick?: () => void;
}

export default function FloatingAIButton({ onClick }: FloatingAIButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-500 to-violet-500 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-6px_rgba(59,130,246,0.55)]"
      whileTap={{ scale: 0.94 }}
      animate={{ boxShadow: ["0 10px 24px -6px rgba(59,130,246,0.55)", "0 10px 30px -4px rgba(139,92,246,0.55)", "0 10px 24px -6px rgba(59,130,246,0.55)"] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Sparkles size={17} />
      בנה לי את המסלול
    </motion.button>
  );
}
