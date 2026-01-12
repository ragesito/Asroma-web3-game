"use client";

import React from "react";
import { useRouter } from "next/navigation";
const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative md:fixed md:bottom-1 bottom-24 w-full py-0 bg-black/40 backdrop-blur-sm">
  <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-sm text-white/60 ">
    <span>© {currentYear} <span className="text-white/80 font-medium">Asroma.</span> All Rights Reserved.</span>
    <span className="hidden md:inline text-white">•</span>
    <div className="flex space-x-4">
    <button
      onClick={() => router.push("/legal?tab=terms")}
      className="hover:text-white transition"
    >
      Terms of Service
    </button>

    <button
      onClick={() => router.push("/legal?tab=privacy")}
      className="hover:text-white transition"
    >
      Privacy Policy
    </button>
    </div>
  </div>
</footer>

  );
};

export default Footer;
