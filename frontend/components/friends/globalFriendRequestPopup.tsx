"use client";

import { MotionTransition } from "../transition-component";
import { useTranslation } from "react-i18next";
import { resolveAvatarUrl } from "@/app/lib/avatar";
export default function GlobalFriendRequestPopup({
  fromUsername,
  fromAvatar,
  onClose,
}: {
  fromUsername: string;
  fromAvatar: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <MotionTransition
      position="bottom"
      className="absolute w-full top-5 md:top-10 px-4 md:px-10 z-[9999]"
    >
      <div
        className="
          fixed left-1/2 -translate-x-1/2
          flex items-center gap-4
          bg-black/70 backdrop-blur-md
          border border-white/10
          shadow-lg px-5 py-3 rounded-xl
          text-white
        "
        style={{ zIndex: 9999 }}
      >
        {/* Avatar */}
        <img
          src={resolveAvatarUrl(fromAvatar)}
          className="w-8 h-8 rounded-full object-cover border border-white/20"
        />

        {/* Text */}
        <p className="text-sm">
          <span className="text-orange-700 font-semibold">{fromUsername}</span>{" "}
          {t("sent_friend_request")}
        </p>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="hover:text-gray-300 transition-transform hover:scale-110"
        >
          ✕
        </button>
      </div>
    </MotionTransition>
  );
}
