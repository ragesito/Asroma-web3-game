import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  transports: ["websocket"],
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("🟢 SOCKET CONECTADO:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 SOCKET DESCONECTADO:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ SOCKET ERROR:", err.message);
});
