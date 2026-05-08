import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/creator(.*)",
  "/feed(.*)",
  "/discover(.*)",
  "/workspace(.*)",
  "/dashboard(.*)",
  "/jobs(.*)/applicants(.*)",
  "/jobs/new",
  "/jobs/saved",
  "/messages(.*)",
  "/notifications(.*)",
  "/profile(.*)",
  "/search(.*)",
  "/settings(.*)",
  "/onboarding(.*)"
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

// Direct neon-http query — Drizzle would also work but this avoids importing
// the full schema at the edge. We only need a single column.
async function isOnboardedInDb(clerkId: string): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  const sql = neon(url);
  const rows = (await sql`select onboarded_at from users where clerk_id = ${clerkId} limit 1`) as Array<{
    onboarded_at: string | null;
  }>;
  return Boolean(rows[0]?.onboarded_at);
}

const authMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  // Onboarding gate. The fast path is the JWT claim — it requires the Clerk
  // session token to surface public_metadata via the
  // {"metadata":"{{user.public_metadata}}"} template (see docs/setup.md).
  // If the claim is missing (template not configured, or session JWT is stale
  // after a metadata write), we fall back to a direct DB check so users with
  // a finished onboarding row don't get bounced into a redirect loop.
  if (sessionClaims?.metadata?.onboarded === true) return;
  if (isOnboardingRoute(req)) return;

  if (await isOnboardedInDb(userId)) return;

  return NextResponse.redirect(new URL("/onboarding", req.url));
});

export default process.env.E2E_BYPASS_AUTH === "true" ? () => NextResponse.next() : authMiddleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
