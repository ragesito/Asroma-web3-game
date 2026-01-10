"use client";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { resolveAvatarUrl } from "@/app/lib/avatar";
interface InvitePopupProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  fromUsername: string;
  fromAvatar: string;
}

export default function InvitePopup({
  open,
  onClose,
  onAccept,
  fromUsername,
  fromAvatar,
}: InvitePopupProps) {
  if (!open) return null;
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black/70 p-6 rounded-2xl border border-white/10 text-white w-[90%] max-w-sm backdrop-blur-md"
      >
        <h3 className="text-xl font-bold text-center mb-3">
          {t("you_are_invited")}
        </h3>

        <div className="flex flex-col items-center gap-3">
          
        <img
          src={resolveAvatarUrl(fromAvatar)}
          className="w-20 h-20 object-cover rounded-full border border-white/30"
        />
          <p ><span className="text-orange-700 font-semibold">{fromUsername}</span> {t("wants_to_join_game")}</p>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onAccept}
            className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700"
          >
            {t("join")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-red-600/60 hover:bg-red-800/60"
          >
            {t("decline")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
