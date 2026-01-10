"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
type Move = "rock" | "paper" | "scissors" | null;

const moveImg: Record<Exclude<Move, null>, string> = {
  rock: "/rockImg.png",
  paper: "/paperImg.png",
  scissors: "/scissorsImg.png",
};

export default function RoundVerdictScreen({
  playerMove,
  opponentMove,
  result,
}: {
  playerMove: Move;
  opponentMove: Move;
  result: string;
}) {
  const isWin = result.toLowerCase().includes("gan");
  const isLose = result.toLowerCase().includes("perd");
  const isDraw = result.toLowerCase().includes("emp");
  const { t } = useTranslation();
  const glowColor = isWin
    ? "rgba(34,197,94,0.9)"     
    : isLose
    ? "rgba(239,68,68,0.9)"     
    : "rgba(234,179,8,0.9)"; 

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-gradient-to-br from-black via-black/90 to-black
        backdrop-blur-xl
      "
    >
      <div className="flex flex-col items-center gap-12">

        {/* MOVES */}
        <div className="flex items-center gap-20">

          {/* PLAYER */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative"
          >
            <img
              src={moveImg[playerMove!]}
              alt="Your move"
              className="w-44 h-44 object-contain"
              style={{
                filter: `drop-shadow(0 0 35px ${glowColor})`,
              }}
            />
            <p className="text-center mt-4 text-sm text-gray-300">{t("you")}</p>
          </motion.div>

          {/* VS */}
          <motion.div
                    className="relative w-[120px] h-[120px] sm:w-[120px] sm:h-[120px] md:w-[200px] md:h-[200px] mx-auto sm:mx-0 inline-block"
                    initial={{ scale: 0.6, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                   
                  >
                    <Image
                      src="/vsv3.png"
                      alt="VS"
                      fill
                      sizes="(max-width: 640px) 60px, (max-width: 768px) 100px, 200px"
                      loading="eager"
                      priority
                      className="object-contain"
                    />
                  </motion.div>

          {/* OPPONENT */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="relative"
          >
            <img
              src={moveImg[opponentMove!]}
              alt="Opponent move"
              className="w-44 h-44 object-contain opacity-80"
              style={{
                filter: "drop-shadow(0 0 20px rgba(255,255,255,0.25))",
              }}
            />
            <p className="text-center mt-4 text-sm text-gray-400">{t("opponent")}</p>
          </motion.div>
        </div>

        {/* RESULT TEXT */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className={`
            text-4xl font-extrabold tracking-wide
            ${
              isWin
                ? "text-green-400"
                : isLose
                ? "text-red-400"
                : "text-yellow-400"
            }
          `}
          style={{
            textShadow: `0 0 25px ${glowColor}`,
          }}
        >
          {result}
        </motion.h1>
      </div>
    </motion.div>
  );
}
