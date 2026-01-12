"use client";

import { StatCard } from "./statCard";
import { WinrateCard } from "./winrateCard";
import { useTranslation } from "react-i18next";
interface Props {
  played: number;
  wins: number;
  losses: number;
  winrate: number;
  recentMatches: any[];
}

export const StatsSummary = ({
  played,
  wins,
  losses,
  winrate,
  recentMatches,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className="grid mb-4 grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 grid grid-cols-2 gap-3">
        <StatCard
          label={t("matches_played")}
          value={played}
          sublabel={t("total_registered")}
        />
        <StatCard label={t("wins")} value={wins} />
        <StatCard label={t("losses")} value={losses} />
        <StatCard
          label={t("current_streak")}
          value={
            recentMatches.length
              ? recentMatches[0].youWon
                ? t("positive_streak")
                : t("negative_streak")
              : t("no_data")
          }
        />
      </div>

      <WinrateCard winrate={winrate} />
    </div>
  );
};
