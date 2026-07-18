"use client";

/**
 * Last-resort boundary: fires when even the root layout fails to render, so it
 * must ship its own <html>/<body>. Kept dependency-free and inline-styled so
 * it can't itself throw.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#1f1934",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <span style={{ fontSize: "3rem" }}>⚠️</span>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Something went wrong</h2>
        <p style={{ margin: 0, maxWidth: "28rem", opacity: 0.7 }}>
          The app hit an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            border: "none",
            borderRadius: "0.5rem",
            background: "#f97316",
            color: "#fff",
            padding: "0.5rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
