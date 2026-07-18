"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Segment-level error boundary. Without this, any thrown render error in a
 * client component white-screens the whole route. Catches it and offers
 * recovery instead.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">⚠️</span>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="max-w-md text-white/60">
          An unexpected error occurred. You can try again, or go back to the
          home page.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg border border-white/20 px-6 py-2 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
