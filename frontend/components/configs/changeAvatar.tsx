"use client";
import { useState } from "react";
import { updateAvatar } from "@/app/lib/user";
import { useUserStore } from "@/app/store/userStore";
import { useHydrated } from "@/app/hooks/useHydrated";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";
import Toast from "@/components/toast";
import ToastPortal from "../toastPortal";
import { resolveAvatarUrl } from "@/app/lib/avatar";

const socket = io(process.env.NEXT_PUBLIC_API_URL!, { transports: ["websocket"] });
export default function ChangeAvatar() {
  const { token, avatar, setAvatar } = useUserStore();
  const hydrated = useHydrated();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
   const { t, i18n } = useTranslation(); 
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" ; action?: () => void; } | null>(null);
  if (!hydrated) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
    );
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
  };
  
  const handleUpload = async () => {
  if (!file) {
    alert("Please select a file first!");
    return;
  }

  setLoading(true);
  try {
    const data = await updateAvatar(token!, file);
    console.log("🟩 Servidor devolvió:", data);
    setAvatar(data.avatar); 
    
     setToast({
    message: t("avatar_success"),
    type: "success",
  });
  } catch (err) {
    console.error("Error:", err);
     setToast({
    message: t("avatar_error"),
    type: "error",
  });
  } finally {
    setLoading(false);
  }
};



  return (
    
    <div className="w-[100%] border border-white/10 bg-white/5 p-4 rounded-lg flex flex-col gap-3 items-center ">
        
      <div className="flex items-center gap-2  justify-center ">
        
        <p className="text-sm text-gray-300 mb-2 items-center justify-center">
        {t("select_new_avatar")}
      </p>
        
      </div>

      <img
        src={resolveAvatarUrl(avatar)}
        alt="avatar"
        className="w-24 h-24 rounded-full border border-white/20 object-cover"
      />


      <div className="flex flex-col items-center gap-2 w-full">
    <label className="cursor-pointer text-sm text-black border border-white/20 bg-orange-500/90 px-4 py-2 rounded-md hover:bg-orange-600/80 transition">
        {t("choose_file")}
        <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        />
    </label>
    {file && <p className="text-xs text-gray-400">{file.name}</p>}
    </div>


      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-orange-600 text-black px-4 py-2 rounded-md hover:bg-orange-700 transition"
      >
        {loading ? "Uploading..." : t("save_avatar")}
      </button>
      {/* Toast */}
          {toast && (
            <ToastPortal>
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            </ToastPortal>
          )}
    </div>
  );
}
