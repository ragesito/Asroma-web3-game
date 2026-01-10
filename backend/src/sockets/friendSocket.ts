import { Server } from "socket.io";
import { FriendList } from "../models/friendList";
import { User } from "../models/user";

const connectedUsers = new Map<string, string>(); 

export const setupFriendSocket = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("registerUser", async (userId: string) => {
      if (!userId) return;

      socket.data.userId = userId;
      connectedUsers.set(userId, socket.id);

      socket.emit("user:status:init", Array.from(connectedUsers.keys()));

      try {
        const list = await FriendList.findOne({ user: userId }).populate("friends", "_id");
        if (!list) return;

        for (const friend of list.friends as any[]) {
          const friendSocket = connectedUsers.get(friend._id.toString());
          if (friendSocket) {
            io.to(friendSocket).emit("user:status", {
              userId,
              status: "online",
            });
          }
        }
      } catch {}
    });

    socket.on("requestStatusSync", async (userId: string) => {
      if (!userId) return;

      try {
        const list = await FriendList.findOne({ user: userId }).populate("friends", "_id");
        if (!list) return;

        const onlineFriends = list.friends
          .filter((f: any) => connectedUsers.has(f._id.toString()))
          .map((f: any) => f._id.toString());

        socket.emit("user:status:init", onlineFriends);
      } catch {}
    });

    socket.on("friendRequest:send", async (data) => {
      if (!data?.recipient || !data?.requester) return;

      const targetSocket = connectedUsers.get(data.recipient);
      if (!targetSocket) return;

      try {
        const requester = await User.findById(data.requester).select("username avatar");
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

    socket.on("friendRequest:accepted", (data) => {
      const requesterId = data?.requester?._id;
      if (!requesterId) return;

      const requesterSocket = connectedUsers.get(requesterId);
      if (requesterSocket) {
        io.to(requesterSocket).emit("friendRequest:accepted", data);
      }
    });

    socket.on("friend:remove", ({ from, to }) => {
      if (!from || !to) return;

      const targetSocket = connectedUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("friend:removed", { from });
      }
    });

    socket.on("heartbeat", (userId: string) => {
      if (userId && connectedUsers.has(userId)) {
        connectedUsers.set(userId, socket.id);
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      connectedUsers.delete(userId);

      try {
        const list = await FriendList.findOne({ user: userId }).populate("friends", "_id");
        if (!list) return;

        for (const friend of list.friends as any[]) {
          const friendSocket = connectedUsers.get(friend._id.toString());
          if (friendSocket) {
            io.to(friendSocket).emit("user:status", {
              userId,
              status: "offline",
            });
          }
        }
      } catch {}
    });

    socket.on("manualDisconnect", async (userId: string) => {
      if (!userId) return;

      connectedUsers.delete(userId);

      try {
        const list = await FriendList.findOne({ user: userId }).populate("friends", "_id");
        if (!list) return;

        for (const friend of list.friends as any[]) {
          const friendSocket = connectedUsers.get(friend._id.toString());
          if (friendSocket) {
            io.to(friendSocket).emit("user:status", {
              userId,
              status: "offline",
            });
          }
        }
      } catch {}
    });
  });
};
