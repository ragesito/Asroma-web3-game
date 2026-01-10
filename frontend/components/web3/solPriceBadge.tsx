"use client";

import { useSolPriceStore } from "@/app/store/solPriceStore";
import SolanaIcon from "../solanaIcon";

export default function SolPriceBadge() {
  const price = useSolPriceStore((s) => s.price);

  if (!price) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-xl
                    bg-black/40 border border-orange-700/20
                    text-sm text-white">
      <SolanaIcon className="w-4 h-4" />
      <span>${price.toFixed(2)}</span>
    </div>
  );
}
