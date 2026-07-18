import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <div className="flex flex-col items-center gap-2">
        <span className="text-6xl font-black text-orange-500">404</span>
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="max-w-md text-white/60">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-600"
      >
        Go home
      </Link>
    </div>
  );
}
