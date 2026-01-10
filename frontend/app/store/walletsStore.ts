import { create } from "zustand";

export interface Wallet {
  _id: string;
  name: string;
  publicKey: string;
  type: "internal" | "imported" | "phantom";
  archived: boolean;
  sol: number;
  container: "source" | "origin" | "destination";
}

interface WalletsState {
  wallets: Wallet[];
  setWallets: (wallets: Wallet[]) => void;
  updateWalletBalance: (walletId: string, sol: number) => void;
}

export const useWalletsStore = create<WalletsState>((set) => ({
  wallets: [],

  setWallets: (wallets) => set({ wallets }),

  updateWalletBalance: (walletId, sol) =>
    set((state) => ({
      wallets: state.wallets.map((w) =>
        w._id === walletId ? { ...w, sol } : w
      ),
    })),
}));
