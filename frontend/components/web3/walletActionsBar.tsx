"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import ConfirmModal from "../confirmModal";
import Toast from "../toast";
import ToastPortal from "../toastPortal";
import WalletNameModal from "./walletNameModal";
import ImportWalletModal from "./importWalletModal";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WalletActionsBar({
  onWalletsChanged,
  showArchived,
  onToggleArchived,
  fetching
}: {
  onWalletsChanged: () => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  fetching?: boolean;
}) {
    const [nameModal, setNameModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { t } = useTranslation();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const createWallet = async (name?: string) => {
    try {
      const res = await api.post("/wallets/create", { name });
      onWalletsChanged(); // 👈 APARECE SIN RECARGAR
      setToast({ message: t("wallet_created"), type: "success" });

    } catch {
      setToast({ message: t("wallet_create_failed"), type: "error" });

    } finally {
      setNameModal(false);
    }
  };

  return (
    <>
      {/* ACTION BUTTONS */}
      <div className="flex gap-2">
        <button
          disabled={fetching}
          onClick={() => {
            onToggleArchived();
          }}
          className="px-3 py-1 text-sm bg-black/60 border border-white/10 hover:bg-white/10 rounded-lg flex items-center gap-1"
        >
          <div className={`relative w-4 h-4 ${!showArchived ? "opacity-60" : ""}`}>
            <Eye className="w-4 h-4" />
            {!showArchived && (
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white transform -rotate-45 origin-center"></div>
            )}
          </div>
          {t("show_archived")}

        </button>
       

        <button onClick={() => setImportOpen(true)} 
            className="px-3 py-1 text-sm bg-black/60 border border-white/10 rounded-lg hover:bg-white/10">
          {t("import")}

        </button>
          <button
          onClick={() => setConfirmOpen(true)}
          className="px-3 py-1 text-sm bg-orange-700/60 border border-white/10 rounded-lg hover:bg-orange-700/80"
        >
          {t("create_wallet")}

        </button>
       
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
  isOpen={confirmOpen}
  message={t("confirm_create_wallet")}
  onConfirm={() => {
    setConfirmOpen(false);
    setNameModal(true);
  }}
  onCancel={() => setConfirmOpen(false)}
/>
<ImportWalletModal
  open={importOpen}
  onClose={() => setImportOpen(false)}
  onImported={onWalletsChanged}
/>
        <WalletNameModal
        open={nameModal}
        onConfirm={createWallet}
        onCancel={() => setNameModal(false)}
      />
      {/* TOAST */}
      {toast && (
  <ToastPortal>
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  </ToastPortal>
)}
    </>
  );
}
