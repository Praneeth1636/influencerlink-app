"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function SparklesCore({
  className,
  particleColor = "#FFFFFF",
  particleDensity = 80,
  minSize = 0.4,
  maxSize = 1.2
}: {
  className?: string;
  background?: string;
  particleColor?: string;
  particleDensity?: number;
  minSize?: number;
  maxSize?: number;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: Math.min(180, Math.max(20, Math.floor(particleDensity / 8))) }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 61) % 100}%`,
        size: minSize + ((index * 13) % 10) * ((maxSize - minSize) / 10),
        delay: `${(index % 12) * 0.16}s`,
        duration: `${2.2 + (index % 8) * 0.22}s`
      })),
    [maxSize, minSize, particleDensity]
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="sparkleParticle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
            animationDelay: particle.delay,
            animationDuration: particle.duration
          }}
        />
      ))}
    </div>
  );
}

export function LogoSparkles({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-16 w-56 overflow-hidden", className)}>
      <div className="absolute inset-x-8 top-4 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent blur-sm" />
      <div className="absolute inset-x-14 top-4 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      <SparklesCore className="h-full w-full" particleDensity={260} particleColor="#ffffff" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_25%,#050505_75%)]" />
    </div>
  );
}
