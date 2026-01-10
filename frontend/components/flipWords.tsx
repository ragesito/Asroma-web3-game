"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/app/lib/utils";
import { ReactNode } from "react";

interface FlipWordsProps {
  words: ReactNode[];
  duration?: number;
  className?: string;
}

export const FlipWords = ({ words, duration = 3000, className }: FlipWordsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    const nextIndex = (currentIndex + 1) % words.length;
    setCurrentIndex(nextIndex);
    setIsAnimating(true);
  }, [currentIndex, words.length]);

  useEffect(() => {
    if (!isAnimating) {
      const timeout = setTimeout(() => {
        startAnimation();
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating, duration, startAnimation]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false);
      }}
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        className={cn(
          "z-10 inline-block relative text-left text-neutral-900 dark:text-neutral-100 px-2",
          className
        )}
      >
        {/* 🔹 Renderiza el elemento directamente (imagen o texto) */}
        {words[currentIndex]}
      </motion.div>
    </AnimatePresence>
  );
};
