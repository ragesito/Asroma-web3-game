"use client";

import TransitionPage from "@/components/transition-page";
import Particles from "@/components/spaceParticles";
import GameLobby from "@/components/gameArena/gameLobby";
const Game = () => {
  return (
    <>
      <TransitionPage />     
      <div
        className="flex min-h-[100vh] h-auto bg-no-repeat bg-center bg-cover relative"
        style={{
          backgroundImage: "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent"></div>
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
        <div className="relative z-10 w-full flex items-center justify-center text-white">
           <GameLobby />
        </div>
      </div>
    </>
  );
};

export default Game;
