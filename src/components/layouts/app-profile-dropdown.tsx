"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { BadgeCheck, CreditCard, FileText, LogOut, Search, Sparkles, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AppRoleSwitcher } from "@/components/layouts/app-role-switcher";
import { cn } from "@/lib/utils";

type AppProfileRole = "creator" | "brand";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon: React.ReactNode;
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "Terrace";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppProfileDropdown({ role, className }: { role: AppProfileRole; className?: string }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const email = user?.primaryEmailAddress?.emailAddress ?? "you@terrace.app";
  const name = user?.fullName ?? user?.username ?? email.split("@")[0] ?? "Terrace user";
  const initials = getInitials(name, email);
  const profileHref = role === "creator" ? "/creator" : "/dashboard";
  const workspaceLabel = role === "creator" ? "Creator" : "Brand";

  const menuItems: MenuItem[] = [
    {
      label: "Profile",
      href: profileHref,
      icon: <User className="h-4 w-4" />
    },
    {
      label: "Workspace",
      value: workspaceLabel,
      href: "/feed",
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      label: "Search",
      href: "/search",
      icon: <Search className="h-4 w-4" />
    },
    {
      label: "Billing",
      value: "Free",
      href: "/settings/billing",
      icon: <CreditCard className="h-4 w-4" />
    },
    {
      label: "About Terrace",
      href: "/about",
      icon: <FileText className="h-4 w-4" />
    }
  ];

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu>
        <div className="group relative">
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-3 rounded-2xl border border-[#e6e8ec] bg-white p-3 text-left shadow-[0_10px_26px_rgba(17,24,39,0.035)] transition duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:p-0 hover:-translate-y-0.5 hover:bg-[#f7f9fb] focus-visible:ring-2 focus-visible:ring-[#D86B3D]/30 focus-visible:outline-none"
              type="button"
            >
              <Avatar className="h-10 w-10 border border-[#e9e9e7] bg-white">
                <AvatarImage src={user?.imageUrl} alt={name} />
                <AvatarFallback className="bg-white text-xs font-semibold text-[#bf5a30]">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <div className="truncate text-sm font-semibold text-[#37352f]">
                  {isLoaded ? name : "Loading account"}
                </div>
                <div className="truncate text-xs text-[#787774]">{email}</div>
              </div>
              <div className="rounded-md border border-[#f0e3da] bg-[#faf0ea] px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#bf5a30] uppercase group-data-[collapsible=icon]:hidden">
                {workspaceLabel}
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 rounded-2xl border border-[#e6e8ec] bg-white p-2 text-[#37352f] shadow-[0_18px_54px_rgba(15,15,15,0.12)]"
            side="right"
            sideOffset={14}
          >
            <div className="mb-1 flex items-center gap-3 rounded-md bg-white p-3">
              <Avatar className="h-11 w-11 border border-[#e9e9e7] bg-white">
                <AvatarImage src={user?.imageUrl} alt={name} />
                <AvatarFallback className="bg-white text-xs font-bold text-[#bf5a30]">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#37352f]">{name}</div>
                <div className="truncate text-xs text-[#787774]">{email}</div>
              </div>
              <BadgeCheck className="h-4 w-4 text-[#D86B3D]" />
            </div>

            <div className="mb-2 px-1">
              <AppRoleSwitcher role={role} compact />
            </div>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <DropdownMenuItem asChild key={item.label}>
                  <Link
                    className="group flex cursor-pointer items-center rounded-xl border border-transparent p-3 transition-colors duration-150 hover:bg-[#f7f9fb]"
                    href={item.href}
                  >
                    <div className="flex flex-1 items-center gap-2 text-[#787774] transition-colors group-hover:text-[#37352f]">
                      {item.icon}
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    </div>
                    {item.value ? (
                      <span className="rounded-md border border-[#d3e9f5] bg-[#eaf4fb] px-2 py-1 text-xs font-semibold text-[#3a7ca5]">
                        {item.value}
                      </span>
                    ) : null}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-3 bg-[#f1f1ef]" />

            <DropdownMenuItem asChild>
              <button
                className="group flex w-full cursor-pointer items-center gap-3 rounded-md border border-[#e9e9e7] bg-white p-3 text-sm font-medium text-[#bf5a30] transition-colors duration-150 hover:bg-[#f7f7f5]"
                onClick={() => {
                  // Land on the public landing page after sign-out, not /login —
                  // /login does an auth() check on the server and the stale
                  // Clerk session cookie can briefly still resolve to a userId,
                  // bouncing the user back to /feed before sign-out fully clears.
                  void signOut({ redirectUrl: "/" });
                }}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}
