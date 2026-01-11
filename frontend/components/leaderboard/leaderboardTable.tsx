import Image from "next/image";
import { useState } from "react";
import PlayerProfileModal from "@/components/leaderboard/playerProfileModal";
import { useUserStore } from "@/app/store/userStore";
import { motion } from "framer-motion";
import Select from "@/components/select";
import { useTranslation } from "react-i18next";
import { resolveAvatarUrl } from "@/app/lib/avatar";
export function LeaderboardTable({
  players,
  seasons,
  seasonId,
  setSeasonId,
}: {
  players: any[];
  seasons: any[];
  seasonId: string;
  setSeasonId: (value: string) => void;
}) {
  const { id: myId } = useUserStore();
   const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);  
  const { t } = useTranslation();
   const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  return (
    <>
    <motion.div
    variants={variants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 0.4 }}
    className="
    bg-white/5 backdrop-blur-xl p-6 h-[620px]
    rounded-lg border border-white/10 
    w-full max-w-5xl mx-auto
    mt-6 md:mb-0 mb-0 shadow-lg shadow-black/30
    relative
    overflow-hidden
    "
>
  <div className="absolute right-6 top-6 z-30
  max-md:static
    max-md:flex max-md:justify-center
    max-md:mt-3">
  <Select
    value={seasonId}
    onChange={setSeasonId}
    options={seasons.map((s, index) => ({
      label: `Season ${index + 1}`, 
      value: s._id,
    }))}
  />
</div>

    <h2 className="text-3xl font-bold text-center mb-4 sticky top-0 py-3 z-20 rounded-t-2xl max-md:mb-1">
  🏆  {t("leaderboard")}
</h2>
    
  <div
    className="
      max-h-[58vh] 
      overflow-y-auto 
      custom-scroll
      pr-2
    "
  >
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-300 text-sm border-b border-white/10">
            <th className="py-2">{t("rank")}</th>
            <th>{t("player")}</th>
            <th>{t("wins")}</th>
            <th>{t("losses")}</th>
            <th>{t("mmr")}</th>
          </tr>
        </thead>

        <tbody>
            {players?.map((p, i) => (
              <tr
                key={p.userId}
                onClick={() => {
                  if (p.userId !== myId) {
                    setSelectedPlayer({ ...p, rank: i + 1 });
                  }
                }}
                className="border-b border-white/5 cursor-pointer transition-all hover:bg-white/10 "
              >
                <td className="py-2 text-yellow-300 ">
                  {i === 0 && "🥇"}
                  {i === 1 && "🥈"}
                  {i === 2 && "🥉"}
                  {i > 2 && <span className="ml-2">{i + 1}</span>}
                </td>

                <td className="flex items-center gap-3 py-2">
                  <img
                    src={resolveAvatarUrl(p.avatar)}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    alt="avatar"
                  />
                  {p.userId === myId ? (
                    <span className="text-yellow-400 font-bold">{t("you")}</span>
                  ) : (
                    p.username
                  )}               
                </td>

                <td>{p.wins}</td>
                <td>{p.losses}</td>
                <td className="font-semibold text-yellow-300">{p.score}</td>
              </tr>
            ))}
          </tbody>
      </table>
      </div> 
</motion.div>
    {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
        )}  
    </>
  );
}
