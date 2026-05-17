// Daily cron — refresh follower count + media metrics for every connected
// Instagram account, and rotate long-lived tokens that are within 10 days of
// expiry. Triggered by Vercel Cron (see vercel.json). Idempotent — safe to
// hit on demand for debugging.
//
// Auth: this is a public-ish endpoint, so we gate on a static CRON_SECRET
// header. Vercel Cron sets `Authorization: Bearer <secret>` automatically
// when CRON_SECRET is set as an env var.

import { inArray } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { creatorPlatforms } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { syncInstagramMetrics, syncTikTokMetrics, syncYouTubeMetrics } from "@/server/services/platform-service";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes — Vercel hobby plan ceiling

const log = logger.child({ route: "GET /api/cron/sync-instagram" });

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Dev convenience: no secret set, allow only on localhost.
    return process.env.NODE_ENV !== "production";
  }
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const connections = await db
    .select({ id: creatorPlatforms.id, platform: creatorPlatforms.platform })
    .from(creatorPlatforms)
    .where(inArray(creatorPlatforms.platform, ["instagram", "tiktok", "youtube"]));

  const results = await Promise.allSettled(
    connections.map((c) => {
      switch (c.platform) {
        case "instagram":
          return syncInstagramMetrics(db, c.id);
        case "tiktok":
          return syncTikTokMetrics(db, c.id);
        case "youtube":
          return syncYouTubeMetrics(db, c.id);
        default:
          return Promise.reject(new Error(`unknown platform ${c.platform}`));
      }
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - succeeded;

  if (failed) {
    log.warn({ total: results.length, succeeded, failed }, "platform sync completed with failures");
  } else {
    log.info({ total: results.length }, "platform sync completed");
  }

  return NextResponse.json({ total: connections.length, succeeded, failed });
}
