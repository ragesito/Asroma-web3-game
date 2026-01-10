"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/app/lib/socket";
import { useUserStore } from "@/app/store/userStore";
import { useNotificationStore } from "@/app/store/notificationStore";
import GlobalFriendRequestPopup from "@/components/friends/globalFriendRequestPopup";
const FriendRequestContext = createContext({});

export const useFriendRequestSocket = () => useContext(FriendRequestContext);

export default function FriendRequestProvider({ children }: { children: React.ReactNode }) {
  const { id } = useUserStore();

  const enabled = useNotificationStore((s) => s.friendRequestNotifications);
  const soundEnabled = useNotificationStore((s) => s.sound);
  const vibrationEnabled = useNotificationStore((s) => s.vibration);

  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    console.log("🔗 FriendRequestProvider montado. ID del user:", id);
    if (!id) return;

    socket.on("friendRequest:new", (data) => {
      if (data.recipient !== id) return;
      if (!enabled) return;

      setRequest({
            fromUsername: data.requester.username,
            fromAvatar: data.requester.avatar || "/default-avatar.png",
        });
        setTimeout(() => setRequest(null), 4000);
      if (soundEnabled) {
        const audio = new Audio("/sounds/friend.mp3");
        audio.play().catch(() => {});
      }

      if (vibrationEnabled && "vibrate" in navigator) {
        navigator.vibrate(150);
      }
    });

    return () => {
      socket.off("friendRequest:new");
    };
  }, [id, enabled, soundEnabled, vibrationEnabled]);

  return (
    <FriendRequestContext.Provider value={{}}>
      {children}

      {request && (
        <GlobalFriendRequestPopup
          fromUsername={request.fromUsername}
          fromAvatar={request.fromAvatar}

          onClose={() => setRequest(null)}
        />
      )}
    </FriendRequestContext.Provider>
  );
}
