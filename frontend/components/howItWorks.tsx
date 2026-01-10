"use client";

import { motion } from "framer-motion";
import { Wallet, Hand, Coins} from "lucide-react";
import { useRouter } from "next/navigation";
import ElectricBorder from "./electricBorder";
const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };


export default function HowItWorks() {
  const steps = [
    {
      icon: <Wallet size={45} className="text-orange-700" />,
      title: "1. Connect Your Wallet",
      desc: "Currently compatible with Solana, BNB support coming soon."
    },
    {
      icon: <Hand size={45} className="text-orange-400" />,
      title: "2. Choose your bet",
      desc: "Select the amount of SOL and enter matchmaking with real players or friends."
    },
    {
      icon: <Coins size={45} className="text-orange-700" />,
      title: "3. Win matches",
      desc: "Play real time RPS and win to claim your rivals’ rewards"
    }
  ];

const router = useRouter();
  return (
    <section id="how" className="py-32 relative text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {steps.map((s, i) => (
           <motion.div
    key={s.title}                   
    variants={variants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 1.5 + i * 0.2 }} 
  >
    <ElectricBorder
      thickness={3}
      speed={0.89}
      chaos={1}
      color="#ff7b00"
      className="rounded-lg"
    >
      <div className=" p-8 rounded-2xl  shadow-xl">
        <div className="flex justify-center mb-4">{s.icon}</div>
        <h3 className="text-2xl font-semibold text-center mb-3 text-shadow-lg">
          {s.title}
        </h3>
        <p className="text-center text-gray-300 text-shadow-md">
          {s.desc}
        </p>
      </div>
    </ElectricBorder>
  </motion.div>
        ))}
      </div>
      <motion.div
  className="md:text-2xl mt-7 text-1xl mx-5 text-white/70 lg:text-2xl mt-3 font-bold text-center relative z-20"
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 2.2 }}
>

        <div className="flex justify-center space-x-4 ">
       
          <button
            onClick={() => {
              router.push("/games");
            }}
            className="
              relative 
              px-10 py-3 
              rounded-xl 
              font-bold text-lg 
              text-indigo-100/90
              bg-gradient-to-b from-orange-400 to-orange-600
              shadow-[0_0_20px_rgba(255,140,0,0.3)]
              w-auto
              md:w-40
              transition-all duration-300 ease-out
              hover:scale-[1.05]
              hover:shadow-[0_0_35px_rgba(255,160,50,0.55)]
            "
          >
            Play
          </button>

          <button
            onClick={() => {
              router.push("/");
            }}
            className="
              relative 
              px-6 py-3 
              rounded-xl 
              font-semibold text-white text-lg
              bg-black/40 
              border border-orange-400/50
              shadow-[0_0_17px_rgba(255,165,0,0.40)]
              backdrop-blur-md
              w-auto
              md:w-48
              transition-all duration-300 ease-out
              hover:scale-[1.03]
              hover:border-orange-400
              hover:shadow-[0_0_35px_rgba(255,165,0,0.45)]
            "
          >
            Connect Wallet
          </button>
        </div>
              
</motion.div>  

    </section>
  );
}
