"use client";

import { motion, AnimatePresence } from "framer-motion";
import SolanaIcon from "@/components/solanaIcon";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import { useWalletsStore } from "@/app/store/walletsStore";
import { useTranslation } from "react-i18next";
import ModalPortal from "../modalPortal";
import QRCode from "react-qr-code";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  
}

export default function DepositModal({ open, onClose }: DepositModalProps) {

const walletId = useSelectedWalletStore((s) => s.walletId);
const { t } = useTranslation();
const publicKey = useWalletsStore(
  (s) => s.wallets.find((w) => w._id === walletId)?.publicKey
);

  if (!open) return null;

  return (
    <ModalPortal>
    <AnimatePresence>
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
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="
            w-[90%] max-w-sm
            bg-black/90 backdrop-blur-xl
            border border-white/10
            rounded-2xl p-6
            text-white shadow-2xl
          "
        >
          <h2 className="text-xl font-bold text-center mb-4">
             {t("deposit")}
          </h2>

          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <SolanaIcon className="w-5 h-5" />
              <span className="font-semibold">{t("solana")}</span>
            </div>
            <span className="text-sm text-gray-400">{t("network")}</span>
          </div>

          <div className="bg-white p-3 rounded-xl flex justify-center mb-4">
            <QRCode value={publicKey ?? ""} size={160} />
          </div>

          <p className="text-xs text-gray-400 text-center mb-2">
            {t("deposit")}{" "} <span className="text-orange-700">{t("selected")}</span> {t("wallet_address_")}
          </p>

          <div className="bg-black/50 border border-white/10 rounded-lg p-3 text-xs break-all text-center">
            {publicKey}
          </div>

          <button
            onClick={() => {
                    if (!publicKey) return;
                    navigator.clipboard.writeText(publicKey);
                }}
            className="
              w-full mt-4 py-2 rounded-lg
              bg-orange-700 hover:bg-orange-900
              transition font-semibold
            "
          >
            {t("copy_address")}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            {t("deposit_network_warning")}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </ModalPortal>
  );
}
