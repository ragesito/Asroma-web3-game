"use client";

import Navbar from "@/components/navbar";
import Header from "@/components/header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <>
      <Navbar />
       <Header />
      <main>{children}</main>
    </>
  );
}
