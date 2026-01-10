"use client";

import { useState } from "react";
import { User, Palette, Bell, Lock, Globe, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/app/store/themeStore";
import { useUserStore } from "@/app/store/userStore";
import ChangeAvatar from "@/components/configs/changeAvatar";
import ChangeLanguage from "./changeLanguage";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useHydrated } from "@/app/hooks/useHydrated";
import ChangeUsername from "./changeUsername";
import DeleteAccountModal from "./deleteAccountModal";
import ChangePassword from "./changePassword";
import NeonSwitch from "./neonSwitch";
import { useNotificationStore } from "@/app/store/notificationStore";
import ConfigModal from "@/components/configs/configModal";
import ThemeSelector from "@/components/configs/themeSelector";
import Toast from "@/components/toast";
import ToastPortal from "@/components/toastPortal";

export default function Configs() {
  const [active, setActive] = useState("profile");
  const { setTheme } = useThemeStore();
  const { username, avatar } = useUserStore();
  const { t, i18n} = useTranslation();
  const hydrated = useHydrated();
  const [toast, setToast] = useState<{
  message: string;
  type?: "success" | "error" | "info";
} | null>(null);

const msg = useNotificationStore((s) => s.messageNotifications);
const fr = useNotificationStore((s) => s.friendRequestNotifications);
const inv = useNotificationStore((s) => s.inviteNotifications);
const snd = useNotificationStore((s) => s.sound);
const vib = useNotificationStore((s) => s.vibration);
type ConfigModal =
  | null
  | "username"
  | "avatar"
  | "language"
  | "password"
  | "theme";


const [openModal, setOpenModal] = useState<ConfigModal>(null);

const setSetting = useNotificationStore((s) => s.setSetting);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

   const sections = useMemo(
    () => [
      { id: "profile", label: t("profile", { emoji: "" }), icon: <User className="w-5 h-5" /> },
      { id: "personalization", label: t("personalization", { emoji: "" }), icon: <Palette className="w-5 h-5" /> },
      { id: "notifications", label: t("notifications", { emoji: "" }), icon: <Bell className="w-5 h-5" /> },
      { id: "security", label: t("security", { emoji: "" }), icon: <Lock className="w-5 h-5" /> },
      { id: "danger", label: t("danger_zone", { emoji: "" }), icon: <ShieldAlert className="w-5 h-5" /> },
    ],
    [t, i18n.language] 
  );
    const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  if (!hydrated) return null;
  return (
    <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
  className="flex justify-center items-start w-full text-white px-4 md:px-10 mt-14 md:mt-0 py-20 md:py-10"
>
  <div className="flex flex-col md:flex-row w-full max-w-7xl bg-black/30 backdrop-blur  border border-white/10 rounded-lg shadow-md  my-auto h-auto md:h-[67vh] min-h-screen md:min-h-0 overflow-hidden">

    {/* left sidebar */}
    <aside className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-white/10 p-5 flex-shrink-0">
      <div className="sticky top-0 flex flex-col space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActive(section.id)}
          className={`relative flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all group
            ${
              active === section.id
                ? "bg-orange-500 text-black font-semibold"
                : "hover:bg-white/10 text-gray-300"
            }`}
        >
          
          
          {section.icon}
          {section.label}
        </button>
      ))}
      </div>
    </aside>

        {/* 🧩 dynamic right panel */}
        <section className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 relative">
          {/* user header */}
          

          {/* 🌀 animations among sections */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {active === "profile" && (
  <div>
    <h2 className="text-4xl font-bold mb-4">
      {t("profile", { emoji: "🙎🏻‍♂️" })}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
      
      
        
        <div className="bg-orange-600/20 border-orange-500/30  p-4 rounded-lg">
                     <h2 className="font-bold text-3xl">{t("username")}</h2>
                     <p className="text-gray-300 mt-2">{t("select_username_phrase")}</p>
                        <button
  onClick={() => setOpenModal("username")}
  className=" px-4 py-2 bg-orange-700  text-center  mt-2 rounded-md text-sm font-medium w-38 hover:bg-orange-800 transition"
>
 {t("change_username")}
</button>
                        
                    </div>
      

     

       
          <div className="bg-purple-900/50 border-purple-900/60  p-4 rounded-lg">
                     <h2 className="font-bold text-3xl">{t("avatar")}</h2>
                     <p className="text-gray-300 mt-2">{t("select_avatar_phrase")}</p>
                        <button
  onClick={() => setOpenModal("avatar")}
  className=" px-4 py-2 bg-purple-700  text-center  mt-2 rounded-md text-sm font-medium w-38 hover:bg-purple-800 transition"
>
 {t("change_avatar")}
</button>
                        
                    </div>
        
      </div>

      

    
  </div>
)}

              {active === "personalization" && (
                <div>
                    <h2 className="text-4xl font-bold mb-4">{t("personalization", { emoji: "" })}</h2>

                    <div className="space-y-4">
                     
                    <div className="bg-pink-600/20 border-pink-500/30  p-4 rounded-lg">
                     <h2 className="font-bold text-3xl">{t("theme")}</h2>
                     <p className="text-gray-300 mt-2">{t("select_theme")}</p>
                        <button
  onClick={() => setOpenModal("theme")}
  className=" px-4 py-2 bg-pink-700  text-center  mt-2 rounded-md text-sm font-medium w-38 hover:bg-pink-800 transition"
>
 {t("choose_theme")}
</button>
                        
                    </div>
                    <div className="space-y-4 ">
                     <div className="bg-purple-800/20 border-purple-500/30  p-4 rounded-lg">
                     <h2 className="font-bold text-3xl">{t("language")}</h2>
                     <p className="text-gray-300 mt-2">{t("choose_language")}</p>
                        <button
  onClick={() => setOpenModal("language")}
  className=" px-4 py-2 bg-purple-800  text-center  mt-2 rounded-md text-sm font-medium w-38 hover:bg-purple-900 transition"
>
 {t("select_language")}
</button>
                        
                    </div>
                    
                  </div>
                    
                    </div>
                </div>
                )}

{active === "notifications" && (
  <div>
    <h2 className="text-4xl font-bold mb-4 flex items-center gap-2">
     {t("notifications", { emoji: "🔔"})}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

  <div className="bg-black/20 p-5 rounded-xl flex justify-between items-center">
    <span className=" text-gray-200">{t("message_notifications")}</span>
    <NeonSwitch enabled={msg} onChange={(v) => setSetting("messageNotifications", v)} />
  </div>

  <div className="bg-black/20 p-5 rounded-xl flex justify-between items-center">
    <span className="  text-gray-200">{t("friend_request_notifications")}</span>
    <NeonSwitch enabled={fr} onChange={(v) => setSetting("friendRequestNotifications", v)} />
  </div>

  <div className="bg-black/20 p-5 rounded-xl flex justify-between items-center">
    <span className="  text-gray-200">{t("invite_notifications")}</span>
    <NeonSwitch enabled={inv} onChange={(v) => setSetting("inviteNotifications", v)} />
  </div>

  <div className="bg-black/20 p-5 rounded-xl flex justify-between items-center">
    <span className=" text-gray-200">{t("sound_notifications")}</span>
    <NeonSwitch enabled={snd} onChange={(v) => setSetting("sound", v)} />
  </div>

  <div className="bg-black/20 p-5 rounded-xl flex justify-between items-center">
    <span className="  text-gray-200">{t("vibration_notifications")}</span>
    <NeonSwitch enabled={vib} onChange={(v) => setSetting("vibration", v)} />
  </div>

</div>


  </div>
)}



             {active === "security" && (
  <div>
    <h2 className="text-4xl font-bold mb-4">{t("security", { emoji: "🔐" })}</h2>

    {/* TOP ROW: Password + 2FA */}
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

      {/* Change Password (más pequeño) */}
       <div className="bg-orange-600/20 border-orange-500/30  p-4 rounded-lg">
                     <h2 className="font-bold text-3xl">{t("password")}</h2>
                     <p className="text-gray-300 mt-2">{t("change_password_phrase")}</p>
                        <button
  onClick={() => setOpenModal("password")}
  className=" px-4 py-2 bg-orange-700  text-center  mt-2 rounded-md text-sm font-medium w-38 hover:bg-orange-800 transition"
>
 {t("change_password")}
</button>
                        
                    </div>

      {/* Enable 2FA (a la derecha) */}
      <div className="bg-black/20 p-5 rounded-xl flex flex-col justify-center">
        <h4 className="font-semibold mb-2">Enable 2FA</h4>
        <p className="text-gray-400 text-sm mb-3">Increase account security.</p>
        <button className="px-4 py-2 w-28 bg-orange-600 hover:bg-orange-700 rounded-md text-sm font-medium">
          Enable 2FA
        </button>
      </div>

    </div>

    {/* FULL WIDTH ROW */}
    <div className="bg-black/20 p-5 rounded-xl mt-4">
      Logout from all devices
    </div>
  </div>
)}



              {active === "danger" && (
                <div>
                  <h2 className="text-4xl font-bold mb-4 text-red-400">{t("danger_zone", { emoji: "⚠️" })}</h2>
                  <div className="bg-red-600/20 p-5 rounded-xl border border-red-500/30">
                    <p>{t("delete_account_permanently")}</p>
                    <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium"
                    onClick={() => setDeleteModalOpen(true)}>
                      {t("delete_account")}
                    </button>
                  </div>
                </div>
              )}
              
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
      <DeleteAccountModal
  open={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  onConfirm={async (password: string) => {
    try {
      const token = useUserStore.getState().token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToast({
          message: t("password_incorrect"),
          type: "error",
        });
        return;
      }

      // Limpiar sesión
      useUserStore.getState().logout();
      localStorage.removeItem("token");
      setDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
      setToast({
        message: t("unexpected_error"),
        type: "error",
      });
    }
  }}
/>
{toast && (
  <ToastPortal>
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  </ToastPortal>
)}
{/* CHANGE USERNAME */}
<ConfigModal
  open={openModal === "username"}
  title={t("change_username")}
  onClose={() => setOpenModal(null)}
>
  <ChangeUsername />
</ConfigModal>

{/* CHANGE AVATAR */}
<ConfigModal
  open={openModal === "avatar"}
  title={t("change_avatar")}
  onClose={() => setOpenModal(null)}
>
  <ChangeAvatar />
</ConfigModal>

{/* CHANGE LANGUAGE */}
<ConfigModal
  open={openModal === "language"}
  title={t("language")}
  onClose={() => setOpenModal(null)}
>
  <ChangeLanguage />
</ConfigModal>

{/* CHANGE PASSWORD */}
<ConfigModal
  open={openModal === "password"}
  title={t("change_password")}
  onClose={() => setOpenModal(null)}
>
  <ChangePassword />
</ConfigModal>
<ConfigModal
  open={openModal === "theme"}
  title={t("Theme")}
  onClose={() => setOpenModal(null)}
>
  <ThemeSelector />
</ConfigModal>
    </motion.div>
    
  );
}
