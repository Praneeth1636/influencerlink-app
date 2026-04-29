import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
  "/onboarding(.*)"
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

const authMiddleware = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  // Onboarding gate. Requires the Clerk session token to surface
  // public_metadata via the {"metadata":"{{user.public_metadata}}"} template
  // (see docs/setup.md). Until a user has metadata.onboarded === true, every
  // protected route bounces them to /onboarding.
  const isOnboarded = sessionClaims?.metadata?.onboarded === true;
  if (!isOnboarded && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
});

export default process.env.E2E_BYPASS_AUTH === "true" ? () => NextResponse.next() : authMiddleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
