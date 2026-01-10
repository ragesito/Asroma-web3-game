"use client";

import Image from "next/image";
import { motion } from "motion/react";

const RockPaperScissor = () => {
    const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  return (
    <motion.div
    variants={variants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 1.4 }}
      
      className="flex justify-center mt-4 md:mt-8 z-30"
    >
      <div className="relative w-[1550px] h-auto aspect-[3/1]">
    <Image
      src="/proof2.png"
      alt="Rock Paper Scissor"
      fill
      loading="eager"
      priority
      sizes="(max-width: 768px) 90vw, 750px"
      className="object-contain hover:scale-97 transition-transform duration-300 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
    />
  </div>

    </motion.div>
  );
};

export default RockPaperScissor;
