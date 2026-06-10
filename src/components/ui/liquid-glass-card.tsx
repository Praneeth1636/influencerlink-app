"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GLASS_SHADOW_LIGHT =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]";
const GLASS_SHADOW_DARK =
  "dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]";
const GLASS_SHADOW = `${GLASS_SHADOW_LIGHT} ${GLASS_SHADOW_DARK}`;

const DEFAULT_GLASS_FILTER_SCALE = 30;
const BUTTON_GLASS_FILTER_SCALE = 70;
const TOTAL_DURATION = 45;
const VOLUME_BAR_COUNT = 8;
const SEEK_JUMP_SECONDS = 5;
const TIMER_INTERVAL_MS = 1000;
const MIN_TIME = 0;

interface GlassFilterProps {
  id: string;
  scale?: number;
}

const GlassFilter = React.memo(({ id, scale = DEFAULT_GLASS_FILTER_SCALE }: GlassFilterProps) => (
  <svg aria-hidden="true" className="hidden">
    <defs>
      <filter colorInterpolationFilters="sRGB" height="200%" id={id} width="200%" x="-50%" y="-50%">
        <feTurbulence baseFrequency="0.05 0.05" numOctaves="1" result="turbulence" seed="1" type="fractalNoise" />
        <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation="2" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurredNoise"
          result="displaced"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="B"
        />
        <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="4" />
        <feComposite in="finalBlur" in2="finalBlur" operator="over" />
      </filter>
    </defs>
  </svg>
));
GlassFilter.displayName = "GlassFilter";

const liquidButtonVariants = cva("relative transition-transform duration-300", {
  variants: {
    liquidVariant: {
      default: "hover:scale-105",
      none: ""
    }
  },
  defaultVariants: {
    liquidVariant: "default"
  }
});

export type LiquidButtonProps = ButtonProps & {
  liquidVariant?: "default" | "none";
};

export function LiquidButton({ className, liquidVariant = "default", children, ...props }: LiquidButtonProps) {
  const reactId = React.useId();
  const filterId = `liquid-button-${reactId.replaceAll(":", "")}`;

  return (
    <>
      <Button className={cn(liquidButtonVariants({ liquidVariant }), className)} {...props}>
        <div className={cn("pointer-events-none absolute inset-0 rounded-full transition-all", GLASS_SHADOW)} />
        <div
          className="pointer-events-none absolute inset-0 isolate -z-10 overflow-hidden rounded-md"
          style={{ backdropFilter: `url("#${filterId}")` }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
      <GlassFilter id={filterId} scale={BUTTON_GLASS_FILTER_SCALE} />
    </>
  );
}

const liquidGlassCardVariants = cva(
  "group relative overflow-hidden bg-background/20 backdrop-blur-[2px] transition-all duration-300",
  {
    variants: {
      glassSize: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      glassSize: "default"
    }
  }
);

export type LiquidGlassCardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof liquidGlassCardVariants> & {
    glassEffect?: boolean;
  };

export function LiquidGlassCard({
  className,
  glassSize,
  glassEffect = true,
  children,
  ...props
}: LiquidGlassCardProps) {
  const reactId = React.useId();
  const filterId = `liquid-card-${reactId.replaceAll(":", "")}`;

  return (
    <Card className={cn(liquidGlassCardVariants({ glassSize }), className)} {...props}>
      <div className={cn("pointer-events-none absolute inset-0 rounded-lg transition-all", GLASS_SHADOW)} />
      {glassEffect && (
        <>
          <div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-lg"
            style={{ backdropFilter: `url("#${filterId}")` }}
          />
          <GlassFilter id={filterId} scale={DEFAULT_GLASS_FILTER_SCALE} />
        </>
      )}
      <div className="relative z-10">{children}</div>
      <div className="pointer-events-none absolute inset-0 z-20 rounded-lg bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:via-white/5" />
    </Card>
  );
}

function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function VolumeBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="pointer-events-none flex h-8 w-10 items-end gap-0.5">
      {Array.from({ length: VOLUME_BAR_COUNT }).map((_, index) => (
        <div
          className={cn("w-[3px] rounded-sm", isPlaying && "animate-[terrace-music-bounce_1s_ease-in-out_infinite]")}
          key={index}
          style={{
            animationDelay: `${index * 0.1}s`,
            background: "linear-gradient(to top, #e08550, #8CC9E8)",
            height: isPlaying ? undefined : "6px"
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({
  currentTime,
  onSeek,
  totalDuration
}: {
  currentTime: number;
  onSeek: (newTime: number) => void;
  totalDuration: number;
}) {
  const progress = (currentTime / totalDuration) * 100;

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    onSeek(Math.min(Math.max(MIN_TIME, percent * totalDuration), totalDuration));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSeek(Math.min(currentTime + SEEK_JUMP_SECONDS, totalDuration));
    }
  }

  return (
    <>
      <div className="flex justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span className="tabular-nums">{formatTime(currentTime)}</span>
        <span className="tabular-nums">{formatTime(totalDuration)}</span>
      </div>
      <div
        aria-label="Seek progress bar"
        aria-valuemax={totalDuration}
        aria-valuemin={MIN_TIME}
        aria-valuenow={currentTime}
        className="relative z-10 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
      >
        <div
          className="h-full bg-gradient-to-r from-[#e08550] to-[#8CC9E8] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}

export function LiquidSignalCard() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState(MIN_TIME);

  React.useEffect(() => {
    if (!isPlaying || currentTime >= TOTAL_DURATION) return;

    const intervalId = setInterval(() => {
      setCurrentTime((previous) => {
        if (previous >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return previous + 1;
      });
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [currentTime, isPlaying]);

  function handleSeek(newTime: number) {
    setCurrentTime(newTime);
    if (newTime < TOTAL_DURATION && !isPlaying) {
      setIsPlaying(true);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <LiquidGlassCard className="gap-3.5 rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 shadow-xl dark:border-zinc-700/60 dark:from-zinc-900 dark:to-black">
        <div className="flex items-center gap-3">
          <div className="relative mr-2 mb-4 grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#e08550] via-[#F0B08D] to-[#8CC9E8] shadow-lg ring-1 ring-black/5 dark:shadow-xl">
            <span className="text-sm font-black tracking-tight text-[#141414]">TR</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">Live signal</h3>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">Campaign pulse</p>
          </div>
          <VolumeBars isPlaying={isPlaying} />
        </div>

        <div className="flex flex-col gap-2">
          <ProgressBar currentTime={currentTime} onSeek={handleSeek} totalDuration={TOTAL_DURATION} />
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <LiquidButton
                aria-label="Previous signal"
                className="h-10 w-10 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                size="icon"
                variant="ghost"
              >
                <ArrowLeft className="size-4" />
              </LiquidButton>
              <LiquidButton
                aria-label={isPlaying ? "Pause" : "Play"}
                className="h-11 w-11 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                onClick={() => setIsPlaying((previous) => !previous)}
                size="icon"
                variant="ghost"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </LiquidButton>
              <LiquidButton
                aria-label="Next signal"
                className="h-10 w-10 rounded-full bg-transparent text-zinc-700 transition-colors hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                size="icon"
                variant="ghost"
              >
                <ArrowRight className="size-4" />
              </LiquidButton>
            </div>
            <span className="rounded-full border border-[#e08550]/20 bg-[#e08550]/10 px-3 py-1 text-xs font-semibold text-[#e08550]">
              94% fit
            </span>
          </div>
        </div>
      </LiquidGlassCard>
      <style>{`
        @keyframes terrace-music-bounce {
          0%, 100% {
            height: 6px;
          }
          50% {
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}

export default LiquidSignalCard;
