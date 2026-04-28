import { NextResponse } from "next/server";
import { routeLogger } from "@/lib/observability/logger";

export const runtime = "nodejs";

const log = routeLogger("/api/health");

export function GET() {
  log.debug("health check");
  return NextResponse.json({ ok: true });
}
