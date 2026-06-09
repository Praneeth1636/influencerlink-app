import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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

  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }
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
