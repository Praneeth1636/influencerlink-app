"use client";

// Motion primitives for the marketing landing page: infinite marquee,
// magnetic hover, and a looping typewriter. All respect reduced motion.

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/* ── Infinite marquee ──────────────────────────────────────────────────── */

export function Marquee({
  children,
  className,
  duration = 28
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn("flex flex-wrap gap-x-8 gap-y-3", className)}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white to-transparent" />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        className="flex w-max items-center gap-10 pr-10"
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Magnetic hover: element leans toward the cursor ───────────────────── */

export function Magnetic({
  children,
  className,
  strength = 0.32
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18 });
  const y = useSpring(my, { stiffness: 220, damping: 18 });

  if (prefersReducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn("inline-block", className)}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left - rect.width / 2) * strength);
        my.set((event.clientY - rect.top - rect.height / 2) * strength);
      }}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

/* ── Looping typewriter ────────────────────────────────────────────────── */

export function Typewriter({
  phrases,
  className,
  typeMs = 34,
  deleteMs = 12,
  holdMs = 2100
}: {
  phrases: string[];
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const phrase = phrases[phraseIndex] ?? "";

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    let timer: number;
    if (!deleting && length < phrase.length) {
      timer = window.setTimeout(() => setLength(length + 1), typeMs);
    } else if (!deleting && length === phrase.length) {
      timer = window.setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && length > 0) {
      timer = window.setTimeout(() => setLength(length - 1), deleteMs);
    } else {
      timer = window.setTimeout(() => {
        setDeleting(false);
        setPhraseIndex((phraseIndex + 1) % phrases.length);
      }, 320);
    }
    return () => window.clearTimeout(timer);
  }, [deleting, holdMs, length, phrase.length, phraseIndex, phrases.length, prefersReducedMotion, typeMs, deleteMs]);

  if (prefersReducedMotion) return <span className={className}>{phrases[0]}</span>;

  return (
    <span className={className}>
      {phrase.slice(0, length)}
      <motion.span
        animate={{ opacity: [1, 1, 0, 0] }}
        aria-hidden
        className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] bg-[#ED9568]"
        transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </span>
  );
}
