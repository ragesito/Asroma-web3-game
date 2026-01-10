import WalletActionsBar from "./walletActionsBar";
import { useDroppable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";

export default function WalletSourceList({
  children,
  onWalletsChanged,
  className = "",
  showArchived,
  onToggleArchived,
  fetching
}: {
  children: React.ReactNode;
  className?: string;
   onWalletsChanged: () => void;
   showArchived: boolean;
  onToggleArchived: () => void;
  fetching?: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: "source" });
  const { t } = useTranslation();

  return (
    <div
    ref={setNodeRef}
      className={`
        bg-black/40 backdrop-blur
        border border-white/10
        rounded-xl p-4
        h-[630px]
        overflow-y-auto
        space-y-3
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-gray-300">
          {t("wallets")}
        </h3>

        <WalletActionsBar 
        onWalletsChanged={onWalletsChanged}
        showArchived={showArchived}
        onToggleArchived={onToggleArchived}
        fetching={fetching}
  />
      </div>

      {children}
    </div>
  );
}
