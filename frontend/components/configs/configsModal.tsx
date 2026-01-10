"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Palette,
  Bell,
  Lock,
  ShieldAlert,
  X,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHydrated } from "@/app/hooks/useHydrated";
import { useNotificationStore } from "@/app/store/notificationStore";
import { useUserStore } from "@/app/store/userStore";

import ChangeUsername from "./changeUsername";
import ChangeAvatar from "./changeAvatar";
import ChangeLanguage from "./changeLanguage";
import ChangePassword from "./changePassword";
import ThemeSelector from "./themeSelector";
import DeleteAccountModal from "./deleteAccountModal";
import NeonSwitch from "./neonSwitch";
import ConfigModal from "@/components/configs/configModal";
import Toast from "@/components/toast";
import ToastPortal from "@/components/toastPortal";
import ModalPortal from "../modalPortal";
import { IoLanguage } from "react-icons/io5";
import { AiOutlineGlobal } from "react-icons/ai";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { RxAvatar } from "react-icons/rx";
import { RiLockPasswordLine } from "react-icons/ri";
import { Wallet } from "lucide-react";
import bs58 from "bs58";
import {
  phantomStartChallenge,
  phantomVerifySignature,
} from "@/app/lib/phantomAuth";

import type { MotionProps } from "framer-motion";

/* ---------------- TYPES ---------------- */

type Section = null | "profile" | "personalization" | "notifications" | "security";

type ActionModal = null | "username" | "avatar" | "language" | "theme" | "password";

/* ---------------- MOTION ---------------- */

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const shellMotion: MotionProps = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
  transition: {
    type: "spring",
    damping: 18,
    stiffness: 220,
  },
};


/* ---------------- COMPONENT ---------------- */

