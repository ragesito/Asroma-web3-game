"use client";

import { useHydrated } from "@/app/hooks/useHydrated";
import HeroTextv2 from "./heroTextv2";

const Hero = () => {
    const hydrated = useHydrated();
    if (!hydrated) return null;
    return (
        <div className="relative w-full bg-no-repeat py-20 md:py-24 px-4 ">
            <HeroTextv2 />
             <div className="mt-[-15rem]">
            </div>
        </div>
        
    );
}

export default Hero;