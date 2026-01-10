import { useDroppable } from "@dnd-kit/core";
import WalletRow from "./walletRow";
import { Wallet } from "@/app/(private)/wallets/types/walletType";
import { ArrowDownToLine } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WalletOrigin({ wallet }: { wallet: Wallet | null }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: "origin",
    disabled: !!wallet,
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full bg-black/60 border rounded-xl p-4 flex flex-col gap-3 relative backdrop-blur-sm
        ${isOver ? "border-orange-500 bg-orange-500/10" : "border-white/10"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <span className="font-semibold text-white">{t("from")}</span>

        {wallet && (
          <span className="text-orange-400 ">
            {wallet.name}{" "}
            
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        {wallet ? (
          <div className="pointer-events-auto">
            <WalletRow
              walletId={wallet._id}
              name={wallet.name}
              shortKey={`${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`}
              publicKey={wallet.publicKey}
              sol={wallet.sol}
              archived={false}
              onRenamed={() => {}}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-400 text-center">
      {t("drag_wallet_to_distribute")}
      <ArrowDownToLine className="ml-1 w-4 h-4" />
    </div>
    
        )}
      </div>
    </div>
  );
}
