"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hasHydrated } = useUserStore();

  useEffect(() => {

    if (!hasHydrated) return;

    if (!token) {
      router.replace("/");
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return null;

  if (!token) return null;

  return <>{children}</>;
}
