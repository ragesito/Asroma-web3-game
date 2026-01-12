import { motion } from "motion/react";
import { SparklesCore } from "@/components/backgroundLines";
import Image from "next/image";
import { useRouter } from "next/navigation"; 

const HeroTextv2 = () => {
  const words = [
    <Image key="rock" src="/rock.png" alt="Rock" width={120} height={120} />,
    <Image key="paper" src="/paper.png" alt="Paper" width={120} height={130} />,
    <Image key="scissors" src="/scissors.png" alt="Scissors" width={120} height={120} />,
];
  const variants = {    
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  const router = useRouter();
  return (
    <div className="relative w-full bg-no-repeat py-20 md:py-24 px-4 flex justify-center">
                <div className="h-[10rem] w-full  flex flex-col items-center justify-center rounded-md">
          
            <motion.h1 className="md:text-8xl text-7xl lg:text-9xl font-bold text-center text-white relative z-20" variants={variants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} >Asroma </motion.h1>
            
         <div className="w-[20rem] md:w-[40rem] h-40 relative">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-orange-700 to-transparent h-[2px] w-2/4 md:w-3/4 blur-sm origin-left"
          />

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-orange-700 to-transparent h-px w-2/4 md:w-3/4 origin-left"
          />

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-700 to-transparent h-[5px]  md:w-1/4 blur-sm origin-left"
          />

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-700 to-transparent h-px  md:w-1/4 origin-left"
          />
            
            <motion.h1
  className="md:text-5xl text-2xl mx-5 text-orange-700 shadow-xl lg:text-5xl mt-5 font-bold text-center relative z-20"
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 1.2 }}
>
  
   <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage:
        "linear-gradient(90deg, #ec5f01ff 0%, #df6603ff 40%, #ffa530ff 100%)",
      WebkitTextStroke: "0.5px rgba(255,255,255,0.15)",
      textShadow: "0 0 12px rgba(255, 166, 0, 0.6)",
    }}
  >
    Play, Predict,
  </span>{" "}
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage:
        "linear-gradient(90deg, #ffb347 0%, #ffcc33 40%, #fff599 100%)",
      WebkitTextStroke: "0.5px rgba(255,255,255,0.15)",
      textShadow: "0 0 12px rgba(255, 179, 71, 0.6)",
    }}
  >
    Win Solana
  </span>
 
</motion.h1>

<motion.h1
  className="md:text-2xl text-sm mx-5 text-white/70 lg:text-2xl mt-3 font-bold text-center relative z-20"
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ delay: 1.4 }}
>
  
   Web3 Rock Paper Scissors experience game.
 
</motion.h1>
            <div className="absolute inset-0 w-full h-full  [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
            
          </div>
          
        </div>

        </div> 
        );
    }

export default HeroTextv2;