"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "@/app/lib/i18n";
import { useUserStore } from "@/app/store/userStore";
import { useEffect } from "react";

export default function I18nLayout({ children }: { children: React.ReactNode }) {
  const { language } = useUserStore();

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
