// Daily cron — recompute `creator_aggregates` from the latest platform metrics
// for every creator. Runs after `sync-instagram` so it picks up fresh numbers.
// Same CRON_SECRET auth pattern as sync-instagram. Idempotent.

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { recomputeCreatorAggregates } from "@/server/services/aggregator-service";

export const runtime = "nodejs";
export const maxDuration = 300;

const log = logger.child({ route: "GET /api/cron/recompute-aggregates" });

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startedAt = Date.now();
  try {
    const result = await recomputeCreatorAggregates(db);
    log.info({ ...result, durationMs: Date.now() - startedAt }, "creator aggregates recomputed");
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    log.error({ error, durationMs: Date.now() - startedAt }, "recompute failed");
    return NextResponse.json({ ok: false, error: "Recompute failed" }, { status: 500 });
  }
}
