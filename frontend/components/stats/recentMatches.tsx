"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
interface Match {
  _id: string;
  youWon: boolean;
  result: "WIN" | "LOSS";
  opponentId: string;
  opponentName: string;
  score: { p1: number; p2: number };
  scoreText: string;
  createdAt: string;
}
const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
export const RecentMatches = ({ matches }: { matches: Match[] }) => {
  if (!matches.length)
    return (
      <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-4 text-sm text-slate-300">
        Start playing to see your stats.
      </div>
    );
  const { t } = useTranslation();
  return (
    <motion.div
      className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-4 shadow-lg shadow-black/40"
      variants={variants} initial="hidden" animate="visible" transition={{ delay: 1.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white tracking-wide">
          {t("latest_matches")}
        </h3>
        <span className="text-[11px] text-slate-400">
          {matches.length} {t("recent_count")}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[190px] overflow-y-auto pr-1">
        {matches.map((m) => {
          const formatted = new Date(m.createdAt).toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <motion.div
              key={m._id}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                m.youWon
                  ? "bg-emerald-500/10 border-emerald-400/30"
                  : "bg-rose-500/10 border-rose-400/30"
              }`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col">
                <span className="text-xs text-slate-300">
                  vs{" "}
                  <span className="text-white font-semibold">
                    {m.opponentName}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">{formatted}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-mono">{m.scoreText}</span>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full ${
                    m.youWon
                      ? "bg-emerald-500/30 text-emerald-200"
                      : "bg-rose-500/30 text-rose-200"
                  }`}
                >
                  {m.youWon ? t("victory") : t("defeat")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
