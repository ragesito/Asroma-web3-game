"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
export const WinrateCard = ({ winrate }: { winrate: number }) => {
  const clamped = Math.max(0, Math.min(100, winrate));
  const deg = (clamped / 100) * 360;
  const { t } = useTranslation();
  return (
    <motion.div
      className="rounded-lg bg-white/5 border border-purple-500/40 backdrop-blur-xl px-6 py-5 flex flex-col items-center gap-3 shadow-lg shadow-purple-900/40"
      variants={variants} initial="hidden" animate="visible" transition={{ delay: 0.9 }}
    >
      <p className="text-xs uppercase tracking-wide text-slate-200">{t("winrate")}</p>
      <div className="relative w-28 h-28">
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(#22c55e ${deg}deg, rgba(148,163,184,0.25) 0deg)`,
          }}
        >
          <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center border border-white/10">
            <span className="text-xl font-bold text-white">
              {clamped.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-300 text-center">
        {t("winrate_description")}
      </p>
    </motion.div>
  );
};
