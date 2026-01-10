"use client";

import { motion } from "framer-motion";

export default function ArenaVisualEffects() {
  return (
    <div className="relative w-[260px] h-[260px] flex items-center justify-center">

      {/* Main Glow*/}
      <motion.div
        className="absolute inset-0 rounded-full bg-secondary/20 blur-2xl"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* External ring */}
      <motion.div
        className="absolute w-full h-full rounded-full border-4 border-secondary/30"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
      />

      {/* Internal ring */}
      <motion.div
        className="absolute w-[180px] h-[180px] rounded-full border-2 border-white/20"
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: "linear",
        }}
      />

      {/* Particles */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-secondary rounded-full"
          initial={{
            x: (Math.random() - 0.5) * 200,
            y: 80,
            opacity: 0,
            scale: 0.4,
          }}
          animate={{
            y: [-20, -100 - Math.random() * 30],
            opacity: [0, 1, 0],
            scale: [0.4, 1, 0.2],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
