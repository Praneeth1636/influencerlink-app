"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.5 };
const OPACITY_EASE = [0.4, 0, 0.2, 1] as const;
const OPACITY_DURATION_BASE = 0.8;
const OPACITY_DURATION_VARIATION = 0.2;
const OPACITY_DELAY_CYCLE = 1.5;
const OPACITY_DELAY_STEP = 0.02;
const MIN_OPACITY_MULTIPLIER = 0.5;
const MAX_OPACITY_MULTIPLIER = 1.5;
const MIN_OPACITY_FALLBACK = 0.3;
const PROXIMITY_MULTIPLIER = 1.2;
const PROXIMITY_OPACITY_BOOST = 0.8;

export interface MouseEffectCardProps {
  className?: string;
  children?: ReactNode;
  dotSize?: number;
  dotSpacing?: number;
  repulsionRadius?: number;
  repulsionStrength?: number;
  title?: string;
  subtitle?: string;
  topText?: string;
  topSubtext?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  footerText?: string;
}

interface Dot {
  id: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  opacity: number;
}

interface DotComponentProps {
  dot: Dot;
  index: number;
  dotSize: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  repulsionRadius: number;
  repulsionStrength: number;
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

function generateDots(width: number, height: number, spacing: number): Dot[] {
  const dots: Dot[] = [];
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let row = 0; row <= rows; row += 1) {
    for (let col = 0; col <= cols; col += 1) {
      const x = col * spacing;
      const y = row * spacing;
      const dx = x - centerX;
      const dy = y - centerY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      const edgeFactor = Math.min(distanceFromCenter / (maxDistance * 0.7), 1);

      if (Math.random() > edgeFactor) {
        continue;
      }

      const pattern = (row + col) % 3;
      const baseOpacities = [0.3, 0.5, 0.7];
      const opacity = (baseOpacities[pattern] ?? 0.5) * edgeFactor;

      dots.push({
        baseX: x,
        baseY: y,
        id: `dot-${row}-${col}`,
        opacity,
        x,
        y
      });
    }
  }

  return dots;
}

function DotComponent({ dot, index, dotSize, mouseX, mouseY, repulsionRadius, repulsionStrength }: DotComponentProps) {
  const posX = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.cos(angle) * force;
    }

    return 0;
  });

  const posY = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const dx = dot.baseX - mx;
    const dy = dot.baseY - my;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < repulsionRadius) {
      const force = (1 - distance / repulsionRadius) * repulsionStrength;
      const angle = Math.atan2(dy, dx);
      return Math.sin(angle) * force;
    }

    return 0;
  });

  const opacityBoost = useTransform([mouseX, mouseY], () => {
    const mx = mouseX.get();
    const my = mouseY.get();

    if (!(Number.isFinite(mx) && Number.isFinite(my))) {
      return 0;
    }

    const distance = calculateDistance(dot.baseX, dot.baseY, mx, my);
    const maxDistance = repulsionRadius * PROXIMITY_MULTIPLIER;

    if (distance < maxDistance) {
      const proximityFactor = 1 - distance / maxDistance;
      return proximityFactor * PROXIMITY_OPACITY_BOOST;
    }

    return 0;
  });

  const x = useSpring(posX, SPRING_CONFIG);
  const y = useSpring(posY, SPRING_CONFIG);
  const baseMinOpacity = Math.max(dot.opacity * MIN_OPACITY_MULTIPLIER, MIN_OPACITY_FALLBACK);
  const baseMaxOpacity = Math.min(dot.opacity * MAX_OPACITY_MULTIPLIER, 1);
  const minOpacityWithBoost = useTransform(opacityBoost, (boost) => Math.min(baseMinOpacity + boost, 1));
  const opacity = useSpring(minOpacityWithBoost, { stiffness: 150, damping: 25 });
  const delay = (index * OPACITY_DELAY_STEP) % OPACITY_DELAY_CYCLE;

  return (
    <motion.div
      animate={{ opacity: [baseMinOpacity, baseMaxOpacity, baseMinOpacity] }}
      className="absolute rounded-full bg-zinc-400 will-change-transform dark:bg-zinc-600"
      initial={{ opacity: baseMinOpacity }}
      style={{
        height: dotSize,
        left: dot.baseX,
        opacity,
        top: dot.baseY,
        width: dotSize,
        x,
        y
      }}
      transition={{
        opacity: {
          delay,
          duration: OPACITY_DURATION_BASE + (index % 4) * OPACITY_DURATION_VARIATION,
          ease: OPACITY_EASE,
          repeat: Number.POSITIVE_INFINITY,
          times: [0, 0.5, 1]
        }
      }}
    />
  );
}

