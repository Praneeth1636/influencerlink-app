"use client";

// Client-side wrapper for (app)/* routes. The navigation is a floating dock
// (left on desktop, bottom on mobile) instead of a docked sidebar, so content
// owns the full canvas. Server (app)/layout.tsx resolves role on the server
// and hands it down so we don't need a context fetch.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";
import { MessageCircle } from "lucide-react";
import { AppDock } from "@/components/layouts/app-dock";
import { AppRoleSwitcher } from "@/components/layouts/app-role-switcher";
import type { AppRole } from "@/components/layouts/app-sidebar";

const AppRoleContext = createContext<AppRole>("creator");

export function useAppRole() {
  return useContext(AppRoleContext);
}

export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppRoleContext.Provider value={role}>
      <div className="relative min-h-screen w-full bg-white text-[#37352f]">
        <AppDock role={role} />

        {/* Mobile top bar: wordmark + messages. Primary nav lives in the dock. */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#f1f1ef] bg-white/90 px-4 backdrop-blur-xl md:hidden">
          <Link href="/feed" className="flex items-center gap-2.5" aria-label="Terrace">
            <span className="logoMark miniLogo" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="flex items-baseline text-lg font-semibold tracking-[-0.04em]">
              Terrace<span className="text-[#e08550]">.</span>
            </span>
          </Link>
          <Link
            aria-label="Messages"
            className="ml-auto grid h-9 w-9 place-items-center rounded-full text-[#37352f] transition hover:bg-[#f7f7f5]"
            href="/messages"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
        </header>

        <main className="min-w-0 pb-28 md:pb-0 md:pl-24">
          <div className="creatorlink-fade-in" key={pathname}>
            {children}
          </div>
        </main>

        {/* Workspace switch floats quietly in the corner on desktop. */}
        <div className="fixed bottom-5 left-5 z-40 hidden w-[200px] md:block">
          <AppRoleSwitcher role={role} />
        </div>
      </div>
    </AppRoleContext.Provider>
  );
}
