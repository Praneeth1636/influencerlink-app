"use client";

import type React from "react";
import { cn } from "@/lib/utils";

type TextFlippingBoardProps = {
  text: string;
  className?: string;
  characterClassName?: string;
};

export function TextFlippingBoard({ text, className, characterClassName }: TextFlippingBoardProps) {
  const lines = text.split("\n");
  let characterIndex = 0;

  return (
    <div
      aria-label={text.replace(/\n/g, " ")}
      className={cn(
        "rounded-[26px] border border-white/10 bg-[#37352f] p-4 shadow-[0_24px_70px_rgba(17,24,39,0.18)]",
        className
      )}
    >
      <div aria-hidden className="grid gap-2">
        {lines.map((line, lineIndex) => (
          <div className="flex flex-wrap justify-center gap-1.5" key={`${line}-${lineIndex}`}>
            {[...line].map((character) => {
              const delay = characterIndex * 24;
              characterIndex += 1;

              return (
                <span
                  className={cn(
                    "creatorlink-flip-char grid h-10 min-w-8 place-items-center rounded-lg border border-white/8 bg-white/[0.06] px-2 text-center text-lg font-semibold tracking-[-0.04em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-12 sm:min-w-9 sm:text-xl",
                    character === " " && "min-w-3 border-transparent bg-transparent px-0 shadow-none sm:min-w-4",
                    characterClassName
                  )}
                  key={`${lineIndex}-${characterIndex}-${character}`}
                  style={{ "--flip-delay": `${delay}ms` } as React.CSSProperties}
                >
                  {character === " " ? "\u00A0" : character}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
