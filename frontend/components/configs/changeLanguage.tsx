"use client";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { useUserStore } from "@/app/store/userStore";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

export default function ChangeLanguage() {
  const { language, setLanguage } = useUserStore();
  const [selected, setSelected] = useState(language || "en");
  const { t, i18n } = useTranslation(); 

  useEffect(() => {
    i18n.changeLanguage(selected);
  }, [selected, i18n]);

  const handleChange = (lang: string) => {
    setSelected(lang);
    setLanguage(lang); 
    i18n.changeLanguage(lang); 
  };

  return (
    <div className="flex flex-col gap-1 border border-white/10 bg-white/5 p-4 rounded-xl">
      
      
      <div className="flex items-center gap-2  justify-center ">
        
        <p className="text-sm text-gray-300 mb-2 items-center justify-center">
        {t("choose_language")}
      </p>
        
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center justify-center gap-2 text-sm
              ${
                selected === lang.code
                  ? "bg-orange-500  text-black border-orange-500"
                  : " border-white/20 hover:bg-gray-100/10 text-gray-200"
              }`}
          >
            <span>{lang.flag}</span> {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
