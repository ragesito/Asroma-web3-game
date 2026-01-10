"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { MotionTransition } from "./transition-component";
interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  action?: { label: string; onClick: () => void } 
}

export default function Toast({
  message,
  type = "info",
  onClose,
  action,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-600/80 border-green-400",
    error: "bg-red-600/80 border-red-400",
    info: "bg-black/70 border-orange-700/60",
  }[type];

  return (
    <MotionTransition
      position="bottom"
      className="absolute z-40 inline-block w-full top-5 md:top-10 px-4 md:px-10"
    >
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-white px-5 py-3 rounded-xl border shadow-lg backdrop-blur-md  ${colors}`}
      style={{ zIndex: 9999 }}
    >
      <p className="text-sm font-medium">{message}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="bg-white/20 hover:bg-white/30 text-sm px-3 py-1 rounded-md transition"
        >
          {action.label}
        </button>
      )}

      
    </div>
    </MotionTransition>
  );
}
