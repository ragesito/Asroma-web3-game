"use client";
import { useTranslation } from "react-i18next";
import { resolveAvatarUrl } from "@/app/lib/avatar";

export default function PlayerCard({
  username,
  avatar,
  score,
  wins,
  losses,
  bet,
  loading = false,
}: {
  username?: string;
  avatar?: string;
  score?: number;
  wins?: number;
  losses?: number;
  bet?: number;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="w-[560px] bg-black/30 border border-white/10 
rounded-2xl p-6 backdrop-blur-xl text-white flex flex-col items-center shadow-xl">
      {loading ? (
        <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse mb-4" />
      ) : (
        <img
          src={resolveAvatarUrl(avatar)}
          alt="avatar"
          className="w-20 h-20 rounded-full border border-white/20 object-cover mb-4"
        />
      )}

      <h2 className="text-xl font-bold mb-2">
        {loading ? "Searching..." : username}
      </h2>

      <div className="text-sm opacity-80 space-y-1 leading-tight text-center">
        <p>{t("mmr")}: {score ?? "—"}</p>
        <p>{t("wins")}: {wins ?? "—"}</p>
        <p>{t("losses")}: {losses ?? "—"}</p>

        {bet && <p className="text-secondary font-bold">Bet: {bet} SOL</p>}
      </div>
    </div>
  );
}
