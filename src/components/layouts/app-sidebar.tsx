"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Home,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Trophy,
  UserRound
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";
import { AppProfileDropdown } from "@/components/layouts/app-profile-dropdown";
import { AppRoleSwitcher } from "@/components/layouts/app-role-switcher";

export type AppRole = "creator" | "brand";

const CREATOR_NAV = [
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Gigs", url: "/jobs", icon: BriefcaseBusiness },
  { title: "Ranks", url: "/ranks", icon: Trophy },
  { title: "Search", url: "/search", icon: Search },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/creator", icon: UserRound },
  { title: "Settings", url: "/settings", icon: Settings }
];

const BRAND_NAV = [
  { title: "Feed", url: "/feed", icon: Home },
  { title: "Gigs", url: "/jobs", icon: BriefcaseBusiness },
  { title: "Search", url: "/search", icon: Search },
  { title: "Ranks", url: "/ranks", icon: Trophy },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/dashboard", icon: UserRound },
  { title: "Settings", url: "/settings", icon: Settings }
];

export function AppSidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const navItems = role === "creator" ? CREATOR_NAV : BRAND_NAV;

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="border-transparent bg-transparent p-3 text-[#37352f] [&_[data-sidebar=sidebar]]:border-[#dedfe3] [&_[data-sidebar=sidebar]]:bg-[#fbfbfc] [&_[data-sidebar=sidebar]]:text-[#37352f] [&_[data-sidebar=sidebar]]:shadow-[0_18px_48px_rgba(17,24,39,0.055)]"
    >
      <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link href="/feed" className="flex min-w-0 items-center gap-3" aria-label="Terrace">
          <span className="logoMark miniLogo" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="flex items-baseline text-xl font-semibold tracking-[-0.04em] text-[#37352f] transition duration-200 group-data-[collapsible=icon]:hidden">
            Terrace<span className="text-[#D86B3D]">.</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <SidebarMenu className="gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const separated = item.title === "Profile";
            return (
              <SidebarMenuItem
                className={
                  separated ? "mt-3 border-t border-[#e6e8ec] pt-3 group-data-[collapsible=icon]:border-0" : ""
                }
                key={item.url}
              >
                <SidebarMenuButton
                  asChild
                  className="group/nav h-11 rounded-[14px] px-2.5 text-[15px] text-[#667085] transition duration-200 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-[16px] group-data-[collapsible=icon]:p-0 hover:bg-[#f2f5f8] hover:text-[#1d1d1f] data-[active=true]:bg-[#1d1d1f] data-[active=true]:font-semibold data-[active=true]:text-[#fbfbfc]"
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#667085] transition duration-200 group-hover/nav:text-[#1d1d1f] group-data-[active=true]/nav:bg-[#fff3ec] group-data-[active=true]/nav:text-[#D86B3D] group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                      <Icon className="h-[18px] w-[18px] stroke-[2.1] transition duration-200 group-hover/nav:scale-105" />
                    </span>
                    <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-3 border-t border-[#e6e8ec] p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <AppRoleSwitcher role={role} />
        </div>
        <section className="rounded-[18px] border border-[#dedfe3] bg-white p-4 shadow-[0_8px_24px_rgba(17,24,39,0.035)] transition duration-200 group-data-[collapsible=icon]:hidden hover:border-[#dceff8] [@media(max-height:820px)]:hidden">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl border border-[#f4d8c8] bg-[#fff3ec] text-[#bf5a30]">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <h2 className="text-sm font-semibold text-[#37352f]">AI Match</h2>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#787774]">
            {role === "brand"
              ? "Find creators by audience, growth, and fit."
              : "Gigs matched to your niche, refreshed weekly."}
          </p>
          <Link
            className="mt-3 inline-flex text-xs font-semibold text-[#37352f] transition-colors hover:text-[#D86B3D]"
            href={role === "brand" ? "/search" : "/jobs"}
          >
            {role === "brand" ? "Search creators" : "See gigs"}
          </Link>
        </section>
        <AppProfileDropdown role={role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
