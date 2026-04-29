import { describe, expect, it } from "vitest";
import { influencers } from "@/data/marketplace";
import { buildFeedDashboardData, type CreatorListOutput, type PostListOutput } from "@/lib/feed/dashboard-data";

const createdAt = new Date("2026-04-29T00:00:00.000Z");

const creatorData = {
  items: [
    {
      creator: {
        id: "00000000-0000-4000-8000-000000000001",
        userId: "00000000-0000-4000-8000-000000000002",
        handle: "sara",
        displayName: "Sara Rivera",
        bio: "Beauty creator with verified launch performance.",
        headline: "Beauty launch creator",
        location: "Los Angeles, CA",
        niches: ["Beauty"],
        avatarUrl: null,
        coverUrl: null,
        verified: true,
        profileViews: 42,
        openToCollabs: true,
        ratesPublic: true,
        baseRateCents: 320000,
        currency: "USD",
        createdAt,
        updatedAt: createdAt
      },
      aggregate: {
        creatorId: "00000000-0000-4000-8000-000000000001",
        totalReach: 2_400_000,
        weightedEngagement: "5.800",
        primaryNiche: "Beauty",
        computedAt: createdAt
      }
    }
  ],
  nextCursor: null
} satisfies CreatorListOutput;

const postData = [
  {
    id: "00000000-0000-4000-8000-000000000003",
    authorType: "creator",
    authorId: "00000000-0000-4000-8000-000000000001",
    body: "Just crossed 2.4M verified reach.",
    mediaJson: [],
    type: "milestone",
    visibility: "public",
    createdAt,
    updatedAt: createdAt
  }
] satisfies PostListOutput;

describe("buildFeedDashboardData", () => {
  it("maps live tRPC creators and posts into feed dashboard data", () => {
    const result = buildFeedDashboardData({
      creatorData,
      postData,
      creatorsLoading: false,
      postsLoading: false,
      creatorsError: false,
      postsError: false,
      fallbackCreators: influencers
    });

    expect(result.state).toBe("live");
    expect(result.label).toBe("Live API data");
    expect(result.creators[0]?.name).toBe("Sara Rivera");
    expect(result.creators[0]?.rate).toBe(3_200);
    expect(result.posts).toHaveLength(1);
  });

  it("keeps the dashboard usable with demo creators when the API is offline", () => {
    const result = buildFeedDashboardData({
      creatorsLoading: false,
      postsLoading: false,
      creatorsError: true,
      postsError: false,
      fallbackCreators: influencers
    });

    expect(result.state).toBe("offline");
    expect(result.creators).toBe(influencers);
    expect(result.message).toContain("Live API data is unavailable");
  });
});
