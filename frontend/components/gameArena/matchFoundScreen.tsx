"use client";

import { AnimatePresence, motion } from "framer-motion";
import PlayerCard from "./playerCard";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
export default function MatchFoundScreen({
  player,
  opponent,
  opponentName,
  betAmount,
}: {
  player: any;
  opponent: any;
  opponentName: string;
  betAmount: number;
}) {
  
  const [flash, setFlash] = useState(true);   
  const [showCards, setShowCards] = useState(false); 
  const { t } = useTranslation();
  const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };  
  const variants2 = {    
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  }; 
  const variants3 = {    
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  }; 
  useEffect(() => {
    const t1 = setTimeout(() => {
      setFlash(false);
      setShowCards(true);
    }, 2000);

    return () => {
      clearTimeout(t1);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      {/* 1️⃣ MATCH FOUND FLASH */}
      <AnimatePresence mode="wait">
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-6xl font-extrabold text-secondary drop-shadow-xl"
            >
              {t("match_found")}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 2️⃣ CARDS + VS + BAR (tras 1s) */}
      {showCards && (
        
        <motion.div
          key="cards"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-6 w-full max-w-6xl z-40"
        >
          <motion.h1
              className="md:text-5xl text-2xl mx-5 text-orange-700 shadow-xl lg:text-5xl mt-5 font-bold text-center relative z-20"
              variants={variants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #1cec01ff 0%, #03df20ff 40%, #30ff86ff 100%)",
                  WebkitTextStroke: "0.5px rgba(255,255,255,0.15)",
                  textShadow: "0 0 12px rgba(0, 255, 115, 0.6)",
                }}
              >
                🍀 
              </span>{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #ffb347 0%, #ffcc33 40%, #fff599 100%)",
                  WebkitTextStroke: "0.5px rgba(255,255,255,0.15)",
                  textShadow: "0 0 12px rgba(255, 179, 71, 0.6)",
                }}
              >
              {t("good_luck")}
              </span>
            </motion.h1>

            
      

          {/* Cards */}
          <motion.div className="flex gap-10 justify-center items-center w-full"
            variants={variants2}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.4 }}>
                      
                      <PlayerCard
                        loading={!player}
                        username={player?.username}
                        avatar={player?.avatar}
                        score={player?.score}
                        wins={player?.wins}
                        losses={player?.losses}
                        bet={betAmount}
                      />

                      <motion.div 
                          className="relative w-[80px] h-[80px] mx-auto    md:mx-0 sm:w-[260px] sm:h-[260px] inline-block"
                          variants={variants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 1.7 }}
                              >
                                <Image
                                  src="/vs.png"
                                  alt="AS Roma Logo"
                                  fill
                                  sizes="200px"
                                  loading="eager"
                                  priority
                                  className="object-contain"
                                />
                              </motion.div>

                  <PlayerCard
                    loading={!opponent}
                    username={opponent?.username}
                    avatar={opponent?.avatar}
                    score={opponent?.score}
                    wins={opponent?.wins}
                    losses={opponent?.losses}
                    bet={betAmount}
                  />
          </motion.div>

          {/* Bar */}
          <motion.div className="mt-4 w-64 h-2 bg-gray-700 rounded-full overflow-hidden"
          variants={variants3}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}>
            <motion.div
              className="h-full bg-secondary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "linear" }}
            />
          </motion.div>

          <motion.p className="text-gray-400 text-sm"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1}}
          >{t("preparing_match")}</motion.p>
        </motion.div>
      )}
    </div>
  );
}
