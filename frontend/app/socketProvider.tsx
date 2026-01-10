"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/app/lib/socket";
import GlobalInvitePopup from "@/components/gameArena/globalInvitePopup";
import { useUserStore } from "@/app/store/userStore";
import { useNotificationStore } from "@/app/store/notificationStore";

const SocketContext = createContext({});

export const useGlobalSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { id } = useUserStore();
  const inviteEnabled = useNotificationStore((s) => s.inviteNotifications);
  const soundEnabled = useNotificationStore((s) => s.sound);
  const vibrationEnabled = useNotificationStore((s) => s.vibration);

  const [invite, setInvite] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    socket.emit("game:register", { playerId: id });

    socket.on("friend:inviteNotification", (data) => {
      if (!inviteEnabled) return;

      setInvite(data);

      if (soundEnabled) {
        const audio = new Audio("/sounds/invite.mp3");
        audio.play().catch(() => {});
      }

      if (vibrationEnabled && "vibrate" in navigator) {
        navigator.vibrate(200);
      }
    });

    return () => {
      socket.off("friend:inviteNotification");
    };
  }, [id, inviteEnabled, soundEnabled, vibrationEnabled]);

  return (
    <SocketContext.Provider value={{}}>
      {children}

      {invite && (
        <GlobalInvitePopup
          fromUsername={invite.fromUsername}
          fromAvatar={invite.fromAvatar}
          roomId={invite.roomId}
          onClose={() => setInvite(null)}
        />
      )}
    </SocketContext.Provider>
  );
}
