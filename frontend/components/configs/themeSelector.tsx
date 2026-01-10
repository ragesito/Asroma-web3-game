"use client";

import { useThemeStore } from "@/app/store/themeStore";
import { useTranslation } from "react-i18next";

export default function ThemeSelector() {
  const { setTheme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <div className=" p-3 border border-white/10 bg-white/5 rounded-lg  items-center justify-center">
      
<div className="flex items-center gap-2 mb-3 justify-center ">
        
        <p className="text-sm text-gray-300 mb-2 items-center justify-center">
        {t("select_theme")}
      </p>
      </div>
      <div className="flex gap-3 items-center justify-center">
        <button
          onClick={() => setTheme("default")}
          className="px-4 py-2 rounded-lg bg-purple-900 text-black font-medium hover:opacity-70 transition"
        >
          {t("theme_default")}
        </button>

        <button
          onClick={() => setTheme("halloween")}
          className="px-4 py-2 rounded-lg bg-orange-500 text-black font-medium hover:opacity-70 transition"
        >
          {t("theme_halloween")}
        </button>

        <button
          onClick={() => setTheme("dark")}
          className="px-4 py-2 rounded-lg bg-gray-800 text-black font-medium hover:opacity-70 transition"
        >
          {t("theme_dark")}
        </button>
      </div>
    </div>
  );
}
