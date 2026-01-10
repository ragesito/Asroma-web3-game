"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function WalletNameModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: (name?: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="bg-black/90 p-6 rounded-xl w-[360px]"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">
            {t("name_your_wallet")}
          </h3>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("wallet_name_optional")}
            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 mb-4"
          />

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onConfirm(name || undefined)}
              className="px-4 py-2 bg-orange-600 rounded-lg"
            >
              {t("confirm")}
            </button>
            <button
              onClick={() => onConfirm(undefined)}
              className="px-4 py-2 bg-gray-700 rounded-lg"
            >
              {t("skip")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
