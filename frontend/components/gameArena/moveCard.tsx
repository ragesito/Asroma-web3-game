"use client";

import { motion } from "framer-motion";

interface MoveCardProps {
  label: string;
  emoji: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function MoveCard({
  label,
  emoji,
  selected,
  disabled,
  onClick,
}: MoveCardProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.12, rotate: 1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-28 h-36 rounded-xl border 
        flex flex-col items-center justify-center
        transition-all duration-300
        backdrop-blur-sm
        ${
          selected
            ? "border-yellow-400 shadow-lg shadow-yellow-500/40 bg-yellow-500/10"
            : "border-white/20 hover:border-secondary/60 bg-white/5"
        }
        ${disabled && "opacity-40 cursor-not-allowed"}
      `}
    >
      <motion.span
        animate={selected ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="text-5xl"
      >
        {emoji}
      </motion.span>

      <p className="text-sm mt-2 opacity-80">{label}</p>
    </motion.button>
  );
}
