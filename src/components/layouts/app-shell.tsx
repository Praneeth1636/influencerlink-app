"use client";

// Client-side wrapper for (app)/* routes. Owns the SidebarProvider context,
// the role-aware AppSidebar, and the small mobile header that exposes the
// sidebar trigger. Server (app)/layout.tsx resolves role on the server and
// hands it down so we don't need a context fetch.

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { clerkAppearance } from "@/components/auth/clerk-appearance";
import { AppSidebar, type AppRole } from "@/components/layouts/app-sidebar";

export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <SidebarProvider>
      <div className="terrace-app-bg relative flex min-h-screen w-full">
        {/* Shared product atmosphere: warm graphite, not a per-page poster effect. */}
        <div aria-hidden className="terrace-app-bg pointer-events-none fixed inset-0 z-0" />
        <AppSidebar role={role} />
        <main className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="terrace-topbar flex h-14 items-center gap-3 border-b px-4 text-[#37352f] lg:hidden">
            <SidebarTrigger />
            <span className="logoMark miniLogo shrink-0" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="flex items-baseline text-lg font-semibold tracking-[-0.04em]">
              Terrace<span className="text-[#D86B3D]">.</span>
            </span>
            <Search className="ml-auto h-4 w-4 text-[#787774]" />
            <div>
              <UserButton appearance={clerkAppearance} />
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="creatorlink-fade-in" key={pathname}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
