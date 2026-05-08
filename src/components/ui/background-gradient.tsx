"use client";

import { cn } from "@/lib/utils";

export function BackgroundGradient({
  children,
  className,
  containerClassName
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn("creatorlink-gradient-border relative rounded-[30px] p-px", containerClassName)}>
      <div className={cn("relative h-full rounded-[29px]", className)}>{children}</div>
    </div>
  );
}
