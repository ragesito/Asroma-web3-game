"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionTransition } from "./transition-component";
import { itemsNavbar, privItemsNavbar } from "@/data";
import { useUserStore } from "@/app/store/userStore";
import { useHydrated } from "@/app/hooks/useHydrated";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation"; 
const Navbar = () => {
  const hydrated = useHydrated();
  const pathname = usePathname(); 
  const username = useUserStore((s) => s.username);
  const isLogged = useUserStore((s) => s.isLoggedIn());
  const router = useRouter();
  const { t } = useTranslation();

  const navItems = isLogged ? privItemsNavbar : itemsNavbar;
  
  if (!hydrated) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
    );
  }
 return (
  <MotionTransition
    position="right"
    className="fixed z-40 w-full bottom-10 flex justify-center"
  >
    <nav className={`w-full px-4 ${
    isLogged ? "max-w-md " : "max-w-lg"
  }`}>
      <div className="flex items-center gap-4 px-3 py-1 rounded-full border border-orange-700/20  bg-black/40 backdrop-blur-sm 
overflow-x-auto no-scrollbar md:overflow-visible md:no-scrollbar-off md:justify-center">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(item.link)}
            className={`flex-shrink-0 px-3 py-2 transition duration-150 rounded-full cursor-pointer hover:bg-orange-700 ${
              pathname === item.link ? "bg-orange-700" : ""
            }`}
          >
            {item.icon}
          </div>
        ))}
        
      </div>
    </nav>
  </MotionTransition>
);

};

export default Navbar;