export function MouseEffectCard({
  className,
  children,
  dotSize = 2,
  dotSpacing = 16,
  repulsionRadius = 80,
  repulsionStrength = 20,
  title = "Terrace",
  subtitle = "Creator proof that moves with the market",
  topText = "AI Match",
  topSubtext = "Audience fit, budget, and niche",
  primaryCtaText = "Start matching",
  primaryCtaUrl = "#",
  secondaryCtaText = "View creators",
  secondaryCtaUrl = "#",
  footerText = "Built for creators and brands"
}: MouseEffectCardProps) {
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const mouseY = useMotionValue(Number.POSITIVE_INFINITY);
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    function updateDots() {
      if (!innerContainerRef.current) return;
      const rect = innerContainerRef.current.getBoundingClientRect();
      setDots(generateDots(rect.width, rect.height, dotSpacing));
    }

    updateDots();

    const resizeObserver = new ResizeObserver(updateDots);
    if (innerContainerRef.current) {
      resizeObserver.observe(innerContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [dotSpacing]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!innerContainerRef.current) return;

    const rect = innerContainerRef.current.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    mouseX.set(Number.POSITIVE_INFINITY);
    mouseY.set(Number.POSITIVE_INFINITY);
  }

  return (
    <Card
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 p-0 shadow-none dark:border-white/10",
        className
      )}
    >
      <CardContent
        className="relative h-[400px] w-full overflow-hidden p-0"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={innerContainerRef}
      >
        {dots.map((dot, index) => (
          <DotComponent
            dot={dot}
            dotSize={dotSize}
            index={index}
            key={dot.id}
            mouseX={mouseX}
            mouseY={mouseY}
            repulsionRadius={repulsionRadius}
            repulsionStrength={repulsionStrength}
          />
        ))}

        {topText && (
          <div className="absolute top-6 left-6 z-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-white/60 blur-lg dark:bg-zinc-950/60" />
              <div className="relative flex flex-col gap-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{topText}</p>
                {topSubtext && (
                  <p className="text-xs font-medium text-zinc-600 opacity-70 dark:text-zinc-400">{topSubtext}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-2">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/80 blur-2xl dark:bg-zinc-950/80" />
              <h2 className="relative text-center text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {title}
              </h2>
            </div>
            {(subtitle || children) && (
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-white/60 blur-xl dark:bg-zinc-950/60" />
                <p className="relative max-w-sm text-center text-base leading-relaxed font-medium text-zinc-700 dark:text-zinc-300">
                  {children || subtitle}
                </p>
              </div>
            )}
            <div className="mt-2 flex items-center gap-3">
              <Button asChild className="rounded-full shadow-lg" size="lg">
                <a href={primaryCtaUrl} onClick={(event) => primaryCtaUrl === "#" && event.preventDefault()}>
                  {primaryCtaText}
                </a>
              </Button>
              {secondaryCtaText && (
                <Button asChild className="rounded-full" size="lg" variant="outline">
                  <a href={secondaryCtaUrl} onClick={(event) => secondaryCtaUrl === "#" && event.preventDefault()}>
                    {secondaryCtaText}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {footerText && (
          <div className="absolute right-0 bottom-6 left-0 z-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/60 blur-lg dark:bg-zinc-950/60" />
              <p className="relative px-4 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{footerText}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MouseEffectCard;
