"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/app/store/themeStore";
import { themes } from "@/app/providers/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const selected = themes[theme as keyof typeof themes];

    if (selected) {
      for (const key in selected) {
        document.documentElement.style.setProperty(key, selected[key as keyof typeof selected]);
      }
    }
  }, [theme]);

  return <>{children}</>;
}
