import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SelectedWalletState {
  walletId?: string;   
  shortKey?: string;   
  sol: number;

  setWallet: (wallet: {
    walletId: string;
    shortKey: string;
    sol: number;
  }) => void;

  setSol: (sol: number) => void; 
  clearWallet: () => void;
}

export const useSelectedWalletStore = create<SelectedWalletState>()(
  persist(
    (set) => ({
      walletId: undefined,
      shortKey: undefined,
      sol: 0,

      setWallet: (wallet) =>
        set({
          walletId: wallet.walletId,
          shortKey: wallet.shortKey,
          sol: wallet.sol,
        }),

      setSol: (sol) =>
        set((state) => ({
          ...state,
          sol,
        })),

      clearWallet: () =>
        set({
          walletId: undefined,
          shortKey: undefined,
          sol: 0,
        }),
    }),
    {
      name: "selected-wallet-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
