"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import { useSolPriceStore } from "@/app/store/solPriceStore";
import SolanaIcon from "../solanaIcon";
interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  balance: number;
}

export default function BettingModal({
  isOpen,
  onClose,
  onConfirm,
  balance,
 
}: BettingModalProps) {
  const [amount, setAmount] = useState(0.25);
  
  const ALLOWED_STAKES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
  const modalRef = useRef<HTMLDivElement>(null); 
  useEffect(() => {
  if (isOpen) setAmount(0.25);
}, [isOpen]);


  const solPrice = useSolPriceStore((s) => s.price);
const usdValue = solPrice
  ? (amount * solPrice).toFixed(2)
  : "--";

  const handleSlider = (v: number) => {
    if (v > balance) v = balance;
    setAmount(parseFloat(v.toFixed(2)));
  };

  const handleConfirm = () => {
    if (amount > 0 && amount <= balance) {
      onConfirm(amount);
      onClose();
    }
  };
   const handleClickOutside = (e: React.MouseEvent) => {
    // Si el clic fue fuera del modal, cerrar el modal
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClickOutside}
        >
          <motion.div
            ref={modalRef}
  initial={{ scale: 0.7, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  
  transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="
              w-[90%] max-w-md
              bg-black/90 backdrop-blur-xl
              border border-white/10
              rounded-2xl p-6 
              shadow-2xl text-white
            "
          >
            <h2 className="text-2xl font-bold mb-3 text-center">
              💰 {t("select_bet")}
            </h2>

            <p className="text-sm text-gray-200 text-center mb-4">
              {t("balance")}: <span className="text-orange-600">{balance} <SolanaIcon className="inline w-3 h-3  -mt-1" /> </span>
              
            </p>

            {/* SLIDER */}
            <div className="mt-3">
              <div className="grid grid-cols-3 gap-3 mt-4">
                {ALLOWED_STAKES.map((v) => {
                const disabled = v > balance;

                return (
                  <button
                    key={v}
                    disabled={disabled}
                    onClick={() => setAmount(v)}
                    className={`py-2 rounded-lg border transition
                      ${amount === v ? "bg-orange-700 border-orange-500" : "bg-black/40 border-white/20"}
                      ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"}
                    `}
                  >
                  <SolanaIcon className="inline w-4 h-4 ml-1 -mt-1" />  {v} 
                  </button>
                );
              })}
         </div>
      </div>

            {/* Fee */}
            <p className="text-xs text-gray-300 mt-4 text-center">
              {t("fee_label")}:{" "}
              <span className="text-red-400 font-semibold">2%</span>{" "}
              {t("fee_suffix")}
            </p>

            {/* Botons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-600/40 hover:bg-gray-600 transition"
              >
               {t("cancel")}
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-lg bg-orange-700 hover:bg-orange-600 transition font-semibold"
              >
                {t("confirm")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