export default function Configs({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const hydrated = useHydrated();
  const { t } = useTranslation();

  const [section, setSection] = useState<Section>(null);
  const [actionModal, setActionModal] = useState<ActionModal>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const phantomPublicKey = useUserStore((s) => s.phantomPublicKey);
  const hasPhantom = !!phantomPublicKey;
  const [phantomLoading, setPhantomLoading] = useState(false);
  const [phantomError, setPhantomError] = useState("");

  const msg = useNotificationStore((s) => s.messageNotifications);
  const fr = useNotificationStore((s) => s.friendRequestNotifications);
  const inv = useNotificationStore((s) => s.inviteNotifications);
  const snd = useNotificationStore((s) => s.sound);
  const vib = useNotificationStore((s) => s.vibration);
  const setSetting = useNotificationStore((s) => s.setSetting);

  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);

  if (!hydrated || !open) return null;

  /* ---------- BACKDROP CLICK LOGIC ---------- */
  const handleBackdropClick = () => {
    if (actionModal) setActionModal(null);
    else if (section) setSection(null);
    else onClose();
  };

  const handleLinkPhantom = async () => {
  try {
    setPhantomError("");
    setPhantomLoading(true);

    const provider = (window as any)?.solana;

    if (!provider || !provider.isPhantom) {
      setPhantomError("Phantom wallet not found");
      return;
    }

    const resp = await provider.connect();
    const publicKey = resp.publicKey.toString();

    const { challengeId, message } = await phantomStartChallenge(publicKey);

    const encoded = new TextEncoder().encode(message);
    const signed = await provider.signMessage(encoded, "utf8");

    const res = await phantomVerifySignature(
      challengeId,
      bs58.encode(signed.signature)
    );

    if (res.status !== "LOGIN") {
      throw new Error("Unexpected response");
    }

    useUserStore.getState().setUser(res);

    setToast({
      message: "Phantom connected successfully",
      type: "success",
    });
  } catch (err: any) {
  if (err?.response?.data?.code === "PHANTOM_ALREADY_LINKED") {
    setPhantomError("This Phantom wallet is already linked to another account");
    return;
  }

  if (
    err?.message?.toLowerCase().includes("rejected") ||
    err?.code === 4001
  ) {
    return;
  }

  setPhantomError("Failed to connect Phantom");
}

};



  return (
    <ModalPortal>
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        {...backdropMotion}
        onClick={handleBackdropClick}
      >
        {/* ================= ROOT MODAL ================= */}
        <motion.div
          onClick={(e) => e.stopPropagation()}
          {...shellMotion}
          className="
            relative w-[92%] max-w-md
            rounded-3xl border border-white/10
            bg-black/90
            p-6 text-white shadow-2xl
          "
        >
          {/* Soft glow */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-3xl opacity-60"/>
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full" />

          {/* HEADER */}
          <div className="relative mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">
                {t("account_and_settings")}
              </h2>
              <p className="mt-1 text-sm text-gray-400">{t("hub_subtitle")}</p>
            </div>

            <button
              onClick={onClose}
              className="
                inline-flex h-10 w-10 items-center justify-center
                rounded-xl border border-white/10 bg-white/5
                text-gray-300 transition hover:bg-white/10 hover:text-white
                focus:outline-none focus:ring-2 focus:ring-white/20
              "
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* MAIN LIST */}
          <div className="relative space-y-3">
            <SectionCard>
              <CardHeader
                title={t("account")}
                subtitle={t("account_subtitle")}
              />
              <div className="mt-3 space-y-2">
                <Row
                  icon={<User className="h-5 w-5" />}
                  title={t("profile")}
                  hint={t("username_avatar_hint")}
                  onClick={() => setSection("profile")}
                />
                <Row
                  icon={<AiOutlineGlobal className="h-5 w-5" />}
                  title={t("personalization")}
                  hint={t("theme_language_hint")}
                  onClick={() => setSection("personalization")}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <CardHeader
                title={t("preferences")}
                subtitle={t("preferences_subtitle")}
              />
              <div className="mt-3 space-y-2">
                <Row
                  icon={<Bell className="h-5 w-5" />}
                  title={t("notifications")}
                  hint={t("notifications_hint")}
                  onClick={() => setSection("notifications")}
                />
                <Row
                  icon={<Lock className="h-5 w-5" />}
                  title={t("security")}
                  hint={t("security_hint")}
                  onClick={() => setSection("security")}
                />
              </div>
            </SectionCard>

            <div className="mt-6 border-t border-red-500/20 pt-4">
              <Row
                icon={<ShieldAlert className="h-5 w-5 text-red-400" />}
                title={t("danger_zone")}
                hint={t("delete_account_hint")}
                danger
                onClick={() => setDeleteModalOpen(true)}
              />
            </div>
          </div>
        </motion.div>

        {/* ================= SECTIONS ================= */}

        {/* PROFILE */}
        <ConfigModal
          open={section === "profile"}
          title={t("profile")}
          onClose={() => setSection(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("profile")}
              subtitle={t("profile_subtitle")}
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
              <div className="space-y-2">
                <Row
                  icon={<MdDriveFileRenameOutline className="h-5 w-5" />}
                  title={t("change_username")}
                  hint={t("pick_new_username")}
                  onClick={() => setActionModal("username")}
                />
                <Row
                  icon={<RxAvatar className="h-5 w-5" />}
                  title={t("change_avatar")}
                  hint={t("change_avatar_subtitle")}
                  onClick={() => setActionModal("avatar")}
                />
              </div>
            </div>
          </div>
        </ConfigModal>

        {/* PERSONALIZATION */}
        <ConfigModal
          open={section === "personalization"}
          title={t("personalization")}
          onClose={() => setSection(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("personalization")}
              subtitle={t("personalization_subtitle")}
            />
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-2">
              <Row
                icon={<Palette className="h-5 w-5" />}
                title={t("theme")}
                hint={t("light_dark_custom")} 
                onClick={() => setActionModal("theme")}
              />
              <Row
                icon={<IoLanguage className="h-5 w-5" />}
                title={t("language")}
                hint={t("choose_language_hint")} 
                onClick={() => setActionModal("language")}
              />
            </div>
          </div>
        </ConfigModal>

        {/* NOTIFICATIONS */}
        <ConfigModal
          open={section === "notifications"}
          title={t("notifications")}
          onClose={() => setSection(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("notifications")}
              subtitle={t("notifications_subtitle")}
            />
            <div className="space-y-2">
              <SwitchRow
                label={t("message_notifications")}
                description={t("new_messages_desc")}
                value={msg}
                onChange={(v) => setSetting("messageNotifications", v)}
              />
              <SwitchRow
                label={t("friend_request_notifications")}
                description={t("friend_requests_desc")}
                value={fr}
                onChange={(v) => setSetting("friendRequestNotifications", v)}
              />
              <SwitchRow
                label={t("invite_notifications")}
                description={t("invites_desc")}
                value={inv}
                onChange={(v) => setSetting("inviteNotifications", v)}
              />
              <SwitchRow
                label={t("sound_notifications")}
                description={t("sound_desc")}
                value={snd}
                onChange={(v) => setSetting("sound", v)}
              />
              <SwitchRow
                label={t("vibration_notifications")}
                description={t("vibration_desc")}
                value={vib}
                onChange={(v) => setSetting("vibration", v)}
              />
            </div>
          </div>
        </ConfigModal>

        {/* SECURITY */}
        <ConfigModal
          open={section === "security"}
          title={t("security")}
          onClose={() => setSection(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("security")}
              subtitle={t("security_subtitle")}
            />

            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10">
              <Row
                icon={<RiLockPasswordLine className="h-5 w-5" />}
                title={t("change_password")}
                hint="Update your password"
                onClick={() => setActionModal("password")}
              />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-white flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Phantom Wallet
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {hasPhantom
          ? "Your Phantom wallet is connected"
          : "Link your Phantom wallet to your account"}
      </p>
    </div>

    {hasPhantom ? (
      <span className="rounded-lg bg-green-500/20 px-3 py-1 text-xs text-green-400">
        Connected
      </span>
    ) : (
      <button
        onClick={handleLinkPhantom}
        disabled={phantomLoading}
        className="
          rounded-xl bg-[#4e44ce] px-4 py-2
          text-sm font-medium text-white
          transition hover:bg-[#5b50e0]
          disabled:opacity-50
        "
      >
        {phantomLoading ? "Connecting..." : "Connect"}
      </button>
    )}
  </div>

  {phantomError && (
    <p className="mt-2 text-xs text-red-400">{phantomError}</p>
  )}
</div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t("two_factor_enabled")}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {t("two_factor_desc")}
                    </p>
                  </div>
                  <NeonSwitch enabled={true} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </ConfigModal>

        {/* ================= ACTION MODALS ================= */}

        <ConfigModal
          open={actionModal === "username"}
          title={t("change_username")}
          onClose={() => setActionModal(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("change_username")}
              subtitle={t("change_username_subtitle")}
            />
            <ChangeUsername />
          </div>
        </ConfigModal>

        <ConfigModal
          open={actionModal === "avatar"}
          title={t("change_avatar")}
          onClose={() => setActionModal(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("change_avatar")}
              subtitle={t("change_avatar_subtitle")}
            />
            <ChangeAvatar />
          </div>
        </ConfigModal>

        <ConfigModal
          open={actionModal === "language"}
          title={t("language")}
          onClose={() => setActionModal(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("language")}
              subtitle={t("language_subtitle")}
            />
            <ChangeLanguage />
          </div>
        </ConfigModal>

        <ConfigModal
          open={actionModal === "theme"}
          title={t("theme")}
          onClose={() => setActionModal(null)}
        >
          <div className="space-y-4">
            <ModalIntro title={t("theme")} subtitle={t("theme_subtitle")} />
            <ThemeSelector />
          </div>
        </ConfigModal>

        <ConfigModal
          open={actionModal === "password"}
          title={t("change_password")}
          onClose={() => setActionModal(null)}
        >
          <div className="space-y-4">
            <ModalIntro
              title={t("change_password")}
              subtitle={t("change_password_subtitle")}
            />
            <ChangePassword />
          </div>
        </ConfigModal>

        {/* ================= DANGER ================= */}

        <DeleteAccountModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={async (password: string) => {
            try {
              const token = useUserStore.getState().token;

              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ password }),
                }
              );

              if (!res.ok) {
                setToast({ message: t("password_incorrect"), type: "error" });
                return;
              }

              useUserStore.getState().logout();
              localStorage.removeItem("token");
              setDeleteModalOpen(false);
            } catch {
              setToast({ message: t("unexpected_error"), type: "error" });
            }
          }}
        />

        {/* ================= TOAST ================= */}
        {toast && (
          <ToastPortal>
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          </ToastPortal>
        )}
      </motion.div>
    </AnimatePresence>
    </ModalPortal>
  );
}

/* ---------------- UI HELPERS ---------------- */

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        rounded-2xl border border-white/10 bg-white/5
        p-4 shadow-sm
      "
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/90">{title}</p>
        <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
      </div>
  
    </div>
  );
}

function ModalIntro({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}

function Row({
  icon,
  title,
  hint,
  onClick,
  danger,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full rounded-xl border border-transparent
        px-4 py-3 text-left transition-all
        hover:border-white/10 hover:bg-white/10
        focus:outline-none focus:ring-2 focus:ring-white/20
        ${danger ? "hover:bg-red-500/40 bg-red-500/20" : ""}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? (
            <div
              className={`
                grid h-10 w-10 place-items-center rounded-xl
                border border-white/10
                ${danger ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white"}
              `}
            >
              {icon}
            </div>
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
              <div className="h-2 w-2 rounded-full bg-white/30" />
            </div>
          )}

          <div className="min-w-0">
            <p className={`truncate text-sm font-medium ${danger ? "text-red-300" : "text-white"}`}>
              {title}
            </p>
            {hint ? (
              <p className="mt-1 truncate text-xs text-gray-400">{hint}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-500 sm:block">
            {danger ? "Careful" : "Open"} 
          </span>
          <ChevronRight className="h-5 w-5 text-gray-500 transition group-hover:translate-x-1 group-hover:text-gray-300" />
        </div>
      </div>
    </button>
  );
}

function SwitchRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="
        rounded-2xl border border-white/10 bg-white/5
        p-4 transition hover:bg-white/10
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          {description ? (
            <p className="mt-1 text-xs text-gray-400">{description}</p>
          ) : null}
        </div>
        <NeonSwitch enabled={value} onChange={onChange} />
      </div>
    </div>
  );
}
