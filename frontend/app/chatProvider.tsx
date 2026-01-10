"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/app/lib/socket";
import Toast from "@/components/toast";
import PrivateChatModal from "@/components/friends/chatModal";
import { useUserStore } from "@/app/store/userStore";
import { useNotificationStore } from "@/app/store/notificationStore";
import { useChatStore } from "@/app/store/chatStore"; // ahora SÍ lo usamos
import { useTranslation } from "react-i18next";
export default function ChatProvider({ children }: { children: React.ReactNode }) {
  const { id: myId } = useUserStore();
  const { t } = useTranslation();
  const [toast, setToast] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const chatOpenRef = useRef(chatOpen);
  const selectedFriendRef = useRef(selectedFriend);
  useEffect(() => {
    chatOpenRef.current = chatOpen;
    selectedFriendRef.current = selectedFriend;
    }, [chatOpen, selectedFriend]);

  useEffect(() => {
    if (!myId) return;

    socket.on("chat:notification", (data) => {
      setToast({
        message: `new message from ${data.senderName}`,
        type: "info",
        action: {
          label: "Abrir",
          onClick: () => {
            setSelectedFriend({
              id: data.senderId,
              username: data.senderName,
              avatar: data.senderAvatar,
            });
            setChatOpen(true);
          }
        }
      });
    });

    return () => {
      socket.off("chat:notification");
    };
  }, [myId]);

 useEffect(() => {
  if (!myId) return;

  const handler = (data: any) => {
    if (!useNotificationStore.getState().messageNotifications) return;
    if (data.to !== myId) return;

    const activeChat = useChatStore.getState().activeChatId;
    if (activeChat === data.from) return;

    setToast({
      message: `💬 ${data.sender?.username} sent you a message`,
      type: "info",
      action: {
        label: "Abrir",
        onClick: () => {
          setSelectedFriend({
            _id: data.from,
            username: data.sender?.username,
            avatar: data.sender?.avatar,
          });
          useChatStore.getState().setActiveChatId(data.from);
          setChatOpen(true);
        },
      },
    });
  };

  socket.on("private:message", handler);

  // ✅ cleanup CORRECTO
  return () => {
    socket.off("private:message", handler);
  };
}, [myId]);


  return (
    <>
      {children}

      {/* ⬇ Notificación global */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      )}

      {/* ⬇ Modal global */}
      {chatOpen && selectedFriend && (
        <PrivateChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          friend={selectedFriend}
          username={useUserStore.getState().username!}
          id={useUserStore.getState().id!}
        />
      )}
    </>
  );
}
