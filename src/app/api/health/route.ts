import { db } from "@/lib/db";
import { json } from "@/lib/api";
import { routeLogger } from "@/lib/observability/logger";

export const runtime = "nodejs";
const log = routeLogger("/api/health");

export function GET() {
  const metrics = db.metrics();
  log.debug({ metrics }, "health check completed");

  return json({ ok: true, database: process.env.CI === "true" ? "memory" : "prototype", metrics });
}
