"use client";

// Client-side wrapper for (app)/* routes. Vercel-style chrome: a top
// navigation bar with a tab row, no sidebar. Server (app)/layout.tsx
// resolves role on the server and hands it down so we don't need a
// context fetch.

import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";
import { AppTopNav } from "@/components/layouts/app-topnav";
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
        <AppTopNav role={role} />
        <main className="min-w-0">
          <div className="creatorlink-fade-in" key={pathname}>
            {children}
          </div>
        </main>
      </div>
    </AppRoleContext.Provider>
  );
}
