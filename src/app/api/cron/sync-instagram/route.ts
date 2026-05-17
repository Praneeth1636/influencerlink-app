// Daily cron — refresh follower count + media metrics for every connected
// Instagram account, and rotate long-lived tokens that are within 10 days of
// expiry. Triggered by Vercel Cron (see vercel.json). Idempotent — safe to
// hit on demand for debugging.
//
// Auth: this is a public-ish endpoint, so we gate on a static CRON_SECRET
// header. Vercel Cron sets `Authorization: Bearer <secret>` automatically
// when CRON_SECRET is set as an env var.

import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { creatorPlatforms } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { syncInstagramMetrics } from "@/server/services/platform-service";

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
    .select({ id: creatorPlatforms.id })
    .from(creatorPlatforms)
    .where(eq(creatorPlatforms.platform, "instagram"));

  const results = await Promise.allSettled(connections.map((c) => syncInstagramMetrics(db, c.id)));

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - succeeded;

  if (failed) {
    log.warn({ total: results.length, succeeded, failed }, "instagram sync completed with failures");
  } else {
    log.info({ total: results.length }, "instagram sync completed");
  }

  return NextResponse.json({ total: connections.length, succeeded, failed });
}
