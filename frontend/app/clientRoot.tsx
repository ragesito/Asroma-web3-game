"use client";

import { useEffect } from "react";
import { useSyncUser } from "@/app/hooks/useSyncUser";
import { useUserStore } from "@/app/store/userStore";
import { socket } from "@/app/lib/socket";
import { useAuthBootstrap } from "@/app/hooks/useAuthBootstrap";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  useSyncUser(); 
  const { id, token } = useUserStore();

  useEffect(() => {
    console.log("🧠 useEffect ejecutado con id:", id, "token:", token);
    if (!id || !token) return;

    if (!socket.connected) {
      socket.connect();
      console.log("🔌 Socket conectado globalmente");
    }

    console.log("📡 Registrando usuario global:", id);
    socket.emit("registerUser", id);

    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat", id);
      }
    }, 20000);

    return () => {
  clearInterval(interval);
  console.log("🧹 Limpieza de ClientRoot (sin desconectar socket)");
};
  }, [id, token]); 

  return <>{children}</>;
}
