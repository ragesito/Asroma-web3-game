"use client";

import { motion } from "framer-motion";

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  isCounting: boolean;
}

export default function CircularTimer({
  timeLeft,
  totalTime,
  isCounting,
}: CircularTimerProps) {
  const progress = timeLeft / totalTime;
  const circumference = 2 * Math.PI * 45; 
  const strokeDashoffset = circumference * (1 - progress);

  // color dinámico
  const getColor = () => {
    if (progress > 0.6) return "#2EFFA5"; 
    if (progress > 0.3) return "#FFD648";
    return "#FF5555"; 
  };

  return (
    <div className="relative flex items-center justify-center w-[150px] h-[150px]">
      
      {/* Base Circle */}
      <svg className="absolute w-full h-full -rotate-90">
        <circle
          cx="75"
          cy="75"
          r="45"
          stroke="#ffffff22"
          strokeWidth="8"
          fill="none"
        />
      </svg>

      {/* Progress */}
      <svg className="absolute w-full h-full -rotate-90">
        <motion.circle
          cx="75"
          cy="75"
          r="45"
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={false}
          animate={{
            strokeDashoffset,
            scale: isCounting ? 1 : 1.05,
          }}
          transition={{ duration: 0.4, ease: "linear" }}
        />
      </svg>

      {/* Number */}
      <motion.span
        className="text-4xl font-bold"
        animate={{
          scale: timeLeft <= 3 ? [1, 1.2, 1] : 1,
          color: getColor(),
        }}
        transition={{ duration: 0.3 }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
}
