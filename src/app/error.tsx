"use client";

// Top-level error boundary. Without this, an unhandled throw in any (group)
// route renders a blank screen — Next.js silently bails out. We surface the
// error message + stack in dev so we don't lose another debugging hour.

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center p-6">
      <div className="border-border bg-card max-w-2xl rounded-2xl border p-8 shadow-lg">
        <p className="text-muted-foreground text-xs font-black tracking-[0.24em] uppercase">Something broke</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">{error.name || "Error"}</h1>
        <p className="text-foreground/80 mt-3 text-sm">{error.message}</p>
        {error.digest && <p className="text-muted-foreground mt-2 font-mono text-xs">digest: {error.digest}</p>}
        {process.env.NODE_ENV !== "production" && error.stack && (
          <pre className="bg-muted/30 text-foreground/70 mt-4 max-h-64 overflow-auto rounded-md p-3 text-xs leading-5 whitespace-pre-wrap">
            {error.stack}
          </pre>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
