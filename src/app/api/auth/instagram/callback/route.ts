// Step 2 of the Instagram Login flow. IG redirects here with `?code=...&state=...`.
// We verify the state cookie matches, exchange the code for a long-lived token,
// and persist the connection.

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { creators, users } from "@/lib/db/schema";
import { connectInstagram } from "@/server/services/platform-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
const log = logger.child({ module: "instagram-oauth-callback" });

const STATE_COOKIE = "ig_oauth_state";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function settled(
  status: "ok" | "denied" | "state_mismatch" | "missing_code" | "unauthorized" | "no_creator" | "error",
  message?: string
) {
  const url = new URL("/creator", baseUrl());
  url.searchParams.set("ig", status);
  if (message) url.searchParams.set("ig_message", message);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  if (error) {
    log.warn({ error, errorReason }, "instagram authorize denied");
    return settled("denied", errorReason ?? error);
  }

  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  if (!state || !stateCookie || state !== stateCookie) {
    log.warn("instagram state cookie mismatch");
    return settled("state_mismatch");
  }

  if (!code) {
    return settled("missing_code");
  }

  const { userId } = await auth();
  if (!userId) {
    return settled("unauthorized");
  }

  // Look up the user → creator row. Only signed-in creators can connect.
  const [userRow] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!userRow) {
    return settled("no_creator", "User row missing");
  }
  const [creator] = await db.select().from(creators).where(eq(creators.userId, userRow.id)).limit(1);
  if (!creator) {
    return settled("no_creator", "Finish creator onboarding before connecting Instagram");
  }

  try {
    const result = await connectInstagram(db, userRow, creator, { code });
    log.info({ creatorId: creator.id, username: result.username, followers: result.followers }, "instagram connected");
    const res = settled("ok", `Connected @${result.username}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (err) {
    log.error({ err }, "instagram connect failed");
    return settled("error", err instanceof Error ? err.message : "Unknown");
  }
}
