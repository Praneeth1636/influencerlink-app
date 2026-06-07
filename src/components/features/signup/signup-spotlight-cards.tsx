"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeCheck, BarChart3, BriefcaseBusiness, MessageCircle, Search, Sparkles } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TILT_MAX = 6;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;
const GLOW_SPRING = { stiffness: 180, damping: 22 } as const;

type SpotlightItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
};

const SIGNUP_SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    icon: BadgeCheck,
    title: "Verified proof",
    description: "Show real reach, engagement, platforms, and past brand work without asking brands to guess.",
    color: "#D86B3D"
  },
  {
    icon: Search,
    title: "Better discovery",
    description: "Brands can search by niche, audience fit, budget, location, and open-to-collab status.",
    color: "#8CC9E8"
  },
  {
    icon: MessageCircle,
    title: "Warm DMs",
    description: "Outreach starts with useful context: campaign goals, match reasons, and creator availability.",
    color: "#F0A579"
  },
  {
    icon: BriefcaseBusiness,
    title: "Briefs & jobs",
    description: "Creators can apply to public briefs while brands manage applicants and shortlists.",
    color: "#7EB9D6"
  },
  {
    icon: BarChart3,
    title: "Creator analytics",
    description: "Turn every campaign and content drop into portfolio proof that compounds over time.",
    color: "#C98E72"
  },
  {
    icon: Sparkles,
    title: "AI matching",
    description: "Paste the campaign idea and get creator matches with plain-English reasons.",
    color: "#D86B3D"
  }
];

export function SignupSpotlightCards() {
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  return (
    <section className="creatorlink-animate-in creatorlink-delay-2 relative z-10 mx-auto w-full max-w-6xl overflow-hidden rounded-[30px] border border-[#e9e9e7] bg-white/82 px-5 pt-7 pb-6 shadow-[0_24px_64px_rgba(17,24,39,0.07)] backdrop-blur-xl sm:px-7 sm:pt-8 sm:pb-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(216,90,48,0.09),transparent_28%),radial-gradient(circle_at_78%_28%,rgba(140,201,232,0.16),transparent_30%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(17,19,24,0.055) 1px, transparent 1px)",
          backgroundSize: "22px 22px"
        }}
      />

      <div className="relative mb-6">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#D86B3D] uppercase">Why creators and brands join</p>
        <h2 className="mt-2 max-w-2xl text-[clamp(30px,4vw,48px)] leading-[1] font-semibold tracking-[-0.06em]">
          Familiar like a social network. Built for deals.
        </h2>
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SIGNUP_SPOTLIGHT_ITEMS.map((item) => (
          <SpotlightCard
            dimmed={hoveredTitle !== null && hoveredTitle !== item.title}
            item={item}
            key={item.title}
            onHoverEnd={() => setHoveredTitle(null)}
            onHoverStart={() => setHoveredTitle(item.title)}
          />
        ))}
      </div>
    </section>
  );
}

function SpotlightCard({
  item,
  dimmed,
  onHoverStart,
  onHoverEnd
}: {
  item: SpotlightItem;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const Icon = item.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);
  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const element = cardRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    normX.set((event.clientX - rect.left) / rect.width);
    normY.set((event.clientY - rect.top) / rect.height);
  }

  function handleMouseEnter() {
    glowOpacity.set(1);
    onHoverStart();
  }

  function handleMouseLeave() {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd();
  }

  return (
    <motion.div
      animate={{ opacity: dimmed ? 0.54 : 1, scale: dimmed ? 0.985 : 1 }}
      className={cn(
        "group relative flex min-h-[170px] flex-col gap-5 overflow-hidden rounded-2xl border p-5",
        "border-[#ece8e3] bg-white/78 shadow-[0_2px_8px_rgba(17,24,39,0.04)]",
        "transition-[border-color] duration-300 hover:border-[#dcd4cc]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 20% 20%, ${item.color}14, transparent 65%)` }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${item.color}2e, transparent 65%)`,
          opacity: glowOpacity
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[55%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
      />

      <div
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${item.color}18`, boxShadow: `inset 0 0 0 1px ${item.color}30` }}
      >
        <Icon size={17} strokeWidth={1.9} style={{ color: item.color }} />
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        <h3 className="text-[15px] font-semibold tracking-tight text-[#37352f]">{item.title}</h3>
        <p className="text-[13px] leading-relaxed text-[#787774]">{item.description}</p>
      </div>

      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(to right, ${item.color}80, transparent)` }}
      />
    </motion.div>
  );
}

export default SignupSpotlightCards;
