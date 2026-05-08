// Step 1 of the Instagram Login flow. Mints a one-time `state` value (signed
// with the creator's clerkId) and redirects to IG's authorize URL. State is
// stored in an HttpOnly cookie so the callback can verify the round-trip
// without a DB hop.

import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl, InstagramNotConfiguredError } from "@/lib/instagram/client";
import { logger } from "@/lib/logger";

export const runtime = "nodejs"; // randomBytes
const log = logger.child({ module: "instagram-oauth-start" });

const STATE_COOKIE = "ig_oauth_state";
const STATE_TTL_SECONDS = 600; // 10 minutes — plenty for the IG round-trip

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  let authorizeUrl: string;
  const state = randomBytes(24).toString("base64url");
  try {
    authorizeUrl = buildAuthorizeUrl(state);
  } catch (err) {
    if (err instanceof InstagramNotConfiguredError) {
      log.warn("instagram OAuth attempt with missing config");
      return NextResponse.json({ error: "Instagram OAuth is not configured." }, { status: 503 });
    }
    throw err;
  }

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_TTL_SECONDS,
    path: "/api/auth/instagram"
  });
  return res;
}
