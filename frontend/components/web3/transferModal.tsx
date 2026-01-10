"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTransferSol } from "@/app/hooks/useTransferSol";
import { Wallet } from "@/app/(private)/wallets/types/walletType";
import { useTranslation } from "react-i18next";
import SolanaIcon from "../solanaIcon";
interface Props {
  fromWallet: Wallet;
  toWallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({
  fromWallet,
  toWallet,
  onClose,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState("");
  const { transfer, loading, error, signature } = useTransferSol();
  const { t } = useTranslation();
  const balance = fromWallet.sol;
  useEffect(() => {
  if (balance === 0) {
    setAmount("");
  }
}, [balance]);

 const submit = async () => {
  const value = Number(amount);

  if (!value || value <= 0) return;

  try {
    await transfer({
      fromWalletId: fromWallet._id,
      toPublicKey: toWallet.publicKey,
      amount: value,
    });

    setTimeout(() => {
      onSuccess();
    }, 800);
  } catch {
    // Error already handled by the hook
  }
};

 return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-md bg-black/80 border border-white/10 rounded-xl p-5 m-5 text-white shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs opacity-60">
              {t("transfer_from")}
            </span>
            <h2 className="text-base font-bold">
              <span className="text-orange-600">{fromWallet.name}</span>
              {" → "}
              <span className="text-orange-600">{toWallet.name}</span>
            </h2>
          </div>
          <button onClick={onClose}>
            <X className="w-4 h-4 opacity-60 hover:opacity-100 transition" />
          </button>
        </div>

        {/* TOKEN */}
        <div className="mb-4">
          <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 cursor-default hover:border-white/20 transition">
            <SolanaIcon className="w-4 h-4" />
            <span className="font-medium">Solana</span>
          </div>
        </div>

        {/* AMOUNT */}
        <div className="mb-3">
          <input
            type="number"
            disabled={balance === 0}
            placeholder={balance === 0 ? t("no_funds") : t("enter_amount")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="
              w-full bg-black/40 border border-white/10 rounded-lg
              px-3 py-2 text-lg font-medium
              outline-none transition
              focus:border-orange-600/60 focus:ring-1 focus:ring-orange-600/30
              disabled:opacity-40 disabled:cursor-not-allowed
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
            "
          />
        </div>

        {/* SLIDER */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={100}
            disabled={balance === 0}
            value={
              balance > 0 && amount
                ? (Number(amount) / balance) * 100
                : 0
            }
            onChange={(e) =>
              setAmount(((balance * Number(e.target.value)) / 100).toFixed(4))
            }
            className="w-full disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[11px] opacity-60 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* AVAILABLE */}
        <p className="text-xs mt-2 flex justify-between">
          <span className="opacity-60">{t("available")}</span>
          <span className="font-medium">{balance.toFixed(4)} SOL</span>
        </p>

        {/* ACTION */}
        <button
          disabled={loading}
          onClick={submit}
          className="
            w-full mt-4 py-2 rounded-lg
            bg-orange-700/80 hover:bg-orange-600
            transition-all duration-200
            font-semibold
            active:scale-[0.98]
            disabled:opacity-50
          "
        >
          {loading ? t("processing") : t("start_transfer")}
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-400 mt-2 text-center">
            {error}
          </p>
        )}

        {/* SUCCESS */}
        {signature && (
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            className="block text-center text-xs mt-3 text-orange-600 hover:underline"
          >
            {t("view_on_solscan")}
          </a>
        )}
      </div>
    </div>
  );
}