"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/lib/api";

interface PhantomRegisterModalProps {
  open: boolean;
  onClose: () => void;
  onNeedEmailVerify: (email: string, password: string) => void;
}

export default function PhantomRegisterModal({
  open,
  onClose,
  onNeedEmailVerify,
}: PhantomRegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    const phantomToken = sessionStorage.getItem("phantomToken");
    if (!phantomToken) {
      setError("Phantom session expired. Please retry.");
      return;
    }

    try {
      setLoading(true);
      setError("");

     await api.post("/auth/phantom/complete", {
        phantomToken,
        username,
        email,
        password,
      });

      sessionStorage.removeItem("phantomToken");
      onClose();

      onNeedEmailVerify(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <div className="fixed inset-0 flex items-center justify-center z-[99999] p-4">
          <motion.div
            className="bg-black/90 text-white w-full max-w-[520px] p-6 rounded-xl shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl mb-4 text-center font-semibold">
              Complete your account
            </h2>

            <input
              type="text"
              placeholder="Username"
              className="w-full mb-2 p-2 rounded bg-white/10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full mb-2 p-2 rounded bg-white/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 p-2 rounded bg-white/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
            )}

            <button
              onClick={handleComplete}
              disabled={loading}
              className={`w-full p-2 rounded ${
                loading
                  ? "bg-gray-600"
                  : "bg-orange-700 hover:bg-orange-800"
              }`}
            >
              {loading ? "Processing..." : "Complete Registration"}
            </button>
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  );
}
