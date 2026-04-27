import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const niche = url.searchParams.get("niche") ?? undefined;
  const maxRate = url.searchParams.get("maxRate") ? Number(url.searchParams.get("maxRate")) : undefined;
  return json({ creators: db.listCreators({ q, niche, maxRate }) });
}
