// backend/sockets/chatSocket.ts
import { Server } from "socket.io";
import { Message } from "../models/message";
import { User } from "../models/user";

export const setupChatSocket = (io: Server) => {
  const connectedUsers = new Map<string, string>(); 

  io.on("connection", (socket) => {
    console.log("💬 Nuevo socket conectado:", socket.id);

    socket.on("registerUser", (userId: string) => {
      if (!userId) return;
      connectedUsers.set(userId, socket.id);
      socket.data.userId = userId;
      console.log(`✅ Usuario ${userId} registrado en el chat (${socket.id})`);
    });

    socket.on("heartbeat", (userId: string) => {
      if (connectedUsers.has(userId)) {
        connectedUsers.set(userId, socket.id);
      }
    });

socket.on("private:message", async ({ from, to, text }) => {
  if (!from || !to || !text) return;
  console.log(`💌 ${from} → ${to}: ${text}`);

  try {
    const newMsg = new Message({ from, to, message: text });
    await newMsg.save();

    const sender = await User.findById(from).select("username avatar");
    const payload = {
      from,
      to,
      text,
      sender: sender
        ? {
            username: sender.username,
            avatar: sender.avatar || "/uploads/default-avatar.jpg",
          }
        : null,
    };

    const recipientSocket = connectedUsers.get(to);
    if (recipientSocket) {
      io.to(recipientSocket).emit("private:message", payload);
      console.log(`📤 Enviado mensaje a receptor ${to}`);
    }

  } catch (err) {
    console.error("❌ Error al procesar mensaje:", err);
  }
});

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        connectedUsers.delete(userId);
        console.log(`🔴 Usuario ${userId} desconectado del chat`);
      }
    });
  });
};
