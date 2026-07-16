import { Server } from "socket.io";
import { FriendList } from "../models/friendList";
import { User } from "../models/user";

const connectedUsers = new Map<string, string>();

export const setupFriendSocket = (io: Server) => {
  const friendIdsOf = async (userId: string): Promise<string[]> => {
    const list = await FriendList.findOne({ user: userId }).populate("friends", "_id");
    if (!list) return [];
    return (list.friends as any[]).map((f) => f._id.toString());
  };

  /** Tell this user's online friends that their presence changed. */
  const broadcastStatus = async (userId: string, status: "online" | "offline") => {
    try {
      for (const friendId of await friendIdsOf(userId)) {
        const friendSocket = connectedUsers.get(friendId);
        if (friendSocket) {
          io.to(friendSocket).emit("user:status", { userId, status });
        }
      }
    } catch {}
  };

  /** Which of this user's friends are currently online. */
  const sendOnlineFriends = async (socketId: string, userId: string) => {
    try {
      const online = (await friendIdsOf(userId)).filter((id) => connectedUsers.has(id));
      io.to(socketId).emit("user:status:init", online);
    } catch {}
  };

  io.on("connection", (socket) => {
    // socketAuth (io.use) guarantees this is set and verified. Never reassign
    // it from an event payload.
    const userId: string = socket.data.userId;

    connectedUsers.set(userId, socket.id);

    socket.on("registerUser", async () => {
      connectedUsers.set(userId, socket.id);
      await sendOnlineFriends(socket.id, userId);
      await broadcastStatus(userId, "online");
    });

    socket.on("requestStatusSync", async () => {
      await sendOnlineFriends(socket.id, userId);
    });

    socket.on("friendRequest:send", async (data) => {
      if (!data?.recipient) return;

      const targetSocket = connectedUsers.get(data.recipient);
      if (!targetSocket) return;

      try {
        const requester = await User.findById(userId).select("username avatar");
        if (!requester) return;

        io.to(targetSocket).emit("friendRequest:new", {
          requester: {
            _id: requester._id,
            username: requester.username,
            avatar: requester.avatar,
          },
          recipient: data.recipient,
        });
      } catch {}
    });

    socket.on("friendRequest:accepted", async ({ requesterId }) => {
      if (!requesterId) return;

      const requesterSocket = connectedUsers.get(requesterId);
      if (!requesterSocket) return;

      try {
        const accepter = await User.findById(userId).select("username avatar");
        if (!accepter) return;

        // Rebuilt server-side from the authenticated identity rather than
        // relaying the client's blob.
        io.to(requesterSocket).emit("friendRequest:accepted", {
          requester: {
            _id: accepter._id,
            username: accepter.username,
            avatar: accepter.avatar,
          },
        });
      } catch {}
    });

    socket.on("friend:remove", ({ to }) => {
      if (!to) return;

      const targetSocket = connectedUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("friend:removed", { from: userId });
      }
    });

    socket.on("heartbeat", () => {
      connectedUsers.set(userId, socket.id);
    });

    socket.on("disconnect", async () => {
      // Only drop the mapping if this socket still owns it; a reconnect may
      // already have replaced it with a newer socket for the same user.
      if (connectedUsers.get(userId) !== socket.id) return;

      connectedUsers.delete(userId);
      await broadcastStatus(userId, "offline");
    });

    socket.on("manualDisconnect", async () => {
      connectedUsers.delete(userId);
      await broadcastStatus(userId, "offline");
    });
  });
};
