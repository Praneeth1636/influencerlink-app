import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { APP_ONBOARDED_COOKIE } from "@/lib/auth/cookies";

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

  // Keep edge middleware lightweight: no database calls here. The JWT claim is
  // the durable source. The cookie is an immediate same-user bridge for the
  // first redirect after onboarding, before Clerk refreshes session claims.
  if (sessionClaims?.metadata?.onboarded === true) return;
  if (req.cookies.get(APP_ONBOARDED_COOKIE)?.value === userId) return;
  if (isOnboardingRoute(req)) return;

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
