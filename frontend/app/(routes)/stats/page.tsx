"use client";

import { useEffect, useState } from "react";
import TransitionPage from "@/components/transition-page";
import { useUserStore } from "@/app/store/userStore";
import api from "@/app/lib/api";
import { StatsSummary } from "@/components/stats/statsSummary";
import { RecentMatches } from "@/components/stats/recentMatches";
import LottieLoader from "@/components/lottieLoader";
import Particles from "@/components/spaceParticles";
import { motion } from "framer-motion";
import Select from "@/components/select";
import { useTranslation } from "react-i18next";
interface Season {
  _id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
}

export default function Stats() {
  const { id, username } = useUserStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const demoStats = {
  totalWins: 0,
  totalLosses: 0,
  winRate: 0,
  recentMatches: []
};
const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

const [seasonId, setSeasonId] = useState<string>("current");
const [mode, setMode] = useState<string>("all");
const [seasons, setSeasons] = useState<Season[]>([]);

useEffect(() => {
  api.get("/seasons")
    .then((res) => {
      const list: Season[] = res?.data || [];

      setSeasons(list);

      const active = list.find((s) => s.isActive);
      if (active) {
        setSeasonId(active._id);
      } else {
        setSeasonId("all"); 
      }
    })
    .catch(() => console.warn("No se pudieron cargar temporadas"));
}, []);

  useEffect(() => {
    if (!id)  {
    setLoading(false);  
    return;
  } 

    const fetchStats = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/stats/${id}`, {
  params: {
    seasonId,
    mode,
  },
});
setStats(res?.data || null);
      } catch (err) {
        console.error("❌ Error al obtener estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [id, seasonId, mode]);

  return (
    <>
      <TransitionPage />
      

      <div
        className="flex min-h-[100vh] h-auto bg-no-repeat bg-center bg-cover relative"
        style={{
          backgroundImage:
            "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"></div>

        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

        {/* CONTENT */}
        <div className="relative z-10 w-full flex justify-center text-white px-6 py-14 md:px-6 md:py-20">
          <div className="w-full mt-20 max-w-7xl flex flex-col gap-10">

           

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center h-[70vh] text-gray-400">
                      <LottieLoader />
                    </div>
            )}

            {/* Dashboard */}
            {!loading && stats && (
              <>
              {/* STATS FILTERS */}
<motion.div
  className="relative z-20 flex flex-wrap gap-4 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-xl overflow-visible"
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 0.4 }}
>


  {/* SEASON SELECTOR */}
  <div className="flex flex-col ">
    <label className="text-sm text-gray-300 mb-1">{t("season")}</label>
    <Select
  label="Temporada"
  value={seasonId}
  onChange={setSeasonId}
  options={[
    { label: t("all"), value: "all" },
    ...seasons.map((s, index) => ({
      label: `${t("season")} ${index + 1}`, 
      value: s._id,
    })),
  ]}
/>

  </div>

  {/* MODE SELECTOR */}
  <div className="flex flex-col">
    <label className="text-sm text-gray-300 mb-1">{t("mode")}</label>
    <Select
  label="Modo"
  value={mode}
  onChange={setMode}
  options={[
    { label: t("all"), value: "all" },
    { label: t("ranked"), value: "ranked" },
    { label: t("private"), value: "private" },
  ]}
/>
  </div>
</motion.div>

                <StatsSummary {...stats} />
                <RecentMatches matches={stats.recentMatches} />
              </>
            )}

            {/* No stats */}
            {!loading && !stats && (
              <motion.div className="flex justify-center mt-20 pt-20 items-center"
              variants={variants} initial="hidden" animate="visible" transition={{ delay: 1.5 }}>
                <p className="text-center text-gray-400">
                  No se encontraron estadísticas.
                </p>
              </motion.div>

            )}
          </div>
        </div>
      </div>
    </>
  );
}
