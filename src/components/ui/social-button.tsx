"use client";

import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, Camera, Link2, Share2, Send } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareItem {
  icon: LucideIcon;
  label: string;
}

interface SocialButtonProps extends ButtonProps {
  items?: ShareItem[];
  label?: string;
  onShare?: (index: number, item: ShareItem) => void;
}

const defaultShareItems: ShareItem[] = [
  { icon: Share2, label: "Share to social" },
  { icon: Camera, label: "Share to Instagram" },
  { icon: BriefcaseBusiness, label: "Send to brand board" },
  { icon: Link2, label: "Copy link" }
];

export function SocialButton({
  className,
  items = defaultShareItems,
  label = "Share",
  onShare,
  ...props
}: SocialButtonProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  function handleShare(index: number) {
    setActiveIndex(index);
    onShare?.(index, items[index]);
    window.setTimeout(() => setActiveIndex(null), 240);
  }

  return (
    <div className="relative h-8" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      <motion.div animate={{ opacity: isVisible ? 0 : 1 }} transition={{ duration: 0.16, ease: "easeInOut" }}>
        <Button
          className={cn(
            "h-8 min-w-20 rounded-full border-[#e9e9e7] bg-white px-2.5 text-xs font-semibold text-[#5f5f5f] transition-colors duration-200 hover:bg-[#f7f7f7] hover:text-[#37352f]",
            className
          )}
          variant="outline"
          {...props}
        >
          <span className="flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {label}
          </span>
        </Button>
      </motion.div>

      <motion.div
        animate={{ width: isVisible ? items.length * 36 : 0 }}
        className="absolute top-0 left-0 flex h-8 overflow-hidden rounded-full shadow-[0_12px_30px_rgba(17,24,39,0.16)]"
        transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : -14
              }}
              aria-label={item.label}
              className={cn(
                "relative flex h-8 w-9 items-center justify-center overflow-hidden border-r border-white/10 bg-[#37352f] text-white transition-colors duration-200 outline-none last:border-r-0 hover:bg-[#242833]",
                index === 0 && "rounded-l-full",
                index === items.length - 1 && "rounded-r-full"
              )}
              key={item.label}
              onClick={() => handleShare(index)}
              transition={{
                delay: isVisible ? index * 0.035 : 0,
                duration: 0.22,
                ease: [0.23, 1, 0.32, 1]
              }}
              type="button"
            >
              <motion.span
                animate={{ scale: activeIndex === index ? 0.84 : 1 }}
                className="relative z-10"
                transition={{ duration: 0.16, ease: "easeInOut" }}
              >
                <Icon className={cn("h-3.5 w-3.5", index === 1 && "text-[#f2b28c]", index === 3 && "text-[#8cc9e8]")} />
              </motion.span>
              <motion.span
                animate={{ opacity: activeIndex === index ? 0.18 : 0 }}
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeInOut" }}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
