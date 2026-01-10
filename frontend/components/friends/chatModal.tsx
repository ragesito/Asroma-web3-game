"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/app/lib/socket";
import { useTranslation } from "react-i18next";

interface PrivateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: any;
  username: string;
  id: string; 
}

export default function PrivateChatModal({
  isOpen,
  onClose,
  friend,
  username,
  id,
}: PrivateChatModalProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !friend || !id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${id}/${friend._id}`
        );
        const data = await res.json();
        if (!Array.isArray(data)) return;

        setMessages(
          data.map((m: any) => ({
            from: m.from._id,
            text: m.message,
          }))
        );
      } catch (error) {
        console.error("Error al obtener mensajes:", error);
      }
    };

    fetchMessages();

    if (!socket.connected) socket.connect();
    socket.emit("registerUser", id);

    const handleMessage = (data: any) => {
      if (
        (data.from === id && data.to === friend._id) ||
        (data.from === friend._id && data.to === id)
      ) {
        setMessages((prev) => [...prev, { from: data.from, text: data.text }]);
      }
    };

    socket.on("private:message", handleMessage);
    return () => {socket.off("private:message", handleMessage);};
  }, [isOpen, friend, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = { from: id, to: friend._id, text: message };

    setMessages((prev) => [...prev, newMsg]);
    socket.emit("private:message", newMsg);

    setMessage("");
  };

  if (!isOpen) return null;

  const friendName =
    typeof friend === "object"
      ? friend.username?.username || friend.username
      : friend;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={chatRef}
          className="bg-black/90 text-white w-[500px] h-[600px] mx-4 rounded-xl shadow-lg p-5 flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h2 className="text-lg font-semibold">
              {t("chat_with")}&nbsp; <span className="text-orange-700"> {friendName}</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              ✖
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center mt-20">
                No messages yet 😶
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${
                    msg.from === id
                      ? "bg-secondary text-black self-end ml-auto"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("type_message")}
              className="flex-1 p-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 text-black font-medium"
            >
              ➤
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
