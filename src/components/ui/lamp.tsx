"use client";

import type React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type LampContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function LampContainer({ children, className }: LampContainerProps) {
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <motion.div
          className="h-36 w-[34rem] bg-[radial-gradient(ellipse_at_center,rgba(140,201,232,0.42),rgba(246,176,132,0.22)_36%,transparent_68%)] blur-2xl"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        />
      </div>
      <motion.div
        className="pointer-events-none absolute top-8 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#8CC9E8]/70 to-transparent"
        initial={{ opacity: 0, width: "20%" }}
        animate={{ opacity: 1, width: "75%" }}
        transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
      />
      <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
