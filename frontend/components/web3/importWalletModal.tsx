"use client";

import { useState } from "react";
import { X } from "lucide-react";
import api from "@/app/lib/api";
import ModalPortal from "../modalPortal";
import Toast from "@/components/toast";
import { useTranslation } from "react-i18next";
import ToastPortal from "../toastPortal";
interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportWalletModal({ open, onClose, onImported }: Props) {
  const [privateKey, setPrivateKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" ; action?: { label: string; onClick: () => void } } | null>(null);
  if (!open) return null;

  const handleImport = async () => {
  if (!privateKey.trim()) return;

  setLoading(true);
  try {
    const res = await api.post("/wallets/import", {
      privateKey,
    });

    if (res.data.restored) {
      setToast({
        message: t("wallet_restored"),
        type: "info",
      });
    } else {
      setToast({
        message: t("wallet_imported_success"),
        type: "success",
      });
    }

    onImported();
    onClose();
  } catch (err: any) {
    if (err.response?.status === 409) {
      setToast({
        message: t("wallet_already_imported"),
        type: "info",
      });
    } else if (err.response?.status === 400) {
      setToast({
        message: t("invalid_private_key"),
        type: "error",
      });
    } else {
      setToast({
        message: t("wallet_import_failed"),
        type: "error",
      });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center backdrop-blur-sm"
    onClick={onClose}>
      <div className="bg-black/90 border border-orange-500/30 rounded-xl p-6 w-full max-w-md text-white"
      onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          
          <h2 className="text-lg font-semibold">{t("import_wallet")}</h2>
       
          <button onClick={onClose}><X /></button>
        </div>

        <label className="text-xs text-gray-400">{t("private_key")}</label>
        <textarea
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="w-full mt-1 p-2 bg-black/40 border border-white/10 rounded-md text-xs"
          rows={3}
          placeholder={t("enter_private_key")}
        />
        <div className="flex justify-center items-center mb-1 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          
          <h3 className="text-sm font-semibold text-red-400"> ⚠ {t("wallet_warning")}</h3>
       
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="mt-4 w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
        >
          {t("import")}
        </button>
      </div>
    </div>
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
    </ModalPortal>
    
  );
}