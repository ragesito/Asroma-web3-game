"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
interface GameMenuProps {
  onRanked: () => void;
  onCreate: () => void;
  onJoin: () => void;
  onFriends: () => void;
}

export default function GameMenu({
  onRanked,
  onCreate,
  onJoin,
  onFriends,
}: GameMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-10 mt-6 text-white">

      {/* GRID TOP: RANKED + FRIENDS */}
      <motion.div className="flex flex-row w-full gap-6"
      variants={variants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
        
        {/* ░░ RANKED ░░ */}
        <MenuCard
          color="from-purple-700/40 to-purple-800/40"
          border="border-purple-400/60"
          title="Ranked Match"
          subtitle="Competitivo en tiempo real"
          icon="⚔️"
          onClick={onRanked}
          extraWidth="w-full sm:w-[500px] md:w-[600px] lg:w-[700px]"
        />
      </motion.div>

      {/* GRID BOTTOM: CREATE + JOIN */}
      <motion.div className="flex flex-row w-full gap-6"
      variants={variants} initial="hidden" animate="visible" transition={{ delay: 1.1 }}>
        <MenuCard
        
          color="from-pink-500/40 to-pink-700/40"
          border="border-pink-400/60"
          title="Create Room"
          subtitle="Crea sala privada"
          icon="🎮"
          onClick={onCreate}
          extraWidth="w-full sm:w-[236px] md:w-[286px] lg:w-[336px]"
        />

        <MenuCard
          color="from-green-500/40 to-green-700/40"
          border="border-green-400/60"
          title="Join Room"
          subtitle="Ingresa un código"
          icon="🔑"
          onClick={onJoin}
          extraWidth="w-full sm:w-[236px] md:w-[286px] lg:w-[336px]"
        />
      </motion.div>
      <motion.div className="flex flex-row w-full gap-6"
      variants={variants} initial="hidden" animate="visible" transition={{ delay: 1.4 }}>
        {/* ░░ FRIENDS ░░ */}
        <MenuCard
          color="none"
          border="border-purple-300/50"
          title="Ranked Match 2 vs 2 "
          subtitle="Coming Soon!"
          icon="🗡️"
          onClick={onFriends}
          extraWidth="w-full sm:w-[500px] md:w-[600px] lg:w-[700px]"
        />
        
      </motion.div>
    </div>
  );
}

/* --------- CARD COMPONENT ---------- */

function MenuCard({
  title,
  subtitle,
  icon,
  onClick,
  color,
  border,
  extraWidth,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onClick: () => void;
  color: string;
  border: string;
  extraWidth?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        cursor-pointer select-none
        h-40 rounded-2xl px-6 sm:px-8 md:px-10
        ${extraWidth ?? "w-auto md:w-72"}
        bg-gradient-to-br ${color}
        border ${border}
        backdrop-blur-xl
        flex flex-col justify-center items-center gap-2
        transition-all
        
      `}
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-200">{subtitle}</p>
    </motion.div>
  );
}
