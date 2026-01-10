"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SolanaIcon from "@/components/solanaIcon";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import api from "@/app/lib/api";
import { useTranslation } from "react-i18next";
import ModalPortal from "../modalPortal";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  const sol = useSelectedWalletStore((s) => s.sol);
  const shortKey = useSelectedWalletStore((s) => s.shortKey);
  const walletId = useSelectedWalletStore((s) => s.walletId);
  const [step, setStep] = useState<"form" | "success">("form");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const parsedAmount = Number(amount);
  const isValidAmount = parsedAmount > 0 && parsedAmount <= sol;
  const isValidAddress = address.length > 30; // validación simple v1
  const canSubmit = isValidAmount && isValidAddress && !loading;
  const { t } = useTranslation();

  const resetState = () => {
  setStep("form");
  setTxSignature(null);
  setAmount("");
  setAddress("");
  setLoading(false);
};
  useEffect(() => {
  if (!open) {
    resetState();
  }
}, [open]);

  if (!open) return null;

 return (
  <ModalPortal>
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="
            w-[90%] max-w-sm
            bg-black/90 backdrop-blur-xl
            border border-white/10
            rounded-2xl p-6
            text-white shadow-2xl
          "
        >
          {step === "form" ? (
            <>
              {/* ---------- FORM ---------- */}
              <h2 className="text-xl font-bold text-center mb-4">{t("withdraw")}</h2>

              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-300">{t("from")}:</p>
                    <SolanaIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold relative top-[1px]">{shortKey}</span>
                  </div>
                  <span className="text-xs text-gray-300">
                     {t("balance")}:{" "}
                    <span className="text-white font-bold">
                      {sol.toFixed(3)}
                    </span>{" "}
                    SOL
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-300">{t("amount")}</label>
                  <button
                    className="text-xs text-orange-500"
                    onClick={() => setAmount(sol.toString())}
                  >
                     {t("max")}
                  </button>
                </div>

                <div className="flex items-center bg-black/50 border border-white/10 rounded-lg px-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent py-2 text-sm outline-none
                    [appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="flex items-center gap-1 text-sm">
                    <SolanaIcon className="w-4 h-4" /> SOL
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-300 mb-1 block">
                   {t("destination_wallet")}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("solana_public_address")}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                {t("withdraw_irreversible_warning")}
              </p>

              <button
                disabled={!canSubmit}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  canSubmit
                    ? "bg-orange-700 hover:bg-orange-600"
                    : "bg-gray-600/40 cursor-not-allowed"
                }`}
                onClick={async () => {
                  if (!canSubmit || !walletId) return;

                  try {
                    setLoading(true);
                    const res = await api.post("/wallets/withdraw", {
                      fromWalletId: walletId,
                      toPublicKey: address.trim(),
                      amount: parsedAmount,
                    });

                    setTxSignature(res.data.signature);
                    setStep("success");
                  } catch (err: any) {
                    alert(err.response?.data?.message || t("withdraw_failed"));
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? t("processing") : t("confirm_withdraw")}
              </button>
            </>
          ) : (
            <>
              {/* ---------- SUCCESS ---------- */}
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 w-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold mb-2">{t("sent")}</h3>

                <p className="text-sm text-gray-300 mb-3">
                  <span className="font-semibold">
                    {parsedAmount} SOL
                  </span>{" "}
                  {t("sent_to")}
                </p>

                <p className="text-sm text-orange-600 mb-4">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>

                {txSignature && (
                  <a
                    href={`https://solscan.io/tx/${txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 underline mb-6"
                  >
                    {t("view_on_solscan")}
                  </a>
                )}

                <button
                  onClick={() => {
                    resetState();
                    onClose();
                    }}

                  className="w-full py-2 rounded-lg bg-black/40 border border-orange-700 hover:bg-orange-700 transition"
                >
                  {t("close")}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  </ModalPortal>
);
}