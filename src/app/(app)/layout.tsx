// Server layout for the (app) route group. Resolves the user's role from
// Clerk + users.type, then hands it to the client AppShell which owns the
// SidebarProvider context. Background gradients move into AppShell so every
// (app) page gets them for free.

import { AppShell } from "@/components/layouts/app-shell";
import { resolveAppRole } from "@/lib/auth/role";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const role = await resolveAppRole();
  return <AppShell role={role}>{children}</AppShell>;
}
