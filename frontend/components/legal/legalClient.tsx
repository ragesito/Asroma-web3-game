"use client";

import { useSearchParams } from "next/navigation";
import TransitionPage from "@/components/transition-page";
import Particles from "@/components/spaceParticles";

function Terms() {
  return (
    <>
       <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-white/50">Last updated: January 2026</p>

          <p>
            By accessing or using Asroma (the “Service”), you agree to be bound by
            these Terms of Service (“Terms”). If you do not agree to these Terms,
            you may not access or use the Service.
          </p>

          <p>
            These Terms apply to all users, including visitors, registered users,
            and authenticated users.
          </p>

          <h2 className="font-semibold text-lg">Description of the Service</h2>
          <p>
            Asroma is an online platform that provides user accounts, game-related
            features, statistics, leaderboards, real-time features, optional Web3
            wallet authentication, and non-custodial interactions.
          </p>

          <h2 className="font-semibold text-lg">Eligibility</h2>
          <p>
            You must be at least 13 years old to use the Service.
          </p>

          <h2 className="font-semibold text-lg">User Accounts</h2>
          <p>
            You are responsible for maintaining the security of your account and
            all activity under it.
          </p>

          <h2 className="font-semibold text-lg">Web3 & Wallet Disclaimer</h2>
          <p>
            Asroma does not store private keys, control wallets, or custody digital
            assets. All interactions are user-initiated and non-custodial.
          </p>

          <h2 className="font-semibold text-lg">Acceptable Use</h2>
          <p>
            You may not abuse, exploit, reverse-engineer, automate, or interfere
            with the Service.
          </p>

          <h2 className="font-semibold text-lg">Limitation of Liability</h2>
          <p>
            Use of the Service is at your own risk. Asroma is not responsible for
            loss of data, access, or digital assets.
          </p>

          <h2 className="font-semibold text-lg">Termination</h2>
          <p>
            We may suspend or terminate access at any time for violations or
            operational reasons.
          </p>

          <h2 className="font-semibold text-lg">Contact</h2>
          <p>support@asroma.app</p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-white/50">Last updated: January 2026</p>

          <p>
            This Privacy Policy explains how Asroma collects, uses, and protects
            your information.
          </p>

          <h2 className="font-semibold text-lg">Information We Collect</h2>
          <p>
            This may include username, email, usage data, device information, and
            public wallet addresses.
          </p>

          <h2 className="font-semibold text-lg">What We Do Not Collect</h2>
          <p>
            We never collect private keys, seed phrases, or wallet recovery data.
          </p>

          <h2 className="font-semibold text-lg">Use of Information</h2>
          <p>
            Information is used for authentication, features, stats, security,
            and system communications.
          </p>

          <h2 className="font-semibold text-lg">Public Information</h2>
          <p>
            Usernames and statistics may be publicly visible on leaderboards.
          </p>

          <h2 className="font-semibold text-lg">Data Sharing</h2>
          <p>
            We do not sell user data. Sharing occurs only for legal or operational
            reasons.
          </p>

          <h2 className="font-semibold text-lg">Security</h2>
          <p>
            We apply reasonable security practices, but no system is completely
            secure.
          </p>

          <h2 className="font-semibold text-lg">Children</h2>
          <p>
            The Service is not intended for children under 13.
          </p>

          <h2 className="font-semibold text-lg">Contact</h2>
          <p>privacy@asroma.app</p>
    </>
  );
}

export default function LegalClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "terms";

  return (
    <main>
      <TransitionPage />

      <div
        className="min-h-screen bg-cover bg-center relative text-white"
        style={{
          backgroundImage:
            "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <Particles
          particleColors={["#ffffff"]}
          particleCount={120}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={120}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <button
              className={tab === "terms" ? "text-white" : "text-white/50"}
              onClick={() =>
                window.history.pushState(null, "", "/legal?tab=terms")
              }
            >
              Terms of Service
            </button>
            <button
              className={tab === "privacy" ? "text-white" : "text-white/50"}
              onClick={() =>
                window.history.pushState(null, "", "/legal?tab=privacy")
              }
            >
              Privacy Policy
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 space-y-5 text-sm max-h-[62vh] overflow-y-auto">
            {tab === "terms" ? <Terms /> : <Privacy />}
          </div>
        </div>
      </div>
    </main>
  );
}
