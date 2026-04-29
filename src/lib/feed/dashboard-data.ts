import type { inferRouterOutputs } from "@trpc/server";
import type { Influencer, Platform } from "@/data/marketplace";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type CreatorListOutput = RouterOutputs["creator"]["list"];
export type PostListOutput = RouterOutputs["post"]["list"];

export type FeedDataState = "loading" | "live" | "empty" | "offline";

export type FeedDashboardData = {
  creators: Influencer[];
  posts: PostListOutput;
  state: FeedDataState;
  label: string;
  message: string;
};

type BuildFeedDashboardDataInput = {
  creatorData?: CreatorListOutput;
  postData?: PostListOutput;
  creatorsLoading: boolean;
  postsLoading: boolean;
  creatorsError: boolean;
  postsError: boolean;
  fallbackCreators: Influencer[];
};

const fallbackPlatforms: Platform[] = ["Instagram", "TikTok"];

export function buildFeedDashboardData(input: BuildFeedDashboardDataInput): FeedDashboardData {
  if (input.creatorsLoading || input.postsLoading) {
    return {
      creators: input.fallbackCreators,
      posts: [],
      state: "loading",
      label: "Syncing live data",
      message: "Checking the tRPC feed and creator services."
    };
  }

  if (input.creatorsError || input.postsError) {
    return {
      creators: input.fallbackCreators,
      posts: [],
      state: "offline",
      label: "Demo fallback",
      message: "Live API data is unavailable, so the prototype data is keeping the dashboard usable."
    };
  }

  const liveCreators = mapCreators(input.creatorData);
  const posts = input.postData ?? [];

  if (liveCreators.length === 0 && posts.length === 0) {
    return {
      creators: input.fallbackCreators,
      posts,
      state: "empty",
      label: "Awaiting seed data",
      message: "tRPC is connected, but no creators or posts exist in the database yet."
    };
  }

  return {
    creators: liveCreators.length > 0 ? liveCreators : input.fallbackCreators,
    posts,
    state: "live",
    label: "Live API data",
    message: "Creators and posts are flowing through tRPC and TanStack Query."
  };
}

function mapCreators(data?: CreatorListOutput): Influencer[] {
  return (
    data?.items.map(({ creator, aggregate }, index) => {
      const totalReach = aggregate?.totalReach ?? 0;
      const engagementRate = Number(aggregate?.weightedEngagement ?? 0);
      const primaryNiche = aggregate?.primaryNiche ?? creator.niches[0] ?? "Creator";
      const rate = creator.baseRateCents ? Math.round(creator.baseRateCents / 100) : 0;

      return {
        id: creator.id,
        name: creator.displayName,
        handle: `@${creator.handle}`,
        city: creator.location ?? "Remote",
        niche: primaryNiche,
        platforms: fallbackPlatforms,
        followers: totalReach,
        avgViews: Math.round(totalReach * 0.28),
        engagementRate,
        audience: `${primaryNiche} audience, verified from connected platforms`,
        rate,
        availability: creator.openToCollabs ? "Available" : "Limited",
        brandSafety: creator.verified ? 96 : 88,
        responseTime: creator.openToCollabs ? "1d" : "2d",
        verified: creator.verified,
        pastBrands: [],
        bio: creator.bio ?? creator.headline ?? "Creator profile imported from the live database.",
        languages: ["English"],
        contentTypes: creator.niches.length > 0 ? creator.niches : [primaryNiche],
        totalReach,
        campaignsCompleted: 0,
        audienceDemographics: ["Verified metrics pending"],
        socialAccounts: fallbackPlatforms.map((platform) => ({
          platform,
          followers: Math.round(totalReach / fallbackPlatforms.length),
          engagementRate,
          lastSyncedAt: aggregate?.computedAt ? aggregate.computedAt.toISOString().slice(0, 10) : "Pending"
        })),
        contentSamples: [],
        collaborations: [
          {
            brand: "CreatorLink",
            title: index === 0 ? "Live profile import" : "Verified creator profile",
            reach: totalReach,
            engagementRate
          }
        ]
      };
    }) ?? []
  );
}
