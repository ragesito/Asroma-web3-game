"use client";

import { useState } from "react";
import { useUserStore } from "@/app/store/userStore";
import { useTranslation } from "react-i18next";
import api from "@/app/lib/api";
import Toast from "../toast";
import ToastPortal from "../toastPortal";

export default function ChangeUsername() {
  const { username, setUser } = useUserStore();
  const { t } = useTranslation();

  const [newUsername, setNewUsername] = useState(username || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: "info" | "success" | "error";
  } | null>(null);

  const handleChange = async () => {
    const trimmed = newUsername.trim();

    if (!trimmed) {
      setToast({
        message: t("enter_new_username"),
        type: "error",
      });
      return;
    }

    if (trimmed === username) {
      setToast({
        message: t("same_username_error") || "Username unchanged",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.put("/users/update-username", {
        username: trimmed,
      });
      setUser({ username: res.data.username });

      setToast({
        message: t("username_updated_successfully"),
        type: "success",
      });

    } catch (err: any) {
      

      setToast({
        message: err.response?.data?.message || t("error_updating_username"),
        type: "error",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔥 TOAST PORTAL GLOBAL*/}
      <ToastPortal>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </ToastPortal>
          
      {/* COMPONENT CONTENT */}
      <div className="w-[100%] mt-3 border border-white/10 bg-white/5 p-4 rounded-lg flex flex-col gap-3 items-center">
      <p className="text-sm text-gray-300 items-center justify-center">
        {t("select_new_username")}
      </p>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="bg-gray-300/10 border border-white/20 hover:bg-white/15 rounded-lg p-2 text-sm text-center text-white w-full focus:outline-none focus:ring-2 focus:ring-secondary placeholder-gray-400"
          placeholder={t("enter_new_username")}
        />

        <button
          onClick={handleChange}
          disabled={loading}
          className={`bg-orange-500 text-black px-4 py-2 rounded-md  bg-orange-600 hover:bg-orange-600 transition w-full ${
            loading ? "bg-gray-600 cursor-not-allowed" : "hover:bg-orange-600"
          }`}
        >
          {loading ? t("updating") + "..." : t("save_username")}
        </button>
      </div>
    </>
  );
}
