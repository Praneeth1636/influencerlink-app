import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { YouTubeNotConfiguredError, buildAuthorizeUrl } from "@/lib/youtube/client";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
const log = logger.child({ module: "youtube-oauth-start" });
const STATE_COOKIE = "youtube_oauth_state";
const STATE_TTL_SECONDS = 600;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }
  const state = randomBytes(24).toString("base64url");
  let authorizeUrl: string;
  try {
    authorizeUrl = buildAuthorizeUrl(state);
  } catch (err) {
    if (err instanceof YouTubeNotConfiguredError) {
      log.warn("youtube start attempted with missing config");
      return NextResponse.json({ error: "YouTube OAuth is not configured." }, { status: 503 });
    }
    throw err;
  }
  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STATE_TTL_SECONDS,
    path: "/api/auth/youtube"
  });
  return res;
}
