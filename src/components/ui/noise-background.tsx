"use client";

import type React from "react";
import { cn } from "@/lib/utils";

type NoiseBackgroundProps = {
  children: React.ReactNode;
  containerClassName?: string;
  gradientColors?: [string, string, string] | string[];
};

export function NoiseBackground({
  children,
  containerClassName,
  gradientColors = ["rgb(245, 179, 142)", "rgb(140, 201, 232)", "rgb(255, 238, 226)"]
}: NoiseBackgroundProps) {
  const [first, second, third] = gradientColors;

  return (
    <span
      className={cn("creatorlink-noise-button relative inline-flex overflow-hidden p-1", containerClassName)}
      style={
        {
          "--noise-first": first,
          "--noise-second": second,
          "--noise-third": third ?? first
        } as React.CSSProperties
      }
    >
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(115deg,var(--noise-first),var(--noise-second),var(--noise-third),var(--noise-first))]" />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.8)_1px,transparent_0)] [background-size:6px_6px] opacity-[0.16] mix-blend-overlay" />
      <span className="relative z-10 inline-flex h-full w-full">{children}</span>
    </span>
  );
}
