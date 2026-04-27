"use client";

import { cn } from "@/lib/utils";

export function DottedGlowBackground({
  className,
  opacity = 1,
  gap = 10,
  radius = 1.6,
  backgroundOpacity = 0
}: {
  className?: string;
  opacity?: number;
  gap?: number;
  radius?: number;
  colorLightVar?: string;
  glowColorLightVar?: string;
  colorDarkVar?: string;
  glowColorDarkVar?: string;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
}) {
  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        opacity,
        backgroundColor: `rgba(0,0,0,${backgroundOpacity})`,
        backgroundImage: `radial-gradient(circle, rgba(56,189,248,0.8) ${radius}px, transparent ${radius + 0.4}px), radial-gradient(circle at 50% 50%, rgba(14,165,233,0.35), transparent 38%)`,
        backgroundSize: `${gap}px ${gap}px, 100% 100%`
      }}
    />
  );
}
