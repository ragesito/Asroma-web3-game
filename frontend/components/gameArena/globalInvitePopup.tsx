"use client";

import InvitePopup from "./invitePopup";
import { socket } from "@/app/lib/socket";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import { useRouter } from "next/navigation";

interface GlobalInvitePopupProps {
  fromUsername: string;
  fromAvatar: string;
  roomId: string;
  onClose: () => void;
}

export default function GlobalInvitePopup({
  fromUsername,
  fromAvatar,
  roomId,
  onClose,
}: GlobalInvitePopupProps) {
  const { walletId } = useSelectedWalletStore();
  const router = useRouter();

  const handleAccept = () => {
    sessionStorage.setItem(
      "pendingInviteJoin",
      JSON.stringify({ roomId })
    );

    if (window.location.pathname !== "/games") {
      router.push("/games");
    } else {
      // walletId was missing here, so this join always failed with
      // WALLET_NOT_FOUND while the same join from the lobby worked.
      socket.emit("game:join", { roomId, walletId });
    }

    onClose();
  };

  return (
    <InvitePopup
      open={true}
      fromUsername={fromUsername}
      fromAvatar={fromAvatar}
      onClose={onClose}
      onAccept={handleAccept}
    />
  );
}
