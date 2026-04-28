import { db } from "@/lib/prototype-db";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export function GET() {
  return json({ metrics: db.metrics() });
}
