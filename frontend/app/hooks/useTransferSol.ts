"use client";

import { useState } from "react";
import api from "@/app/lib/api";

export function useTransferSol() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const transfer = async (params: {
    fromWalletId: string;
    toPublicKey: string;
    amount: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSignature(null);

      const res = await api.post("/wallets/transfer", params);
      setSignature(res.data.signature);

      return res.data.signature;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Transfer failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transfer,
    loading,
    error,
    signature,
  };
}
