import { db } from "@/lib/prototype-db";
import { getCurrentUser } from "@/lib/auth";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const [user, creators, campaigns, conversations] = await Promise.all([
    getCurrentUser(),
    Promise.resolve(db.listCreators()),
    Promise.resolve(db.listCampaigns()),
    Promise.resolve(db.listConversations())
  ]);

  return json({
    user,
    creators,
    campaigns,
    conversations,
    metrics: db.metrics()
  });
}
