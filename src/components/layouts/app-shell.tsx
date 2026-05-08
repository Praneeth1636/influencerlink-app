"use client";

// Client-side wrapper for (app)/* routes. Owns the SidebarProvider context,
// the role-aware AppSidebar, and the small mobile header that exposes the
// sidebar trigger. Server (app)/layout.tsx resolves role on the server and
// hands it down so we don't need a context fetch.

import { Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { clerkAppearance } from "@/components/auth/clerk-appearance";
import { AppSidebar, type AppRole } from "@/components/layouts/app-sidebar";

export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-background relative flex min-h-screen w-full">
        {/* Shared product atmosphere: warm graphite, not a per-page poster effect. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_-10%,rgba(216,90,48,0.08),transparent_34rem),radial-gradient(circle_at_82%_0%,rgba(120,94,84,0.08),transparent_28rem)]"
        />
        <AppSidebar role={role} />
        <main className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="border-border bg-background/88 flex h-14 items-center gap-3 border-b px-4 backdrop-blur lg:hidden">
            <SidebarTrigger />
            <span className="logoMark miniLogo shrink-0" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="text-base font-black tracking-tight">Terrace</span>
            <Search className="text-muted-foreground ml-auto h-4 w-4" />
            <div>
              <UserButton appearance={clerkAppearance} />
            </div>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
