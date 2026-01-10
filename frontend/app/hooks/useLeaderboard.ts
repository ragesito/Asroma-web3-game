import { useEffect, useState } from "react";
import api from "@/app/lib/api";

export function useLeaderboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [seasons, setSeasons] = useState<any[]>([]);
  const [seasonId, setSeasonId] = useState<string>(""); 

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const res = await api.get("/seasons");
        const list = res?.data || [];

        setSeasons(list);

        const active = list.find((s: any) => s.isActive);

        if (active) {
          setSeasonId(active._id); 
        } else {
          setSeasonId("all");      
        }
      } catch (e) {
        console.warn("No se pudieron cargar temporadas");
      }
    };

    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) return; 

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/leaderboard", {
          params: { seasonId },
        });

        setPlayers(res.data);
      } catch (err) {
        console.error("❌ Error leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [seasonId]);

  return {
    players,
    loading,
    seasons,
    seasonId,
    setSeasonId,
  };
}
