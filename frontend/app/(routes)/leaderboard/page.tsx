"use client";

import TransitionPage from "@/components/transition-page";
import { LeaderboardTable } from "@/components/leaderboard/leaderboardTable";
import { useLeaderboard } from "@/app/hooks/useLeaderboard";
import Particles from "@/components/spaceParticles";
import Lottie from "lottie-react";
import loaderAnimation from "@/public/lotties/finding.json";
export default function Leaderboard() {
  const { players, loading, seasons, seasonId, setSeasonId } = useLeaderboard();


  return (
    <>
      <TransitionPage />
      <div
        className="flex min-h-[100vh] bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

        <div className="relative z-10 w-full px-6 flex items-center justify-center text-white">
          {loading ? (
            <Lottie
          animationData={loaderAnimation}
          loop={true}
          style={{ width: 400, height: 400 }}
        />
          ) : (
            <LeaderboardTable
             players={players}
            seasonId={seasonId}
            setSeasonId={setSeasonId}
            seasons={seasons} />
          )}
        </div>
      </div>
    </>
  );
}
