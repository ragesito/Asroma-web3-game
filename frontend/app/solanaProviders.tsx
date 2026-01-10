"use client";

import { useWalletBalanceSync } from "@/app/hooks/useWalletBalanceSync";
import { useSolPriceSync } from "@/app/hooks/useSolPriceSync";
export function WalletBalanceProvider({ children }: { children: React.ReactNode }) {
  useWalletBalanceSync();
useSolPriceSync();
  return <>{children}</>;
}