"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useUserStore } from "@/app/store/userStore";
import { useState } from "react";
import LoginModal from "../LoginModal";
import { socket } from "@/app/lib/socket";
import api from "@/app/lib/api"; 
import Toast from "@/components/toast";
import { useEffect } from "react";
import { Button } from "@/components/statefulButton";
import { useTranslation } from "react-i18next";
interface PlayerProfileProps {
  player: any;
  onClose: () => void;
}

export default function PlayerProfileModal({ player, onClose }: PlayerProfileProps) {
  const { id: myId, token } = useUserStore();
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" ; action?: { label: string; onClick: () => void } } | null>(null);
  const [sent, setSent] = useState(false);
   const { t } = useTranslation();
  const [status, setStatus] = useState({
  areFriends: false,
  sentRequest: false,
  receivedRequest: false,
});
  const handleClick = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  const handleAddFriend = async () => {
  if (!myId || !token) {
    setShowLogin(true);
    return;
  }

  try {
    const res = await api.post(
      "/friends/request",
      {
        recipient: player.username,   // 👈 IGUAL QUE FriendList
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 200 || res.status === 201) {
      console.log("✅ Friend request sent:", player.username);
      setSent(true);
      setToast({
        message: `Friend request sent to ${player.username}`,
        type: "success",
      });
    } else {
      console.warn("⚠ Backend error:", res.data);
    }
  } catch (err: any) {
  const backendMsg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Error sending request";

  setToast({
    message: backendMsg,
    type: "error",
  });

  return; 
}
};
  useEffect(() => {
  if (!player?.username || !myId) return;

  api.get(`/friends/status/${player.username}`)
    .then(res => setStatus(res.data))
    .catch(() => {});
}, [player, myId]);
  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      >
        {/* Modal content */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/80 border border-white/20 rounded-2xl p-8 w-[380px] text-white text-center shadow-xl"
        >
          <img
            src={`http://localhost:5000${player.avatar}`}
            width={100}
            height={100}
            className="rounded-full mx-auto border border-white/30"
            alt="avatar"
          />

          <h2 className="text-2xl font-bold mt-3">{player.username}</h2>

          <p className="text-gray-300 mt-1">🏆 {t("rank")} #{player.rank}</p>

          <div className="flex justify-between mt-4 text-sm text">
            <span>🏅 {t("wins")}: <b>{player.wins}</b></span>
            <span>🔥 {t("losses")}: <b>{player.losses}</b></span>
            <span>⭐ {t("mmr")}: <b>{player.score}</b></span>
          </div>
          {status.areFriends ? (
              <p className="text-green-400 font-semibold mt-3">
                ✔ {t("already_friends")}
              </p>
            ) : status.sentRequest ? (
              <p className="text-yellow-400 font-semibold mt-3">
                ⏳ {t("request_already_sent")}
              </p>
            ) : status.receivedRequest ? (
              <p className="text-blue-400 font-semibold mt-3">
                🎉 {t("user_sent_request")}
              </p>
            ) : (
          <Button
            onClick={handleAddFriend}
            className="mt-6 w-full"
          >
             {sent ? " Enviado" : " Add Friend"}
          </Button>
          )}
        </motion.div>
      </motion.div>
       {toast && (
             <Toast
               message={toast.message}
               type={toast.type}
               onClose={() => setToast(null)}
               action={toast.action} 
             />
           )}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => setShowLogin(false)}
        defaultRegister={true}
      />
      
    </>
  );
}
