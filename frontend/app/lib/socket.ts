import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  transports: ["websocket"],
  autoConnect: false,
});

/**
 * The server rejects the handshake without a valid JWT, so the token has to be
 * attached before connecting. Always connect through this rather than calling
 * socket.connect() directly.
 */
export const connectSocket = (token: string) => {
  socket.auth = { token };
  if (!socket.connected) socket.connect();
};

socket.on("connect", () => {
  console.log("🟢 SOCKET CONECTADO:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 SOCKET DESCONECTADO:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ SOCKET ERROR:", err.message);
});
