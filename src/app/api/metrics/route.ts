import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export function GET() {
  return json({ metrics: db.metrics() });
}
