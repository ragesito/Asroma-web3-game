"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
interface PrivateRoomWaitingProps {
  roomId: string;
  user: any;
  onInviteClick: () => void;
  onCancel: () => void;
}

export default function PrivateRoomWaitingScreen({
  roomId,
  user,
  onInviteClick,
  onCancel, 
}: PrivateRoomWaitingProps) {
  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex flex-col items-center justify-center text-white z-50 px-4 sm:px-6 md:px-10">

      {/* up code */}
      <motion.div className="absolute top-24 sm:top-40 text-sm sm:text-xl font-bold bg-black/40 px-6 py-3 rounded-xl border border-white/20 shadow-lg"
      initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}>
        {t("room_code")}: <span className="text-orange-700">{roomId}</span>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-20 mt-16 sm:mt-10">

        {/* creator card */}
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          
          <img
            src={`http://localhost:5000${user.avatar}`}
            width={120}
            height={120}
            className="rounded-full border-4 border-yellow-300"
            alt="you"
          />
          <p className="mt-2 text-lg sm:text-xl font-semibold">{user.username}</p>
        </motion.div>

        {/* VS */}
        <motion.div
          className="relative w-[120px] h-[120px] sm:w-[120px] sm:h-[120px] md:w-[200px] md:h-[200px] mx-auto sm:mx-0 inline-block"
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        >
          <Image
            src="/vsv3.png"
            alt="VS"
            fill
            sizes="(max-width: 640px) 60px, (max-width: 768px) 100px, 200px"
            loading="eager"
            priority
            className="object-contain"
          />
        </motion.div>

        {/* rival side + invite button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full border-4 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 transition"
          onClick={onInviteClick}
        >
          <p className="text-center text-sm">{t("invite_friend")}</p>
        </motion.div>
      </div>

      <p className="mt-7 sm:mt-14 text-gray-300 text-sm sm:text-sm">{t("waiting_opponent")}</p>
      <button
        onClick={onCancel}
        className="mt-2 sm:mt-4 px-6 py-2 rounded-lg border border-red-400 text-red-300 hover:bg-red-500/10 transition"
      >
        {t("cancel")}
      </button>
    </div>
  );
}
