import { useEffect } from "react";
import { useSolPriceStore } from "@/app/store/solPriceStore";

const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

const INTERVAL = 30_000;
const MIN_GAP = 10_000; 

export function useSolPriceSync() {
  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;
    let lastRun = 0;

    const cached = localStorage.getItem("sol_price_usd");
    if (cached) {
      const n = Number(cached);
      if (!Number.isNaN(n)) {
        useSolPriceStore.getState().setPrice(n);
      }
    }

    const sync = async () => {
      if (!alive) return;
      if (!navigator.onLine) return;
      if (document.visibilityState !== "visible") return;

      const now = Date.now();
      if (now - lastRun < MIN_GAP) return;
      lastRun = now;

      controller?.abort();
      controller = new AbortController();

      try {
        const res = await fetch(PRICE_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const price = data?.solana?.usd;

        if (typeof price === "number" && alive) {
          useSolPriceStore.getState().setPrice(price);
          localStorage.setItem("sol_price_usd", String(price));
        }
      } catch (err) {
        if (!alive) return;
        if (err instanceof DOMException && err.name === "AbortError") return;

        console.warn("⚠️ SOL price sync skipped");
      }
    };

    sync();
    const interval = setInterval(sync, INTERVAL);

    return () => {
      alive = false;
      controller?.abort();
      clearInterval(interval);
    };
  }, []);
}
