import { db } from "@/lib/prototype-db";
import { json, notFound } from "@/lib/api";

export const runtime = "nodejs";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  const campaign = db.getCampaign(params.id);
  if (!campaign) return notFound("Campaign not found.");
  return json({ campaign });
}
