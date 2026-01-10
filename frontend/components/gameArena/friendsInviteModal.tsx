"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/app/store/userStore";
import { socket } from "@/app/lib/socket";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
interface FriendsInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export default function FriendsInviteModal({
  isOpen,
  onClose,
  roomId,
}: FriendsInviteModalProps) {
  const { id, token } = useUserStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  useEffect(() => {
    if (!isOpen) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFriends(data.friends || []))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-md"
    onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()} 
        className="bg-black/70 p-6 rounded-2xl border border-white/10 w-[90%] max-w-md text-white backdrop-blur-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">{t("invite_friend")}</h2>

        {loading ? (
          <p className="text-center">{t("loading")}</p>
        ) : friends.length === 0 ? (
          <p className="text-center text-gray-300">{t("no_friends")} 😢</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {friends.map((friend) => (
              <li
                key={friend._id}
                className="flex items-center justify-between bg-black/30 p-3 border rounded-xl border-white/10"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`http://localhost:5000${friend.avatar}`}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                  <p>{friend.username}</p>
                </div>

                <button
                  onClick={() => {
                    socket.emit("friend:inviteToRoom", {
                      roomId,
                      fromUserId: id,
                      toUserId: friend._id,
                    });
                    onClose();
                  }}
                  className="px-3 py-1 bg-orange-800 rounded-lg hover:bg-orange-900 transition"
                >
                  {t("invite")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600/60 py-2 rounded-xl hover:bg-red-800/60"
        >
          {t("close")}
        </button>
      </motion.div>
    </div>
  );
}
