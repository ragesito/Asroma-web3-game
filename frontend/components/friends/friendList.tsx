"use client";

import { useEffect, useState, useRef} from "react";
import { useUserStore } from "@/app/store/userStore";
import { socket } from "@/app/lib/socket";
import LoginModal from "../LoginModal";
import Toast from "@/components/toast";
import PrivateChatModal from "@/components/friends/chatModal";
import ConfirmModal from "@/components/confirmModal";
import ChangeAvatar from "../configs/changeAvatar";
import { useTranslation } from "react-i18next";
import LottieLoader from "../lottieLoader";
import { Button } from "@/components/statefulButton";
import { motion } from "framer-motion";
import { useNotificationStore } from "@/app/store/notificationStore";
import { resolveAvatarUrl } from "@/app/lib/avatar";

const FriendList = () => {
  const { id, token } = useUserStore();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<{ _id: string; username: string; avatar: string }[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [newFriend, setNewFriend] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" ; action?: { label: string; onClick: () => void } } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  // 🆕 Estado para guardar el estado de cada usuario
  const [userStatus, setUserStatus] = useState<Record<string, "online" | "in-game" | "offline">>({});
  const [confirmModal, setConfirmModal] = useState<{open: boolean;friend: any | null;}>({ open: false, friend: null });
  const { avatar } = useUserStore();
  
  const { t } = useTranslation();
  const chatOpenRef = useRef(chatOpen);
  const selectedFriendRef = useRef(selectedFriend);
  const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  useEffect(() => {
    chatOpenRef.current = chatOpen;
    selectedFriendRef.current = selectedFriend;
  }, [chatOpen, selectedFriend]);

  useEffect(() => {
     if (!token) {
    setLoading(false);
    return;
  }
    socket.emit("requestStatusSync", id);
    const fetchFriendsAndRequests = async () => {
      try {
        const friendsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/friends/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);

        const requestsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/friends/requests/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const requestsData = await requestsRes.json();
        setRequests(requestsData || []);
      } catch (error) {
        console.error("Error al cargar datos de amigos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsAndRequests();
  }, [id, token]);

    useEffect(() => {
      if (!id) return;

socket.on("friendRequest:new", (data) => {
  if (data.recipient !== id) return;
  refreshRequests();
});

const refreshRequests = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/friends/requests/me`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const list = await res.json();
  setRequests(list);
};

socket.on("friend:inviteNotification", (data) => {
  if (!useNotificationStore.getState().inviteNotifications) return;

  setToast({
    message: `${data.fromUsername} te invitó a una partida`,
    type: "info",
  });
});

 socket.on("friendRequest:accepted", (data) => {
  const { requester, recipient } = data;

  const isRequester = requester._id === id;
  const isRecipient = recipient._id === id;
  if (!isRequester && !isRecipient) return;

  const newFriend = isRequester ? recipient : requester;

  if (typeof newFriend !== "object" || !newFriend.username) return;

  setFriends((prev) => {
    const exists = prev.some(
      (f: any) =>
        (typeof f === "object" && f.username === newFriend.username) ||
        f === newFriend.username
    );
    if (exists) return prev;
    return [...prev, newFriend];
  });

  if (isRecipient) {
    setRequests((prev) =>
      prev.filter((r) => r.username !== requester.username)
    );
  }
});
      socket.on("friend:removed", ({ from }) => {

        const fromName = typeof from === "object" ? from.username : from;

        setFriends((prev: any[]) =>
          prev.filter((f) =>
            typeof f === "object" ? f.username !== fromName : f !== fromName
          )
        );

        setToast({
          message: t("friend_removed_you", { fromName }),
          type: "error",
        });
      });


        socket.on("user:status:init", (onlineUsers: string[]) => {

        setUserStatus((prev) => {
          const updated = { ...prev };
          for (const uid of onlineUsers) {
            updated[uid] = "online";
          }
          return updated;
        });
      });

        socket.on("user:status", ({ userId, status }) => {
          setUserStatus((prev) => ({ ...prev, [userId]: status }));
        });
        socket.on("avatarUpdated", ({ username: updatedUser, avatar }) => {
        console.log("🟣 Avatar actualizado:", updatedUser, avatar);
        
        if (updatedUser === id) {
          useUserStore.getState().setAvatar(avatar);
        }

        setFriends((prev) =>
          prev.map((f: any) => {
            const name =
              typeof f.username === "object"
                ? f.username.username
                : f.username ?? f;
            return name === updatedUser ? { ...f, avatar } : f;
          })
        );
      });

        const handleUsernameUpdate = ({ userId, newUsername }: { userId: string; newUsername: string }) => {
        setFriends((prev) =>
          prev.map((f) =>
            f._id === userId ? { ...f, username: newUsername } : f
          )
        );
      };

      socket.on("usernameUpdated", handleUsernameUpdate);



      const interval = setInterval(() => {
        if (id) {
          socket.emit("heartbeat", id);
        }
      }, 20000); 
      return () => {
         clearInterval(interval);
        socket.off("friendRequest:new");
        socket.off("friendRequest:accepted");
        socket.off("friend:removed");
        socket.off("user:status");
        socket.off("avatarUpdated");
        socket.off("usernameUpdated", handleUsernameUpdate);
      };
    }, [id]);

  const handleAddFriend = async () => {
    if (!newFriend.trim()) {
  if (!id) {
    setShowLogin(true); 
  }
  return;
}
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipient: newFriend }),
        }
      );

      const data = await res.json();
      if (res.ok) {
          socket.emit("friendRequest:send", {
          requester: id,
          recipient: data.recipientId, 
        });
        setToast({ message: t("request_sent_to", { newFriend }), type: "success" });
      } else {
        setToast({
          message: data.message || "Error sending request",
          type: "info"
        });
        return;
      }

      setNewFriend("");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-400">
        <LottieLoader />
      </div>
    );
  }
  const handleAccept = async (requester: any) => {
  try {
    const username =
      typeof requester === "object" ? requester.username : requester;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requester: username }),
    });

    const data = await res.json();

    if (res.ok) {
      const normalizedFriend = {
  _id: data.requester._id,
  username: data.requester.username,
  avatar: data.requester.avatar,
};

        socket.emit("friendRequest:accepted", {
  requester: {
    _id: data.requester._id,
    username: data.requester.username,
    avatar: data.requester.avatar,
  },
  recipient: {
    _id: id,
  },
});

      setFriends((prev) => {
        const exists = prev.some(
          (f: any) =>
            (typeof f === "object" && f.username === username) || f === username
        );
        if (exists) return prev;
        return [...prev, normalizedFriend];
      });

      setRequests((prev) =>
        prev.filter((r) =>
          typeof r === "object" ? r.username !== username : r !== username
        )
      );

      setToast({ message: t("request_accepted"), type: "success" });
    } else {
      setToast({ message: `❌ ${data.message}` });
    }
  } catch (error) {
    console.error("Error al aceptar solicitud:", error);
  }
};

  const handleDecline = async (requester: any) => {
  try {
    const username = typeof requester === "object" ? requester.username : requester;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/decline`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requester: username }),
    });

    const data = await res.json();
    if (res.ok) {
      setRequests((prev) =>
        prev.filter((r) =>
          typeof r === "object" ? r.username !== username : r !== username
        )
      );
      setToast({
        message: t("declined_request", { username }),
        type: "error",
      });
    } else {
      alert(`❌ ${data.message}`);
    }
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
  }
};

  const handleRemoveFriend = (friend: string) => {
    setConfirmModal({ open: true, friend });
  };

  const confirmRemoveFriend = async () => {
  if (!confirmModal.friend) return;
  const friend = confirmModal.friend;

  try {
    const friendUsername =
      typeof friend === "object" ? friend.username : friend;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ friend: friendUsername }),
    });

    const data = await res.json();

    if (res.ok) {
      socket.emit("friend:remove", { from: id, to: friendUsername });
      setFriends((prev) =>
        prev.filter((f: any) =>
          typeof f === "object" ? f.username !== friendUsername : f !== friendUsername
        )
      );
      setToast({ message: t("friend_removed", { friendUsername }), type: "error" });

    } else {
      setToast({ message: data.message || "Error removing friend", type: "error" });
    }
  } catch (error) {
    console.error("Error removing friend:", error);
    setToast({ message: "Server error", type: "error" });
  } finally {
    setConfirmModal({ open: false, friend: null });
  }
};

  
  console.log("🧠 FRIENDS DATA:", friends);
  
  return (
  <div className="flex justify-center items-start w-[90vw] text-white px-4 md:px-10">
    <div className="
  flex flex-col 
  md:grid md:grid-cols-1 md:items-start md:gap-6
  lg:flex lg:flex-row
  justify-between w-full gap-6
  py-14 px-4 lg:px-16 lg:py-14
">



      {/* 🔹 Friends */}
      <motion.aside
  className="
    w-full lg:w-2/4
    bg-white/5 border border-white/10 rounded-lg p-5 shadow-lg backdrop-blur-xl
    h-auto lg:h-[70vh]
    overflow-y-auto flex flex-col justify-between relative
  "

      variants={variants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>👥</span> {t("friends")}
        </h2>

        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
            <p className="text-center text-sm opacity-80">{t("any_friends", { emoji: "😅" })}</p>
            <p className="text-xs mt-1 text-secondary">{t("start_connecting")}</p>
          </div>
        ) : (
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {friends.map((friend: any, i) => {
  const friendName =
    typeof friend.username === "object"
      ? friend.username.username
      : friend.username ?? friend;


  return (
    <li
      key={i}
      className="group bg-gray-400/10  hover:bg-white/20 transition-all duration-200 p-3 rounded-lg flex justify-between items-center border border-transparent hover:border-secondary/30"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <img
            src={resolveAvatarUrl(friend.avatar)}
            alt={friendName}
            className="w-10 h-10 rounded-full border border-white/20 object-cover"
          />


          <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f1a] animate-pulse ${
            userStatus[friend._id] === "online"
              ? "bg-green-500"
              : userStatus[friend._id] === "in-game"
              ? "bg-yellow-400"
              : "bg-gray-500"
          }`}
        />

        </div>

        {/* Info */}
        <div>
          <p className="font-semibold text-sm">{friendName}</p>
          <p className="text-xs text-gray-400">
            {userStatus[friend._id] === "online"
              ? "Online"
              : userStatus[friend._id] === "in-game"
              ? "In Game"
              : "Offline"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const normalized =
              typeof friend === "object"
                ? typeof friend.username === "object"
                  ? friend.username
                  : friend
                : { username: friend };

            setSelectedFriend(normalized); 
            setChatOpen(true);
          }}
          className="px-2 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          💬
        </button>

        <button
          onClick={() => handleRemoveFriend(friend)}
          className="px-2 py-1 bg-red-600 rounded-md hover:bg-red-700 transition"
        >
          ❌
        </button>
      </div>
    </li>
  );
})}

          </ul>
        )}
      </motion.aside>

      {/* 🔹 Requests */}
      <motion.main
  className="
    w-full md:w-full lg:w-1/3
    bg-white/5 border border-white/10 rounded-lg p-5 shadow-lg backdrop-blur-xl
    h-auto lg:h-[70vh]
    overflow-y-auto flex flex-col justify-between relative
  "

      variants={variants} initial="hidden" animate="visible" transition={{ delay: 0.9 }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📩</span> {t("request")}
        </h2>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 ">
            <p className="opacity-80 text-sm">{t("no_pending_requests")}</p>
            <span className="text-4xl mt-2 opacity-40">🤝</span>
          </div>
        ) : (
          <ul className="space-y-3 flex-1 overflow-y-auto">
            {requests.map((req: any, i) => (
  <li
    key={req._id || i}
    className="bg-white/10 p-3 rounded-lg flex justify-between items-center hover:bg-white/20 transition-all duration-200"
  >
    <div className="flex items-center gap-3">
      <img
        src={resolveAvatarUrl(req.avatar)}
        className="w-8 h-8 rounded-full border border-white/20 object-cover"
      />
      <span className="font-medium">{req.username}</span>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => handleAccept(req.username)}
        className="px-2 py-1 bg-green-600 rounded-md hover:bg-green-700 transition"
      >
        {t("accept")}
      </button>
      <button
        onClick={() => handleDecline(req.username)}
        className="px-2 py-1 bg-red-600 rounded-md hover:bg-red-700 transition"
      >
        {t("decline")}
      </button>
    </div>
  </li>
))}

          </ul>
        )}
      </motion.main>

      {/* 🔹 Add Friend */}
      <motion.aside
  className="
    w-full md:w-full lg:w-1/3
    bg-white/5 border border-white/10 rounded-lg p-5 shadow-lg backdrop-blur-xl
    h-auto lg:h-[70vh]
    overflow-y-auto flex flex-col justify-between relative
  "

      variants={variants} initial="hidden" animate="visible" transition={{ delay: 1.2 }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>➕</span> {t("add_friend")}
        </h2>

        <div className="flex flex-col gap-4 mt-4">
          <p className="text-gray-100 text-sm">{t("search_by")}</p>
          <div className="relative">
            <input
              type="text"
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              placeholder={t("enter_username")}
              className="bg-white/10 border border-white/20 rounded-lg p-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-secondary pl-9"
            />
            <span className="absolute left-2 top-2 text-gray-100">🔍</span>
          </div>
          <Button
            onClick={handleAddFriend}
            className="bg-orange-700 py-2 rounded-lg hover:bg-secondary/80 transition text-white font-medium"
          >
            {t("send_request")}
          </Button>
        </div>
      </motion.aside>
    </div>

    {/* Toast */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
        action={toast.action} 
      />
    )}

    {/* Chat Modal */}
    {chatOpen && selectedFriend && (
      <PrivateChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        friend={selectedFriend}
        username={useUserStore.getState().username as string} // ✅ fuerza tipo string
        id={useUserStore.getState().id as string} // ✅ fuerza tipo string
      />


    )}

    {/* Confirm Remove */}
    <ConfirmModal
  isOpen={confirmModal.open}
  message={t("friend_remove", {
    friend:
    confirmModal.friend && typeof confirmModal.friend === "object"
      ? confirmModal.friend.username
      : confirmModal.friend || "",
  })}
  onConfirm={confirmRemoveFriend}
  onCancel={() => setConfirmModal({ open: false, friend: null })}
/>
  <LoginModal
    isOpen={showLogin}
    onClose={() => setShowLogin(false)}
     onLoginSuccess={() => setShowLogin(false)}
     defaultRegister={true}
    />

  </div>
);

};

export default FriendList;
