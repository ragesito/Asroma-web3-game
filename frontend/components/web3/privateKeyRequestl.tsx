"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { useTranslation } from "react-i18next";

export default function PrivateKeyRequest({
  walletId,
  onClose,
}: {
  walletId: string;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleConfirm = async () => {
    try {
      const res = await api.post(`/wallets/${walletId}/export`, {
        password,
      });
      setPrivateKey(res.data.privateKey);
      setError("");
    } catch (err: any) {
  if (err.response?.data?.message === "CANNOT_EXPORT_IMPORTED_WALLET") {
    setError(t("cannot_export_imported_wallet"));
  } else {
    setError(t("invalid_password"));
  }
}

  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-black/90 border border-white/10 rounded-xl p-6 w-[420px] text-white">
        {!privateKey ? (
          <>
            <h2 className="text-lg font-semibold mb-2 text-center">
              ⚠️ {t("export_private_key")}
            </h2>

            <p className="text-sm text-gray-400 mb-4 text-center">
              {t("private_key_warning")}
            </p>

            <input
              type="password"
              placeholder={t("enter_account_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40  border border-white/10 rounded-lg px-3 py-2 mb-3"
            />

            {error && (
              <p className="text-sm text-red-400 mb-2">{error}</p>
            )}

            <div className="flex justify-center items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded-lg"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 rounded-lg"
              >
                {t("reveal")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2 text-center text-red-400">
              🚨 {t("private_key")}
            </h2>

            <code className="block break-all bg-black/50 p-3 rounded-lg text-sm mb-4">
              {privateKey}
            </code>

            <p className="text-xs text-gray-400 mb-4 text-center">
              {t("private_key_store_warning")}
            </p>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-900"
              >
                {t("close")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
