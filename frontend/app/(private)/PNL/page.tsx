"use client";

import TransitionPage from "@/components/transition-page";
import Particles from "@/components/spaceParticles";
import PnlChart from "@/components/PNL/pnlChart";
import BalanceCard from "@/components/PNL/balanceCard";
import PerformanceCard from "@/components/PNL/performanceCard";
export default function PnlPage() {
  return (
    <>
      <TransitionPage />
  

      <div
        className="min-h-[100vh] bg-cover bg-center px-6 py-16 text-white"
        style={{
          backgroundImage:
            "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        {/* particles */}
        <div className="absolute inset-0">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={150}
            moveParticlesOnHover={false}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        <div className="relative max-w-7xl  mx-auto mt-20 space-y-6">
          {/* CHART */}
          
            <div className="max-w-7xl mx-auto space-y-6">

        {/* CHART */}
        <PnlChart />

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BalanceCard />
          <PerformanceCard />
        </div>

      </div>
        </div>
      </div>
    </>
  );
}
