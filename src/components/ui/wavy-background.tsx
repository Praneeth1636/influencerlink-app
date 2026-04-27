import type React from "react";
import { cn } from "@/lib/utils";

export function WavyBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden rounded-3xl bg-black", className)}>
      <div className="waveLayer" aria-hidden="true" />
      <div className="waveLayer waveLayerTwo" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
