"use client";

import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";

interface TopMenuBarProps {
  items: { id: string; label: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function TopMenuBar({ items, activeId, onSelect }: TopMenuBarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicator, setIndicator] = useState({ x: 0, width: 0, ready: false });

  const recalc = () => {
    const container = containerRef.current;
    const activeBtn = activeId ? buttonRefs.current[activeId] : null;
    if (!container || !activeBtn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();

    const width = bRect.width * 0.6; // 60% del botón
const x = bRect.left - cRect.left + (bRect.width - width) / 3;


    setIndicator({ x, width, ready: true });
  };

  useLayoutEffect(() => {
    recalc();
    requestAnimationFrame(() => requestAnimationFrame(recalc));
  }, [activeId, items.length]);

  useLayoutEffect(() => {
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className="
        absolute top-[6%] left-1/2 -translate-x-1/2
        flex z-30 mt-20
        px-2 py-3 rounded-xl
        backdrop-blur-sm shadow-[0_0_25px_#ff7a1815]
        gap-10 md:gap-14 lg:gap-16
        text-base md:text-lg lg:text-xl
      "
    >
      {indicator.ready && (
        <motion.div
          className="
            absolute
            h-[3px] bg-orange-400 rounded-full
            shadow-[0_0_8px_#ff7a18]
            -bottom-1
          "
          initial={false}
          animate={{ x: indicator.x, width: indicator.width }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}

      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <motion.button
            key={item.id}
            ref={(el) => {
              buttonRefs.current[item.id] = el;
            }}
            onClick={() => onSelect(item.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="
              relative font-bold uppercase tracking-wide transition-all px-2
              text-white/70 hover:text-white
            "
          >
            <span
              className={`inline-block ${
                isActive ? "text-orange-400 drop-shadow-[0_0_6px_#ff7a18]" : ""
              }`}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
