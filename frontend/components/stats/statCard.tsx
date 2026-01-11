"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string | number;
  sublabel?: string;
}
const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
export const StatCard = ({ label, value, sublabel }: Props) => {
  return (
    <motion.div
      className="flex flex-col gap-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-4 shadow-lg shadow-black/30"
      variants={variants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}
    >
      <span className="text-xs uppercase tracking-wide text-slate-300">
        {label}
      </span>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sublabel && (
        <span className="text-[11px] text-slate-400">{sublabel}</span>
      )}
    </motion.div>
  );
};
