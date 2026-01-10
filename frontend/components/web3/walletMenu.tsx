"use client";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/app/hooks/useHydrated";
import { useUserStore } from "@/app/store/userStore";
import { useRouter } from "next/navigation";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import { MdBarChart } from "react-icons/md";
import { GiPayMoney } from "react-icons/gi";
import { GiReceiveMoney } from "react-icons/gi";
import { FaWallet } from "react-icons/fa";
import SolanaIcon from "@/components/solanaIcon";
import DepositModal from "@/components/web3/depositModal";
import WithdrawModal from "@/components/web3/withdrawModal";
import { useTranslation } from "react-i18next";

export default function WalletMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const sol = useSelectedWalletStore((s) => s.sol);
  const shortKey = useSelectedWalletStore((s) => s.shortKey);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  if (!hydrated) return null;
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-col items-end bg-black/40 border border-orange-700/20 px-3 py-2 rounded-lg hover:bg-white/20 transition"
      >
        <span className="flex items-center gap-1 text-sm font-semibold">
          <SolanaIcon className="w-4 h-4 relative bottom-[1px]" />
  {sol.toFixed(3)}

</span>

        <span className="text-xs text-gray-400">{shortKey}</span>
      </button>

      {open && (
  <div className="absolute right-0 mt-2 z-40 w-44 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg p-2 text-sm">
    <button
      onClick={() => {
        setOpen(false);
        router.push("/wallets");
      }}
        className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-white/10 rounded-md"
>
  <FaWallet className="w-4 h-4" />
  <span>{t("wallets")}</span>
</button>
    
    <button
      onClick={() => {
        setOpen(false);
        setShowDeposit(true);
      }}
      className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-white/10 rounded-md"
>
  <GiPayMoney className="w-4 h-4" />
  <span>{t("deposit")}</span>
</button>


    <button
      onClick={() => {
        setOpen(false);
        setShowWithdraw(true);
      }}
      className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-white/10 rounded-md"
    >
      <GiReceiveMoney className="w-4 h-4" />
      <span>{t("withdraw")}</span>
    </button>
 
    <button
      onClick={() => {
        setOpen(false);
        router.push("/PNL");
      }}
        className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-white/10 rounded-md"
>
  <MdBarChart className="w-4 h-4" />
  <span>{t("pnl")}</span>
</button>
  </div>
)}

      <DepositModal
  open={showDeposit}
  onClose={() => setShowDeposit(false)}
/>
  <WithdrawModal
  open={showWithdraw}
  onClose={() => setShowWithdraw(false)}
/>

    </div>
  );
}
