"use client";
import { useEffect } from "react";
import api from "@/app/lib/api";
import { useUserStore } from "@/app/store/userStore";

export function useSyncUser() {
  const { token, setUser, isLoggedIn, logout, language } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn()) return;

    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");

        if (!res) return;
        setUser({
          username: res.data.username,
          avatar: res.data.avatar,
          language: language || res.data.language || "en",
          id: res.data._id,
        });

      } catch (err: any) {
        console.error("❌ Error syncing user:", err);

        if (err.response?.status === 401) {
          console.warn("⚠️ Token inválido o expirado. Haciendo logout automático.");
          logout(); 
        }
      }
    };

    fetchUser();
  }, [token]);
}
