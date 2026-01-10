
import { useState } from "react";
import LoginModal from "../components/LoginModal";
import { useHydrated } from "@/app/hooks/useHydrated";
import HeroTextv2 from "./heroTextv2";


const Hero = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const hydrated = useHydrated();
    if (!hydrated) return null;
    return (
        <div className="relative w-full bg-no-repeat py-20 md:py-24 px-4 ">
            <HeroTextv2 />
             <div className="mt-[-15rem]">
            
            </div>
        <LoginModal
                            isOpen={showLogin}
                            onClose={() => setShowLogin(false)}
                            onLoginSuccess={() => setShowLogin(false)}
                            />
        </div>
        
    );
}

export default Hero;