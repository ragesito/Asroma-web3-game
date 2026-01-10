"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { useTranslation } from "react-i18next";
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  defaultValue?: string;
}

export default function JoinRoomDialog({ open, onClose, onSubmit, defaultValue = "" }: Props) {
  const [code, setCode] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setCode("");
    }
  }, [open]);

  const handleSubmit = () => {
    const sanitized = code.trim().toUpperCase();
    if (!sanitized) return;
    onSubmit(sanitized);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-[90%] max-w-md rounded-2xl bg-black/90 border border-white/10 p-6 text-white shadow-2xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}

            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2">{t("join_private_room")}</h3>
            <p className="text-sm text-gray-400 mb-4">
               {t("paste_room_code_prefix")}{" "} <span className="text-secondary">{t("room_code")}</span> {t("paste_room_code_suffix")}
            </p>

            <input
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("code_placeholder")}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <div className="mt-5 flex gap-3 justify-end">
              <Button
                className="bg-white/10 hover:bg-white/20"
                onClick={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSubmit}
              >
                {t("join")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
