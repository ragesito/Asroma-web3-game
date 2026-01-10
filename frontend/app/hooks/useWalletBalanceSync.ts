import { useEffect } from "react";
import api from "@/app/lib/api";
import { useWalletsStore } from "@/app/store/walletsStore";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import { Wallet } from "@/app/store/walletsStore";
import { useUserStore } from "@/app/store/userStore";

export function useWalletBalanceSync() {
  const isLogged = useUserStore((s) => s.isLoggedIn());

  useEffect(() => {
    if (!isLogged) return;
    let alive = true;

    const sync = async () => {
      try {
        const res = await api.get("/wallets/with-balances");
        if (!alive) return;

        const incoming = res.data;
        const prev = useWalletsStore.getState().wallets;

        const merged = prev.map((w: Wallet) => {
  const fresh = incoming.find((i: Wallet) => i._id === w._id);
  return fresh ? { ...w, sol: fresh.sol } : w;
});


        useWalletsStore.getState().setWallets(merged);

        const currentWalletId =
          useSelectedWalletStore.getState().walletId;

        if (currentWalletId) {
          const selected = incoming.find(
            (w: any) => w._id === currentWalletId
          );
          if (selected) {
            useSelectedWalletStore
              .getState()
              .setSol(selected.sol);
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 401) return;
        console.error("❌ Wallet polling failed:", err);
      }

    };

    sync();
    const interval = setInterval(sync, 10_000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [isLogged]);
}

