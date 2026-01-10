"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function DeleteAccountModal({
  open,
  onClose,
  onConfirm
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
   const { t, i18n } = useTranslation(); 
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
        >
          {/* MODAL BOX */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="relative bg-red-900/30 border border-red-600/40 rounded-xl p-8 w-[90%] max-w-md shadow-xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-red-400 mb-3">
              {t("delete_account")}
            </h2>

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {t("delete_account_warning")} 
              <br />
              <br />
              <span className="text-red-400 font-semibold">
                {t("delete_account_irreversible")} 
              </span>{" "}
              {t("delete_account_data_removal")} 
              <br /><br />
              {t("delete_account_no_retention")} 
            </p>
            {/* PASSWORD INPUT */}
            <div className="mt-4">
              <label className="text-sm text-gray-300">{t("enter_password_confirm")} </label>
              <input
                type="password"
                className="w-full mt-2 px-3 py-2 rounded-md bg-red-800/20 border border-red-500/40 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-500/30 hover:bg-gray-500/40 transition font-medium"
              >
               {t("cancel")}
              </button>

              <button
    onClick={() => onConfirm(password)}
    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition font-semibold"
>
    {t("delete_account")}
</button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
