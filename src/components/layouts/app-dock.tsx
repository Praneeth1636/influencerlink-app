"use client";

// Floating dock navigation: a detached glass pill on the left edge (desktop)
// and bottom (mobile). Replaces the docked sidebar. Active state is a warm
// tint that physically slides between icons (shared layout animation).

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Home,
  MessageCircle,
  Search,
  Settings,
  Trophy,
  UserRound,
  type LucideIcon
} from "lucide-react";
import { motion } from "motion/react";
import type { AppRole } from "@/components/layouts/app-sidebar";
import { cn } from "@/lib/utils";

type DockItem = { title: string; url: string; icon: LucideIcon };

function navFor(role: AppRole): DockItem[] {
  return [
    { title: "Feed", url: "/feed", icon: Home },
    { title: "Gigs", url: "/jobs", icon: BriefcaseBusiness },
    { title: "Ranks", url: "/ranks", icon: Trophy },
    { title: "Search", url: "/search", icon: Search },
    { title: "Messages", url: "/messages", icon: MessageCircle },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: role === "brand" ? "/dashboard" : "/creator", icon: UserRound },
    { title: "Settings", url: "/settings", icon: Settings }
  ];
}

function DockLink({
  item,
  active,
  layoutId,
  labelSide
}: {
  item: DockItem;
  active: boolean;
  layoutId: string;
  labelSide: "right" | "top";
}) {
  const Icon = item.icon;

  return (
    <motion.span whileHover={{ scale: 1.16 }} whileTap={{ scale: 0.92 }}>
      <Link
        aria-current={active ? "page" : undefined}
        aria-label={item.title}
        className="group relative grid h-11 w-11 place-items-center rounded-full"
        href={item.url}
      >
        {active && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#fff3ec]"
            layoutId={layoutId}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
          />
        )}
        <Icon
          className={cn(
            "relative z-10 h-[20px] w-[20px] stroke-[2.05] transition-colors duration-200",
            active ? "text-[#e08550]" : "text-[#787774] group-hover:text-[#37352f]"
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute z-20 rounded-full bg-[#37352f] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100",
            labelSide === "right" ? "left-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]"
          )}
        >
          {item.title}
        </span>
      </Link>
    </motion.span>
  );
}

export function AppDock({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = navFor(role);
  const isActive = (url: string) => pathname === url || (url !== "/feed" && pathname.startsWith(`${url}/`));

  return (
    <>
      {/* Desktop: vertical dock floating on the left edge. */}
      <motion.nav
        animate={{ opacity: 1, x: 0 }}
        aria-label="Primary"
        className="fixed top-1/2 left-4 z-50 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-[#f1f1ef] bg-white/85 px-1.5 py-4 shadow-[0_18px_50px_rgba(17,24,39,0.13)] backdrop-blur-xl md:flex"
        initial={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link aria-label="Terrace home" className="mb-2 grid h-10 w-10 place-items-center" href="/feed">
          <span className="logoMark miniLogo" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </Link>
        {items.map((item) => (
          <DockLink
            active={isActive(item.url)}
            item={item}
            key={item.url}
            labelSide="right"
            layoutId="dock-active-desktop"
          />
        ))}
      </motion.nav>

      {/* Mobile: horizontal dock floating above the bottom edge. */}
      <motion.nav
        animate={{ opacity: 1, y: 0 }}
        aria-label="Primary"
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-[#f1f1ef] bg-white/90 px-2 py-1.5 shadow-[0_18px_50px_rgba(17,24,39,0.16)] backdrop-blur-xl md:hidden"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {items
          .filter((item) => ["Feed", "Gigs", "Search", "Notifications", "Profile"].includes(item.title))
          .map((item) => (
            <DockLink
              active={isActive(item.url)}
              item={item}
              key={item.url}
              labelSide="top"
              layoutId="dock-active-mobile"
            />
          ))}
      </motion.nav>
    </>
  );
}
