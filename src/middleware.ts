import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

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

function shouldBypassAuthForLocalDemo(req: NextRequest) {
  if (process.env.E2E_BYPASS_AUTH === "true") return true;
  if (process.env.NODE_ENV === "production") return false;

  return req.nextUrl.hostname === "127.0.0.1" || req.nextUrl.hostname === "localhost";
}

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

// Same shape as above — we look at suspended_at so admin suspensions take
// effect on the next request, not the next sign-in. Returns true iff the
// user row exists and has a non-null suspended_at.
async function isSuspendedInDb(clerkId: string): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  const sql = neon(url);
  const rows = (await sql`select suspended_at from users where clerk_id = ${clerkId} limit 1`) as Array<{
    suspended_at: string | null;
  }>;
  return Boolean(rows[0]?.suspended_at);
}

// CI/e2e starts the production server without real Clerk credentials. In that
// mode, bypass Clerk at the edge entirely; app routes under test use local-demo
// fallbacks before calling `auth()`.
const terraceClerkMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;
  if (shouldBypassAuthForLocalDemo(req)) return;

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  // Suspension check fires before the onboarding gate — suspended users
  // see a hard 403, not a redirect.
  if (await isSuspendedInDb(userId)) {
    return new NextResponse("Account suspended. Contact support.", { status: 403 });
  }

  // Onboarding gate. Fast path = the JWT claim (requires the Clerk
  // session template to surface public_metadata as `metadata`). Falls
  // back to a direct DB check so users with a finished onboarding row
  // don't loop when the template is missing.
  if (sessionClaims?.metadata?.onboarded === true) return;
  if (isOnboardingRoute(req)) return;
  if (await isOnboardedInDb(userId)) return;

  return NextResponse.redirect(new URL("/onboarding", req.url));
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (process.env.E2E_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  return terraceClerkMiddleware(req, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
