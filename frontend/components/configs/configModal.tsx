"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Palette,
  Bell,
  Lock,
  ShieldAlert,
  X,
  ChevronRight,
} from "lucide-react";
interface ConfigModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ConfigModal({
  open,
  title,
  onClose,
  children,
}: ConfigModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
        >
          {/* MODAL BOX */}
          <motion.div
            onClick={(e) => e.stopPropagation()} 
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="
              relative
              border border-white/10 bg-black/90 p-4 rounded-lg
              p-8
              w-[90%]
              max-w-md
             
              text-white
            "
          >
             <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
           
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
