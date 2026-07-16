// backend/sockets/chatSocket.ts
import { Server } from "socket.io";
import { Types } from "mongoose";
import { Message } from "../models/message";
import { User } from "../models/user";

const MAX_MESSAGE_LENGTH = 2000;

export const setupChatSocket = (io: Server) => {
  const connectedUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    // socketAuth (io.use) guarantees this is set and verified. Never reassign
    // it from an event payload.
    const userId: string = socket.data.userId;
    console.log("💬 Nuevo socket conectado:", socket.id, userId);

    connectedUsers.set(userId, socket.id);

    socket.on("registerUser", () => {
      // Identity comes from the handshake; this only refreshes the socket id
      // after a reconnect.
      connectedUsers.set(userId, socket.id);
    });

    socket.on("heartbeat", () => {
      connectedUsers.set(userId, socket.id);
    });

socket.on("private:message", async ({ to, text }) => {
  const from = userId;
  if (!to || typeof text !== "string") return;

  const message = text.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return;
  if (!Types.ObjectId.isValid(to)) return;

  try {
    const newMsg = new Message({ from, to, message });
    await newMsg.save();

    const sender = await User.findById(from).select("username avatar");
    const payload = {
      from,
      to,
      text: message,
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
      // Only drop the mapping if this socket still owns it; a reconnect may
      // already have replaced it with a newer socket for the same user.
      if (connectedUsers.get(userId) === socket.id) {
        connectedUsers.delete(userId);
        console.log(`🔴 Usuario ${userId} desconectado del chat`);
      }
    });
  });
};
