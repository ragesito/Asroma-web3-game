"use client";

import TransitionPage from "@/components/transition-page";
import Header from "@/components/header";
import { useUserStore } from "@/app/store/userStore"; 
import { useEffect } from "react";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";
import FriendList from "@/components/friends/friendList";
import Particles from "@/components/spaceParticles";

const FriendsPage = () => {
  const { token } = useUserStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  useEffect(() => {
    console.log("Token detectado:", token);
  }, [token]);

  return (
    <>
      <TransitionPage />
     
      <div
        className="flex min-h-[100vh] h-auto md:h-full bg-no-repeat bg-center bg-cover relative"
        style={{
          backgroundImage: "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"></div>
      <div className="relative w-full bg-no-repeat py-20 md:py-24 px-4 flex justify-center">
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
        <FriendList />
        
      </div>
      </div>
    </>
  );
};

export default FriendsPage;
