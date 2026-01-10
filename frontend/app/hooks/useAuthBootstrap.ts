"use client";

import { useEffect } from "react";
import api from "@/app/lib/api";
import { useUserStore } from "@/app/store/userStore";

export function useAuthBootstrap() {
  const { token, setUser, logout, hasHydrated } = useUserStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      logout();
      return;
    }

    api.get("/users/me")
      .then((res) => {
        if (!res) return;
        setUser(res.data);
      })
      .catch(() => {
        logout();
      });
  }, [hasHydrated]); 
}
