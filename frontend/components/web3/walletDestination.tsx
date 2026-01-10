import { useDroppable } from "@dnd-kit/core";
import WalletRow from "./walletRow";
import { Wallet } from "@/app/(private)/wallets/types/walletType";
import { useTranslation } from "react-i18next";

export default function WalletDestination({
  wallet,
  originWallet,
  onStartTransfer,
}: {
  wallet: Wallet | null;
  originWallet: Wallet | null;
  onStartTransfer: () => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: "destination",
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold text-white">{t("to")}</span>

          {wallet && (
            <span className="text-orange-400">
              {wallet.name}{" "}
            </span>
          )}
        </div>

        <button
           disabled={!wallet || !originWallet}
           onClick={onStartTransfer}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition
            ${
              wallet
                ? " bg-black/80 border border-orange-700/70 text-white hover:bg-white/10 font-semibold "
                : "bg-white/10 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {t("start_transfer")}
        </button>
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
            {t("drop_destination_wallet")}
          </div>
        )}
      </div>
    </div>
  );
}

