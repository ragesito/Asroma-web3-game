"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import ModalPortal from "@/components/modalPortal";
interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <ModalPortal>
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="bg-black/90 text-white w-[400px] p-6 rounded-xl shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4 text-center">{message}</h2>

          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              {t("yes")}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              {t("no")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </ModalPortal>
  );
}
