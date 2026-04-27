import type React from "react";
import { cn } from "@/lib/utils";

export function AuroraBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden bg-[#050505]", className)}>
      <div className="auroraLayer" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
