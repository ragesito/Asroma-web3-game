"use client";

import { useEffect } from "react";
import { useSyncUser } from "@/app/hooks/useSyncUser";
import { useUserStore } from "@/app/store/userStore";
import { socket, connectSocket } from "@/app/lib/socket";
import { useAuthBootstrap } from "@/app/hooks/useAuthBootstrap";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  useSyncUser();
  const { id, token } = useUserStore();

  useEffect(() => {
    if (!id || !token) return;

    connectSocket(token);
    socket.emit("registerUser");

    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat");
      }
    }, 20000);

    return () => {
  clearInterval(interval);
  console.log("🧹 Limpieza de ClientRoot (sin desconectar socket)");
};
  }, [id, token]); 

  return <>{children}</>;
}
