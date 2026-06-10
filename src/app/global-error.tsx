"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24, fontFamily: "sans-serif" }}
        >
          <div style={{ maxWidth: 560 }}>
            <p
              style={{
                color: "#e08550",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase"
              }}
            >
              Terrace
            </p>
            <h1 style={{ marginTop: 8, color: "#1d1d1f", fontSize: 32, lineHeight: 1.1 }}>Something broke.</h1>
            <p style={{ marginTop: 12, color: "#667085", fontSize: 14, lineHeight: 1.6 }}>
              The app hit an unexpected error while loading this page.
            </p>
            {error.digest ? (
              <p style={{ marginTop: 8, color: "#98a2b3", fontFamily: "monospace", fontSize: 12 }}>
                digest: {error.digest}
              </p>
            ) : null}
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 999,
                background: "#1d1d1f",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 18px"
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
