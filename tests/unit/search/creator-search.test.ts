import { describe, expect, it } from "vitest";
import { buildSeedCreatorSearchResults } from "@/lib/search/creator-search";

describe("buildSeedCreatorSearchResults", () => {
  it("filters seeded creators by query, niche, reach, and availability", () => {
    const results = buildSeedCreatorSearchResults({
      query: "beauty",
      niche: "Beauty",
      minReach: 100_000,
      openToCollabs: true
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((creator) => creator.niches.includes("Beauty"))).toBe(true);
    expect(results.every((creator) => creator.totalReach >= 100_000)).toBe(true);
    expect(results.every((creator) => creator.openToCollabs)).toBe(true);
  });

  it("sorts stronger creator matches first", () => {
    const results = buildSeedCreatorSearchResults({ niche: "Beauty" });

    expect(results.length).toBeGreaterThan(1);
    expect(results[0]!.matchScore).toBeGreaterThanOrEqual(results[1]!.matchScore);
  });
});
