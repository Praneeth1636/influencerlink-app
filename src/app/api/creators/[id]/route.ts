import { db } from "@/lib/prototype-db";
import { json, notFound } from "@/lib/api";

export const runtime = "nodejs";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  const creator = db.getCreator(params.id);
  if (!creator) return notFound("Creator not found.");
  return json({ creator });
}
