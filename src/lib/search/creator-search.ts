import type { inferRouterOutputs } from "@trpc/server";
import { buildSeedData, type SeedData } from "@/lib/db/seed";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

type CreatorListRow = RouterOutputs["creator"]["list"]["items"][number];
type CreatorSearchRow = RouterOutputs["creator"]["search"][number];

export type CreatorSearchResult = {
  id: string;
  handle: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  niches: string[];
  verified: boolean;
  openToCollabs: boolean;
  totalReach: number;
  weightedEngagement: number;
  baseRateCents: number | null;
  matchScore: number;
};

export type CreatorSearchFilters = {
  query?: string;
  niche?: string;
  minReach?: number;
  openToCollabs?: boolean;
};

export function mapCreatorRows(rows: Array<CreatorListRow | CreatorSearchRow>): CreatorSearchResult[] {
  return rows.map(({ creator, aggregate }) => toSearchResult({ creator, aggregate }));
}

export function buildSeedCreatorSearchResults(filters: CreatorSearchFilters = {}, seed: SeedData = buildSeedData()) {
  const query = filters.query?.trim().toLowerCase();
  const niche = filters.niche?.trim().toLowerCase();

  return seed.creators
    .map((creator) => {
      const aggregate = seed.creatorAggregates.find((row) => row.creatorId === creator.id) ?? null;

      return toSearchResult({
        creator: {
          id: creator.id!,
          userId: creator.userId,
          handle: creator.handle,
          displayName: creator.displayName,
          bio: creator.bio ?? null,
          headline: creator.headline ?? null,
          location: creator.location ?? null,
          niches: creator.niches ?? [],
          avatarUrl: creator.avatarUrl ?? null,
          coverUrl: creator.coverUrl ?? null,
          verified: creator.verified ?? false,
          profileViews: creator.profileViews ?? 0,
          openToCollabs: creator.openToCollabs ?? false,
          ratesPublic: creator.ratesPublic ?? false,
          baseRateCents: creator.baseRateCents ?? null,
          currency: creator.currency ?? "USD",
          createdAt: creator.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
          updatedAt: creator.updatedAt ?? new Date("2026-04-01T00:00:00.000Z")
        },
        aggregate: aggregate
          ? {
              creatorId: aggregate.creatorId,
              totalReach: aggregate.totalReach ?? 0,
              weightedEngagement: aggregate.weightedEngagement ?? "0",
              primaryNiche: aggregate.primaryNiche ?? null,
              computedAt: aggregate.computedAt ?? new Date("2026-04-28T00:00:00.000Z")
            }
          : null
      });
    })
    .filter((creator) => {
      const queryMatch = query
        ? `${creator.handle} ${creator.displayName} ${creator.headline} ${creator.bio} ${creator.niches.join(" ")}`
            .toLowerCase()
            .includes(query)
        : true;
      const nicheMatch = niche ? creator.niches.some((value) => value.toLowerCase() === niche) : true;
      const reachMatch = filters.minReach ? creator.totalReach >= filters.minReach : true;
      const openMatch = filters.openToCollabs ? creator.openToCollabs : true;

      return queryMatch && nicheMatch && reachMatch && openMatch;
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.totalReach - a.totalReach)
    .slice(0, 24);
}

function toSearchResult(row: CreatorListRow | CreatorSearchRow): CreatorSearchResult {
  const primaryNiche = row.aggregate?.primaryNiche ?? row.creator.niches[0] ?? "Creator";
  const totalReach = row.aggregate?.totalReach ?? 0;
  const weightedEngagement = Number(row.aggregate?.weightedEngagement ?? 0);
  const rateValue = row.creator.baseRateCents ?? 0;

  return {
    id: row.creator.id,
    handle: row.creator.handle,
    displayName: row.creator.displayName,
    headline: row.creator.headline ?? `${primaryNiche} creator`,
    bio: row.creator.bio ?? "Creator profile imported from verified platform data.",
    location: row.creator.location ?? "Remote",
    niches: row.creator.niches.length > 0 ? row.creator.niches : [primaryNiche],
    verified: row.creator.verified,
    openToCollabs: row.creator.openToCollabs,
    totalReach,
    weightedEngagement,
    baseRateCents: row.creator.baseRateCents,
    matchScore: calculateMatchScore({
      totalReach,
      weightedEngagement,
      verified: row.creator.verified,
      openToCollabs: row.creator.openToCollabs,
      rateCents: rateValue
    })
  };
}

function calculateMatchScore(input: {
  totalReach: number;
  weightedEngagement: number;
  verified: boolean;
  openToCollabs: boolean;
  rateCents: number;
}) {
  const reachScore = Math.min(34, Math.round(input.totalReach / 80_000));
  const engagementScore = Math.min(34, Math.round(input.weightedEngagement * 4.8));
  const verificationScore = input.verified ? 16 : 6;
  const availabilityScore = input.openToCollabs ? 12 : 3;
  const rateScore = input.rateCents > 0 && input.rateCents <= 350_000 ? 4 : 2;

  return Math.min(99, reachScore + engagementScore + verificationScore + availabilityScore + rateScore);
}
