import { db } from "@/lib/prototype-db";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  return json({ conversations: db.listConversations(url.searchParams.get("creatorId") ?? undefined) });
}
