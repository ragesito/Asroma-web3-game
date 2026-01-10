"use client";

import { createPortal } from "react-dom";

export default function ToastPortal({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") return null;
  const root = document.getElementById("toast-root");
  return root ? createPortal(children, root) : null;
}
