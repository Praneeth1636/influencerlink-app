"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, Bell, Compass, Home, Inbox, LayoutDashboard, PlusCircle, Search, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

export type AppRole = "creator" | "brand";

const CREATOR_NAV = [
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Creator Studio", url: "/creator", icon: LayoutDashboard },
  { title: "Discover", url: "/search", icon: Compass },
  { title: "Applications", url: "/jobs/saved", icon: BarChart },
  { title: "Messages", url: "/messages", icon: Inbox },
  { title: "Notifications", url: "/notifications", icon: Bell }
];

const BRAND_NAV = [
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Brand Studio", url: "/dashboard", icon: LayoutDashboard },
  { title: "Discover", url: "/search", icon: Search },
  { title: "My Briefs", url: "/jobs", icon: BarChart },
  { title: "Post a Brief", url: "/jobs/new", icon: PlusCircle },
  { title: "Applications", url: "/jobs", icon: Users },
  { title: "Messages", url: "/messages", icon: Inbox },
  { title: "Notifications", url: "/notifications", icon: Bell }
];

export function AppSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const navItems = role === "creator" ? CREATOR_NAV : BRAND_NAV;

  return (
    <Sidebar className="border-sidebar-border bg-sidebar/95">
      <SidebarHeader className="border-sidebar-border border-b px-5 py-5">
        <Link href="/feed" className="flex items-center gap-3">
          <span className="logoMark miniLogo shrink-0" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="text-sidebar-foreground text-xl font-black tracking-tight">Terrace</span>
        </Link>
        <div className="border-sidebar-border bg-sidebar-accent/50 mt-4 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-[10px] font-black tracking-[0.18em] uppercase">Unified workspace</p>
          <p className="text-sidebar-foreground/80 mt-1 text-xs font-bold">
            {role === "creator"
              ? "Creator tools, brand briefs, and social proof."
              : "Creator discovery, briefs, and team inbox."}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black tracking-[0.18em] uppercase">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
