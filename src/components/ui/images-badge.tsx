"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImagesBadge({
  text,
  images,
  folderSize = { width: 48, height: 36 },
  teaserImageSize = { width: 40, height: 28 },
  hoverImageSize = { width: 140, height: 108 },
  hoverTranslateY = -110,
  hoverSpread = 50,
  className
}: {
  text: string;
  images: string[];
  folderSize?: { width: number; height: number };
  teaserImageSize?: { width: number; height: number };
  hoverImageSize?: { width: number; height: number };
  hoverTranslateY?: number;
  hoverSpread?: number;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={cn("group relative inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white backdrop-blur", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      type="button"
    >
      <span className="relative" style={{ width: folderSize.width, height: folderSize.height }}>
        {images.slice(0, 3).map((image, index) => (
          <img
            alt=""
            className="absolute rounded-md border border-white/20 object-cover shadow-lg transition-all duration-300"
            key={image}
            src={image}
            style={{
              width: hovered ? hoverImageSize.width : teaserImageSize.width,
              height: hovered ? hoverImageSize.height : teaserImageSize.height,
              left: hovered ? index * hoverSpread - hoverSpread : index * 6,
              top: hovered ? hoverTranslateY : index * 4,
              transform: hovered ? `rotate(${(index - 1) * 7}deg)` : `rotate(${(index - 1) * 3}deg)`,
              zIndex: 10 + index
            }}
          />
        ))}
      </span>
      {text}
    </button>
  );
}
