import { describe, expect, it } from "vitest";
import { buildSeedData } from "@/lib/db/seed";

describe("buildSeedData", () => {
  it("builds the expected CreatorLink development dataset", () => {
    const seed = buildSeedData();

    expect(seed.users).toHaveLength(60);
    expect(seed.creators).toHaveLength(50);
    expect(seed.brands).toHaveLength(10);
    expect(seed.brandMembers).toHaveLength(10);
    expect(seed.creatorAggregates).toHaveLength(50);
    expect(seed.creatorPlatforms).toHaveLength(150);
    expect(seed.platformMetrics).toHaveLength(150);
    expect(seed.posts).toHaveLength(100);
    expect(seed.follows).toHaveLength(120);
    expect(seed.jobs).toHaveLength(20);
    expect(seed.subscriptionPlans).toHaveLength(4);
  });

  it("uses stable unique IDs so repeated seed runs stay idempotent", () => {
    const seed = buildSeedData();
    const ids = [
      ...seed.users.map((row) => row.id),
      ...seed.creators.map((row) => row.id),
      ...seed.brands.map((row) => row.id),
      ...seed.creatorPlatforms.map((row) => row.id),
      ...seed.platformMetrics.map((row) => row.id),
      ...seed.posts.map((row) => row.id),
      ...seed.follows.map((row) => row.id),
      ...seed.jobs.map((row) => row.id),
      ...seed.subscriptionPlans.map((row) => row.id)
    ];

    expect(new Set(ids).size).toBe(ids.length);
    expect(seed.creators[0]?.handle).toBe("sararivera");
    expect(seed.posts[0]?.authorType).toBe("creator");
    expect(seed.jobs[0]?.title).toContain("Glossier");
  });
});
