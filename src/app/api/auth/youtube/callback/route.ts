import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { creators, users } from "@/lib/db/schema";
import { connectYouTube } from "@/server/services/platform-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
const log = logger.child({ module: "youtube-oauth-callback" });
const STATE_COOKIE = "youtube_oauth_state";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function settled(
  status: "ok" | "denied" | "state_mismatch" | "missing_code" | "unauthorized" | "no_creator" | "error",
  message?: string
) {
  const url = new URL("/creator", baseUrl());
  url.searchParams.set("youtube", status);
  if (message) url.searchParams.set("youtube_message", message);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) return settled("denied", error);
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  if (!state || !stateCookie || state !== stateCookie) return settled("state_mismatch");
  if (!code) return settled("missing_code");

  const { userId } = await auth();
  if (!userId) return settled("unauthorized");

  const [userRow] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!userRow) return settled("no_creator", "User row missing");
  const [creator] = await db.select().from(creators).where(eq(creators.userId, userRow.id)).limit(1);
  if (!creator) return settled("no_creator", "Finish creator onboarding before connecting YouTube");

  try {
    const result = await connectYouTube(db, userRow, creator, { code });
    log.info({ creatorId: creator.id, channel: result.channel, subscribers: result.subscribers }, "youtube connected");
    const res = settled("ok", `Connected ${result.channel}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err) {
    log.error({ err }, "youtube connect failed");
    return settled("error", err instanceof Error ? err.message : "Unknown");
  }
}
