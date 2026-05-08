// Resolves the role used by the (app) sidebar layout from the Clerk session
// + users.type lookup. Server-only — must not be imported into client code.
//
// users.type is one of "creator" | "brand_member" | "admin"; the sidebar
// only distinguishes creator vs brand surfaces, so brand_member + admin
// both fall through to "brand".

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export type AppRole = "creator" | "brand";

export async function resolveAppRole(): Promise<AppRole> {
  if (process.env.E2E_BYPASS_AUTH === "true") return "creator";

  const { userId } = await auth();
  if (!userId) return "creator";

  try {
    const [row] = await db.select({ type: users.type }).from(users).where(eq(users.clerkId, userId)).limit(1);
    return row?.type === "brand_member" || row?.type === "admin" ? "brand" : "creator";
  } catch {
    // DB not reachable yet (no DATABASE_URL, fresh clone). Fall back to
    // creator so the layout still renders in dev — pages downstream will
    // surface the real error if they try to query.
    return "creator";
  }
}
