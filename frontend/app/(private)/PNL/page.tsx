"use client";

import { useTranslation } from "react-i18next";
import TransitionPage from "@/components/transition-page";
import Particles from "@/components/spaceParticles";

export default function PnlPage() {
  const { t } = useTranslation();

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

        <div className="relative max-w-7xl mx-auto mt-20">
          {/*
            The PNL cards and chart were rendering hardcoded placeholder
            figures (fake balance, fake win/loss, "chart placeholder"). Showing
            invented currency numbers on a real-money app is worse than showing
            nothing, so the page is gated behind a clear Coming Soon state until
            it is wired to real data. The BalanceCard / PerformanceCard /
            PnlChart components are kept in the repo for that work.
          */}
          <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-8 py-16 text-center backdrop-blur">
            <span className="text-5xl">📊</span>
            <h1 className="text-3xl font-bold tracking-wide">{t("pnl")}</h1>
            <span className="rounded-full bg-orange-500/20 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-orange-400">
              {t("coming_soon")}
            </span>
            <p className="max-w-md text-white/60">
              {t("pnl_coming_soon_desc")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
