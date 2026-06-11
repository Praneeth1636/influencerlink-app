"use client";

// Vercel-style application chrome: a slim header row (wordmark, workspace,
// actions) over a sticky tab row with a sliding active underline. No sidebar.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { AppRoleSwitcher } from "@/components/layouts/app-role-switcher";
import type { AppRole } from "@/components/layouts/app-sidebar";
import { cn } from "@/lib/utils";

function tabsFor(role: AppRole) {
  return [
    { title: "Feed", url: "/feed" },
    { title: "Gigs", url: "/jobs" },
    { title: "Ranks", url: "/ranks" },
    { title: "Search", url: "/search" },
    { title: "Messages", url: "/messages" },
    { title: "Profile", url: role === "brand" ? "/dashboard" : "/creator" },
    { title: "Settings", url: "/settings" }
  ];
}

export function AppTopNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const tabs = tabsFor(role);
  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e9e7] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-13 max-w-[1280px] items-center gap-3 px-4 sm:px-6">
        <Link href="/feed" className="flex shrink-0 items-center gap-2.5" aria-label="Terrace">
          <span className="logoMark miniLogo" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="hidden items-baseline text-[17px] font-semibold tracking-[-0.04em] sm:flex">
            Terrace<span className="text-[#e08550]">.</span>
          </span>
        </Link>
        <span aria-hidden className="text-lg font-light text-[#e9e9e7]">
          /
        </span>
        <div className="min-w-0">
          <AppRoleSwitcher role={role} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <Link
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-md text-[#787774] transition hover:bg-[#f7f7f5] hover:text-[#37352f]"
            href="/notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Link>
          <Link
            aria-label="Messages"
            className="grid h-9 w-9 place-items-center rounded-md text-[#787774] transition hover:bg-[#f7f7f5] hover:text-[#37352f]"
            href="/messages"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
          </Link>
          <Link
            aria-label="Your profile"
            className="ml-1.5 grid h-8 w-8 place-items-center rounded-full bg-[#fdf3ec] text-[10px] font-bold text-[#e08550] ring-1 ring-[#f3d5c4] transition hover:ring-[#e7b598]"
            href={role === "brand" ? "/dashboard" : "/creator"}
          >
            SR
          </Link>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1280px] items-center overflow-x-auto px-2 sm:px-4 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const active = isActive(tab.url);
          return (
            <Link
              className={cn(
                "group relative shrink-0 px-1 pb-2.5",
                active ? "text-[#1d1d1f]" : "text-[#787774] hover:text-[#1d1d1f]"
              )}
              href={tab.url}
              key={tab.url}
            >
              <span className="rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors duration-150 group-hover:bg-[#f7f7f5]">
                {tab.title}
              </span>
              {active && (
                <motion.span
                  className="absolute inset-x-1 bottom-0 h-[2px] bg-[#1d1d1f]"
                  layoutId="topnav-underline"
                  transition={{ type: "spring", stiffness: 480, damping: 38 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
