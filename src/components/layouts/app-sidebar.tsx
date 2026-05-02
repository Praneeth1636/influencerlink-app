"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, Bell, Inbox, LayoutDashboard, PlusCircle, Search, Sparkles, Users } from "lucide-react";
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
  { title: "Dashboard", url: "/creator", icon: LayoutDashboard },
  { title: "Discover", url: "/search", icon: Search },
  { title: "Applications", url: "/jobs/saved", icon: Inbox },
  { title: "Messages", url: "/messages", icon: Inbox },
  { title: "Notifications", url: "/notifications", icon: Bell }
];

const BRAND_NAV = [
  { title: "Dashboard", url: "/feed", icon: LayoutDashboard },
  { title: "Discover Creators", url: "/search", icon: Search },
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
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href={role === "creator" ? "/creator" : "/feed"} className="flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" />
          <span className="font-serif text-xl font-bold tracking-tight">InfluencerLink</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
