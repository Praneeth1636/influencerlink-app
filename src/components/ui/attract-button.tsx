"use client";

import { Magnet } from "lucide-react";
import { motion, useAnimation } from "motion/react";
import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
}

export interface AttractButtonProps extends ButtonProps {
  attractRadius?: number;
  particleCount?: number;
}

export function AttractButton({
  attractRadius = 42,
  children,
  className,
  particleCount = 10,
  ...props
}: AttractButtonProps) {
  const [isAttracting, setIsAttracting] = React.useState(false);
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const particlesControl = useAnimation();

  React.useEffect(() => {
    setParticles(
      Array.from({ length: particleCount }, (_, index) => {
        const angle = (index / particleCount) * Math.PI * 2;
        const radius = attractRadius + (index % 3) * 12;
        return {
          id: index,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      })
    );
  }, [attractRadius, particleCount]);

  const handleInteractionStart = React.useCallback(() => {
    setIsAttracting(true);
    void particlesControl.start({
      x: 0,
      y: 0,
      transition: {
        damping: 12,
        stiffness: 60,
        type: "spring"
      }
    });
  }, [particlesControl]);

  const handleInteractionEnd = React.useCallback(() => {
    setIsAttracting(false);
    void particlesControl.start((index) => {
      const particle = particles[index as number];
      return {
        x: particle?.x ?? 0,
        y: particle?.y ?? 0,
        transition: {
          damping: 16,
          stiffness: 110,
          type: "spring"
        }
      };
    });
  }, [particles, particlesControl]);

  return (
    <Button
      className={cn(
        "relative isolate touch-none overflow-visible border-[#e7a27c] bg-[#e78a61] text-[#37352f] shadow-[0_14px_32px_rgba(216,107,61,0.2)] transition-all duration-300 hover:bg-[#ee9a74] hover:shadow-[0_18px_42px_rgba(216,107,61,0.25)]",
        className
      )}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchEnd={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      {...props}
    >
      {particles.map((particle, index) => (
        <motion.span
          animate={particlesControl}
          className={cn(
            "pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[#f2b28c] transition-opacity duration-300",
            isAttracting ? "opacity-100" : "opacity-35"
          )}
          custom={index}
          initial={{ x: particle.x, y: particle.y }}
          key={particle.id}
          style={{ left: "50%", top: "50%" }}
        />
      ))}
      <span className="relative z-10 flex w-full items-center justify-center gap-2">
        {children ?? (
          <>
            <Magnet className={cn("h-4 w-4 transition-transform duration-300", isAttracting && "scale-110")} />
            {isAttracting ? "Pulling signal" : "Hover me"}
          </>
        )}
      </span>
    </Button>
  );
}
