"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
export default function WinnerMatchScreen({
  winner,
  playerId,
  opponentName,
  onFinish,
}: {
  winner: string | null;
  playerId: string;
  opponentName: string;
  onFinish: () => void;
}) {
  const isWinner = winner === playerId;
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-8 text-center">

        {/* Title */}
        <motion.h1
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`text-6xl font-extrabold ${
            isWinner ? "text-green-400" : "text-red-400"
          }`}
        >
          {isWinner ? t("victory") : t("defeat")}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-300"
        >
          {isWinner
            ?  t("you_won_match")
            : `${t("winner_label")}: ${opponentName}`}
        </motion.p>

        {/* botton */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onFinish}
          className="mt-6 px-6 py-3 rounded-xl bg-secondary text-black font-bold hover:opacity-80 transition"
        >
          {t("back_to_lobby")}
        </motion.button>

      </div>
    </motion.div>
  );
}
