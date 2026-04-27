import { badRequest, json, readJson } from "@/lib/api";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type ApplicationBody = {
  campaignId?: string;
  creatorId?: string;
  pitch?: string;
  proposedTerms?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const body = await readJson<ApplicationBody>(request);
  if (!body?.campaignId || !db.getCampaign(body.campaignId)) return badRequest("Valid campaign is required.");
  if (!body.creatorId || !db.getCreator(body.creatorId)) return badRequest("Valid creator is required.");
  if (!body.pitch || body.pitch.trim().length < 5) return badRequest("Pitch is required.");

  return json({
    application: db.createApplication({
      campaignId: body.campaignId,
      creatorId: body.creatorId,
      pitch: body.pitch.trim(),
      proposedTerms: body.proposedTerms
    })
  });
}
