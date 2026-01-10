"use client";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/app/store/userStore";
import { useHydrated } from "@/app/hooks/useHydrated";
import { useRouter } from "next/navigation"; 
import { socket } from "@/app/lib/socket";
import { useTranslation } from "react-i18next";
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoIosSettings } from "react-icons/io";
import Configs from "@/components/configs/configsModal";

export default function UserMenu() {
  const { username, avatar } = useUserStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openConfigs, setOpenConfigs] = useState(false);
  const hydrated = useHydrated();
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hydrated) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-black/40 border border-orange-700/20 px-3 py-2 rounded-lg hover:bg-white/20 transition"
      >
        <img
          key={avatar}
          src={
            avatar
              ? `http://localhost:5000${avatar}?t=${Date.now()}`
              : "http://localhost:5000/uploads/default-avatar.jpg"
          }
          alt="avatar"
          className="w-8 h-8 rounded-full border border-white/20 object-cover"
        />
        <span className="text-sm font-medium">{username}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44
      bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg p-2 text-sm z-50
        
      md:absolute md:right-0 md:w-48
        md:left-auto">
          <button
            onClick={() => {
                setOpen(false); 
                setOpenConfigs(true); 
              }}

            className="flex w-full text-left px-3 py-2 hover:bg-white/10 rounded-md"
          >
            <IoIosSettings  className="relative top-[1px] w-4 h-4" />
            <span className="ml-1 ">{t("configuration", { emoji: "" })}</span>
             
          </button>
          <button
            onClick={() => {
              const userId = useUserStore.getState().id; 
              if (userId) {
                console.log("🚪 Emite manualDisconnect antes de salir:", userId);
                socket.emit("manualDisconnect", userId);
              }

              if (socket.connected) {
                socket.disconnect();
                console.log("🔌 Socket desconectado localmente");
              }

              useUserStore.getState().clearUser();
              localStorage.removeItem("token");
              localStorage.removeItem("username");
              localStorage.removeItem("id");

              router.push("/");
            }}
            className="flex w-full text-left px-3 py-2 text-red-400 hover:bg-white/10 rounded-md"
          >
            <RiLogoutBoxLine className="relative top-[2px]"/>
           <span className="ml-1 ">{t("log_out", { emoji: "" })}</span> 
          </button>

        </div>
      )}
      <Configs
  open={openConfigs}
  onClose={() => setOpenConfigs(false)}
/>

    </div>
  );
}
