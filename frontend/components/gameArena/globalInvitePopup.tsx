"use client";

import InvitePopup from "./invitePopup";
import { socket } from "@/app/lib/socket";
import { useUserStore } from "@/app/store/userStore";
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
  const { id } = useUserStore();
  const router = useRouter();

  const handleAccept = () => {
    sessionStorage.setItem(
      "pendingInviteJoin",
      JSON.stringify({ roomId })
    );

    if (window.location.pathname !== "/games") {
      router.push("/games");
    } else {
      socket.emit("game:join", { roomId, playerId: id });
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
