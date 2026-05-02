"use client";

// Client-side wrapper for (app)/* routes. Owns the SidebarProvider context,
// the role-aware AppSidebar, and the small mobile header that exposes the
// sidebar trigger. Server (app)/layout.tsx resolves role on the server and
// hands it down so we don't need a context fetch.

import { Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { clerkAppearance } from "@/components/auth/clerk-appearance";
import { AppSidebar, type AppRole } from "@/components/layouts/app-sidebar";

export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-background flex min-h-screen w-full">
        <AppSidebar role={role} />
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 flex h-14 items-center gap-3 border-b px-4 backdrop-blur lg:hidden">
            <SidebarTrigger />
            <Sparkles className="text-primary h-5 w-5" />
            <span className="font-serif text-base font-bold tracking-tight">InfluencerLink</span>
            <div className="ml-auto">
              <UserButton appearance={clerkAppearance} />
            </div>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
