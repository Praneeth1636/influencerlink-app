// Resolves the role used by the (app) sidebar layout from the Clerk session
// + users.type lookup. Server-only — must not be imported into client code.
//
// users.type is one of "creator" | "brand_member" | "admin"; the sidebar
// only distinguishes creator vs brand surfaces, so brand_member + admin
// both fall through to "brand".

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { isLocalDemoRequest } from "@/lib/auth/local-demo";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type AppRole = "creator" | "brand";

export const APP_ROLE_COOKIE = "terrace_app_role";

function parseAppRole(value: string | undefined): AppRole | null {
  if (value === "creator" || value === "brand") return value;
  return null;
}

export async function getAppRolePreference(): Promise<AppRole | null> {
  const cookieStore = await cookies();
  return parseAppRole(cookieStore.get(APP_ROLE_COOKIE)?.value);
}

export async function resolveAppRole(): Promise<AppRole> {
  const preferredRole = await getAppRolePreference();
  const requestHeaders = await headers();

  if (process.env.E2E_BYPASS_AUTH === "true") return preferredRole ?? "creator";
  if (isLocalDemoRequest(requestHeaders)) return preferredRole ?? "creator";

  const { userId } = await auth();
  if (!userId) return preferredRole ?? "creator";

  try {
    const [row] = await db.select({ type: users.type }).from(users).where(eq(users.clerkId, userId)).limit(1);
    const canUseBrandWorkspace = row?.type === "brand_member" || row?.type === "admin";

    if (preferredRole === "brand" && canUseBrandWorkspace) return "brand";
    if (preferredRole === "creator") return "creator";

    return canUseBrandWorkspace ? "brand" : "creator";
  } catch {
    // DB not reachable yet (no DATABASE_URL, fresh clone). Fall back to
    // creator so the layout still renders in dev — pages downstream will
    // surface the real error if they try to query.
    return preferredRole ?? "creator";
  }
}
