"use client";

import { useSelectedWalletStore } from "@/app/store/walletStore";
import SolanaIcon from "../solanaIcon";
import {Archive, ExternalLink, Copy, Key } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Toast from "@/components/toast";
import ToastPortal from "../toastPortal";
import api from "@/app/lib/api";
import { useDraggable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  shortKey: string;
  sol: number;
  archived?: boolean;
  publicKey: string;
  walletId: string;
  onRenamed: () => void;
  onShowPrivateKey?: () => void;
}

export default function WalletRow({ name, shortKey, onShowPrivateKey, sol, publicKey, onRenamed, walletId, archived }: Props) {
  const { shortKey: activeKey, setWallet } = useSelectedWalletStore();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const textSizerRef = useRef<HTMLSpanElement>(null); 
  const { t } = useTranslation(); 
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" ; action?: { label: string; onClick: () => void } } | null>(null);
  const isActive = activeKey === shortKey;
  const {
  attributes,
  listeners,
  setNodeRef,
  isDragging,
} = useDraggable({
  id: walletId,
  disabled: archived,
});

  

  const openSolscan = (address: string) => {
  window.open(`https://solscan.io/account/${address}`, "_blank");
};
const copyAddress = async (address: string) => {
  await navigator.clipboard.writeText(address);
  setToast({
    message: t("address_copied"),
    type: "success",
  });
};
const onArchiveWallet = async () => {
  try {
    const res = await api.patch(`/wallets/${walletId}/archive`);

    setToast({
      message: res.data.archived
        ? t("wallet_archived")
        : t("wallet_restored"),
      type: "info",
    });

    onRenamed(); // refetch wallets
  } catch {
    setToast({
      message: t("wallet_update_failed"),
      type: "error",
    });
  }
};


useEffect(() => {
  if (editing) inputRef.current?.focus();
}, [editing]);


const saveName = async () => {
  if (!draftName.trim() || draftName === name) {
    setEditing(false);
    setDraftName(name);
    return;
  }

  try {
    await api.patch(`/wallets/${walletId}/rename`, {
      name: draftName.trim(),
    });

    onRenamed(); // refetch wallets
  } catch {
    setDraftName(name); // rollback
  } finally {
    setEditing(false);
  }
};

useEffect(() => {
  if (!editing || !textSizerRef.current || !inputRef.current) return;

  const width = textSizerRef.current.offsetWidth;
  inputRef.current.style.width = `${width + 8}px`;
}, [draftName, editing]);

  return (
    
   <div
  ref={setNodeRef}
  {...attributes}
  {...listeners}
  className={`flex items-center justify-between p-3 rounded-lg transition
    cursor-grab active:cursor-grabbing
    select-none
    ${isActive ? "bg-orange-500/10 border border-orange-500/40" : "bg-white/5 hover:bg-white/10"}
    ${archived ? "opacity-50 cursor-pointer" : ""}
    ${isDragging ? "opacity-0" : ""}
  `}
>

      <div className="flex items-center gap-3">
        {/* CHECK */}
        <div
  onPointerDown={(e) => e.stopPropagation()}        
  onClick={() => {
    if (archived) {
      setToast({
        message: t("archived_wallet_cannot_activate"),
        type: "info",
      });
      return;
    }

    setWallet({ shortKey, sol, walletId });
  }}
  className={`w-4 h-4 rounded-full border transition
    ${isActive ? "bg-orange-500 border-orange-500" : "hover:border-gray-500"}
    ${archived ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
  `}
  title={archived ? t("wallet_is_archived") : t("activate_wallet")}

/>


        <div>
          <div className="flex gap-1">
          
  {editing ? (
    <>
      <input
        ref={inputRef}
        value={draftName}
        spellCheck={false}
        onChange={(e) => setDraftName(e.target.value)}
        onBlur={saveName}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveName();
          if (e.key === "Escape") {
            setDraftName(name);
            setEditing(false);
          }
        }}
        className="bg-black/40 border border-orange-500/40 rounded px-1 text-sm text-white outline-none"
        style={{
          width: textSizerRef.current
            ? textSizerRef.current.offsetWidth + 6
            : "auto",
        }}
      />

      {/* Invisible text sizer */}
      <span
        ref={textSizerRef}
        className="absolute invisible whitespace-pre text-sm font-medium px-1"
      >
        {draftName || " "}
      </span>
    </>
  ) : (
    <p
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => setEditing(true)}
      className={`cursor-text ${
        isActive ? "font-medium text-orange-500" : "font-medium text-gray-100"
      }`}
    >
      {name}
    </p>
  )}



          <div className="flex">
          <p className="text-xs text-gray-400 mr-1 relative top-[5px]">{shortKey}</p>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => copyAddress(publicKey)}
            className="opacity-60 hover:text-orange-400  transition"
            title={t("copy_address")}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          </div>
          </div>
        </div>
         
      </div>

         <span className="flex items-center text-white gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1 text-gray-300 bg-black/40 px-2 py-1 rounded-lg border border-black/10">
          <SolanaIcon className="w-4 h-4 relative bottom-[1px]" />
  {sol.toFixed(3)}
  
</div>

  {/* Open in Solscan */}
  <button
    onPointerDown={(e) => e.stopPropagation()}
  onClick={() => openSolscan(publicKey)}
    className="opacity-60 hover:text-orange-400 transition"
    title={t("view_on_solscan")}
  >
    <ExternalLink className="w-4 h-4" />
  </button>

  {/* Archive wallet */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      onArchiveWallet();
    }}
    className="opacity-60 hover:text-orange-400  transition"
    title={t("archive_wallet")}
  >
    <Archive className="w-4 h-4" />
  </button>

  {/* Show private key */}
  <button
    onPointerDown={(e) => e.stopPropagation()}
    onClick={() => onShowPrivateKey?.()}
    className="opacity-70 hover:text-orange-400 transition"
    title={t("show_private_key")}
  >
    <Key className="w-4 h-4" />
  </button>
</span>
{toast && (
  <ToastPortal>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
        action={toast.action} 
      />
  </ToastPortal>
    )}
    
    </div>
    
  );
}
