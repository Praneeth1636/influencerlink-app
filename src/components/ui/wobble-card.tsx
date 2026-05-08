"use client";

import type React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type WobbleCardProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
};

export function WobbleCard({ children, className, containerClassName }: WobbleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)");

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 9;
    const rotateX = (0.5 - y / rect.height) * 9;

    setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.012)`);
  }

  function resetTransform() {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)");
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 text-white shadow-[0_24px_64px_rgba(17,24,39,0.16)] transition-transform duration-300 ease-out",
        containerClassName
      )}
      onPointerLeave={resetTransform}
      onPointerMove={handlePointerMove}
      ref={cardRef}
      style={{ transform }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(140,201,232,0.22),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(216,107,61,0.22),transparent_30%)] opacity-70 transition duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-14 -bottom-16 h-48 w-48 rounded-full border border-white/10 bg-white/[0.05]" />
      <div className="pointer-events-none absolute right-8 bottom-8 h-20 w-20 rounded-3xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 group-hover:rotate-6" />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
