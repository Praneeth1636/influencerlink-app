import {
  TerraceLandingExperience,
  type LandingCreatorRow
} from "@/components/features/marketing/terrace-landing-experience";
import { createTRPCServerCaller } from "@/lib/trpc/server";

function formatReach(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M reach`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K reach`;
  return `${n} reach`;
}

const fallbackCreatorRows: LandingCreatorRow[] = [
  { name: "Maya Chen", niche: "Photography", reach: "740K reach", status: "Open" },
  { name: "Leo Martin", niche: "Tech reviews", reach: "410K reach", status: "Booked" },
  { name: "Sara Okafor", niche: "Editorial fashion", reach: "1.2M reach", status: "Open" }
];

export default async function LandingPage() {
  const caller = await createTRPCServerCaller();
  const liveCreators = await caller.creator
    .list({ limit: 3 })
    .then((r) =>
      r.items.map((row) => ({
        name: row.creator.displayName,
        niche: row.creator.niches[0] ?? "Creator",
        reach: formatReach(row.aggregate?.totalReach ?? 0),
        status: row.creator.openToCollabs ? "Open" : "Booked"
      }))
    )
    .catch(() => []);

  return <TerraceLandingExperience creatorRows={liveCreators.length ? liveCreators : fallbackCreatorRows} />;
}
