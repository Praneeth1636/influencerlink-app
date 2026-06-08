"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { LayoutGrid, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/jobs", label: "Briefs" },
  { href: "/search", label: "Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

function initialsFrom(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "Terrace";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MarketingNav() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const dashboardHref = user?.publicMetadata?.brandId ? "/dashboard" : "/feed";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.fullName ?? user?.username ?? email.split("@")[0] ?? "";
  const initials = initialsFrom(name, email);

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between gap-4 rounded-full border border-[#e6e8ec] bg-[#fbfcfd]/92 px-3 shadow-[0_14px_42px_rgba(17,24,39,0.09)] backdrop-blur-xl sm:px-4 lg:px-5">
        <Link href="/" className="flex items-center gap-3" aria-label="Terrace">
          <span className="logoMark miniLogo" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="flex items-baseline text-lg font-semibold tracking-[-0.04em] text-[#37352f]">
            Terrace<span className="text-[#D86B3D]">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#787774] md:flex lg:gap-9">
          {navItems.map((item) => (
            <Link className="transition hover:text-[#37352f]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isSignedIn ? (
            <>
              <Button
                asChild
                className="h-9 rounded-full bg-[#37352f] px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(17,24,39,0.12)] hover:bg-[#1d222b]"
              >
                <Link href={dashboardHref}>Open app</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open account menu"
                    className="rounded-full border border-[#e9e9e7] bg-white p-0.5 transition hover:border-[#dce3ea] focus-visible:ring-2 focus-visible:ring-[#e58a5f]/40 focus-visible:outline-none"
                    type="button"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.imageUrl} alt={name || "Account"} />
                      <AvatarFallback className="bg-[#fdf3ec] text-xs font-semibold text-[#bf5a30]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-72 rounded-2xl border border-[#e9e9e7] bg-white p-2 text-[#37352f] shadow-[0_24px_70px_rgba(20,20,20,0.12)]"
                >
                  <div className="mb-1 flex items-center gap-3 rounded-xl p-3">
                    <Avatar className="h-11 w-11 border border-[#e9e9e7]">
                      <AvatarImage src={user?.imageUrl} alt={name || "Account"} />
                      <AvatarFallback className="bg-[#fdf3ec] text-sm font-bold text-[#bf5a30]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[#37352f]">{name || "Terrace member"}</div>
                      <div className="truncate text-xs text-[#787774]">{email}</div>
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href={dashboardHref}
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-semibold text-[#787774] transition hover:bg-[#f7f7f7] hover:text-[#37352f]"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Open app
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/creator"
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-semibold text-[#787774] transition hover:bg-[#f7f7f7] hover:text-[#37352f]"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-semibold text-[#787774] transition hover:bg-[#f7f7f7] hover:text-[#37352f]"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-2 bg-[#e9e9e7]" />

                  <DropdownMenuItem asChild>
                    <button
                      type="button"
                      onClick={() => {
                        void signOut({ redirectUrl: "/" });
                      }}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-sm font-semibold text-[#bf5a30] transition hover:bg-[#fdf3ec]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-9 items-center justify-center rounded-full px-5 text-sm font-semibold text-[#37352f] transition hover:bg-[#f0f4f8] sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-full bg-[#37352f] px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(17,24,39,0.12)] transition hover:-translate-y-0.5 hover:bg-[#1d222b]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
