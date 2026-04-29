import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/clerk-appearance";

const NAV_LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/search", label: "Search" },
  { href: "/messages", label: "Messages" },
  { href: "/notifications", label: "Alerts" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/creator", label: "Creator" }
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(216,90,48,0.16),transparent_28%),radial-gradient(circle_at_90%_8%,rgba(168,85,247,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_80%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-5 py-4">
          <Link
            className="logoMark miniLogo shrink-0 bg-white/5 ring-1 ring-white/10"
            href="/feed"
            aria-label="InfluencerLink"
          >
            <span />
            <span />
            <span />
          </Link>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">InfluencerLink</p>
            <p className="hidden text-sm text-white/60 lg:block">Creator marketplace OS</p>
          </div>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                className="rounded-xl px-3 py-2 text-sm font-bold text-white/62 transition hover:bg-white/[0.06] hover:text-white"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <UserButton appearance={clerkAppearance} />
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}
