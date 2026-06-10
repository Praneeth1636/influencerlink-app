"use client";

import { ArrowRight, Repeat2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  actionLabel?: string;
  className?: string;
}

export function CardFlip({
  title = "Verified creator proof",
  subtitle = "Flip for the signal",
  description = "Turn campaign wins, audience fit, and content proof into a profile brands can trust.",
  features = ["Verified reach", "Audience fit", "Brand-safe proof", "Fast outreach"],
  actionLabel = "Explore",
  className
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("group relative h-[320px] w-full max-w-[280px] [perspective:2000px]", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 h-full w-full [transform:rotateY(0deg)] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-xs transition-all duration-700 [backface-visibility:hidden] dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-lg",
            "group-hover:shadow-lg dark:group-hover:shadow-xl",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="relative h-full overflow-hidden bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black">
            <div className="absolute inset-0 flex items-start justify-center pt-24">
              <div className="relative flex h-[100px] w-[200px] items-center justify-center">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    className={cn(
                      "absolute h-[50px] w-[50px] rounded-[140px] opacity-0 shadow-[0_0_50px_rgba(216,90,48,0.35)]",
                      "animate-[terrace-card-flip-scale_3s_linear_infinite] group-hover:animate-[terrace-card-flip-scale_2s_linear_infinite]"
                    )}
                    key={index}
                    style={{ animationDelay: `${index * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/90" />
          </div>

          <div className="absolute right-0 bottom-0 left-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <h3 className="text-lg leading-snug font-semibold tracking-tight text-zinc-900 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 dark:text-white">
                  {title}
                </h3>
                <p className="line-clamp-2 text-sm tracking-tight text-zinc-600 transition-all delay-[50ms] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 dark:text-zinc-200">
                  {subtitle}
                </p>
              </div>
              <div className="group/icon relative">
                <div className="absolute inset-[-8px] rounded-lg bg-gradient-to-br from-[#e08550]/20 via-[#e08550]/10 to-transparent transition-opacity duration-300" />
                <Repeat2 className="relative z-10 h-4 w-4 text-[#e08550] transition-transform duration-300 group-hover/icon:scale-110 group-hover/icon:-rotate-12" />
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-0 flex h-full w-full [transform:rotateY(180deg)] flex-col rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-100 to-white p-6 shadow-xs transition-all duration-700 [backface-visibility:hidden] dark:border-zinc-800 dark:from-zinc-900 dark:to-black dark:shadow-lg",
            "group-hover:shadow-lg dark:group-hover:shadow-xl",
            isFlipped ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg leading-snug font-semibold tracking-tight text-zinc-900 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 dark:text-white">
                {title}
              </h3>
              <p className="line-clamp-2 text-sm tracking-tight text-zinc-600 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 dark:text-zinc-400">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-sm text-zinc-700 transition-all duration-500 dark:text-zinc-300"
                  key={feature}
                  style={{
                    opacity: isFlipped ? 1 : 0,
                    transform: isFlipped ? "translateX(0)" : "translateX(-10px)",
                    transitionDelay: `${index * 100 + 200}ms`
                  }}
                >
                  <ArrowRight className="h-3 w-3 text-[#e08550]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <div
              className={cn(
                "group/start -m-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-zinc-100 via-zinc-100 to-zinc-100 p-3 transition-all duration-300 hover:scale-[1.02] hover:cursor-pointer dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-800",
                "hover:from-[#e08550]/10 hover:via-[#e08550]/5 hover:to-transparent dark:hover:from-[#e08550]/20 dark:hover:via-[#e08550]/10 dark:hover:to-transparent"
              )}
            >
              <span className="text-sm font-medium text-zinc-900 transition-colors duration-300 group-hover/start:text-[#e08550] dark:text-white">
                {actionLabel}
              </span>
              <div className="group/icon relative">
                <div className="absolute inset-[-6px] scale-90 rounded-lg bg-gradient-to-br from-[#e08550]/20 via-[#e08550]/10 to-transparent opacity-0 transition-all duration-300 group-hover/start:scale-100 group-hover/start:opacity-100" />
                <ArrowRight className="relative z-10 h-4 w-4 text-[#e08550] transition-all duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes terrace-card-flip-scale {
          0% {
            opacity: 0;
            transform: scale(2);
            box-shadow: 0 0 50px rgba(216, 90, 48, 0.35);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px) scale(1);
            box-shadow: 0 8px 20px rgba(140, 201, 232, 0.32);
          }
          100% {
            opacity: 0;
            transform: translateY(5px) scale(0.1);
            box-shadow: 0 10px 20px rgba(216, 90, 48, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default CardFlip;
