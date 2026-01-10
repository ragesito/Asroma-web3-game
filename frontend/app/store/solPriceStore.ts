import { create } from "zustand";

interface SolPriceState {
  price: number | null;
  lastUpdated: number | null;
  setPrice: (price: number) => void;
}

export const useSolPriceStore = create<SolPriceState>((set) => ({
  price: null,
  lastUpdated: null,

  setPrice: (price) =>
    set({
      price,
      lastUpdated: Date.now(),
    }),
}));
