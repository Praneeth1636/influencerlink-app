import { describe, expect, it } from "vitest";
import { buildSeedData } from "@/lib/db/seed";
import { buildSeedJobBoardItems, getSeedJobBoardItem } from "@/lib/jobs/job-board";

describe("job board seed adapter", () => {
  it("builds sorted open job cards from deterministic seed data", () => {
    const jobs = buildSeedJobBoardItems({}, buildSeedData());

    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((job) => job.fitScore > 0)).toBe(true);
    expect(jobs[0]?.fitScore).toBeGreaterThanOrEqual(jobs[1]?.fitScore ?? 0);
  });

  it("filters jobs by niche, budget, and remote status", () => {
    const jobs = buildSeedJobBoardItems({
      niche: "Beauty",
      minBudgetCents: 300_000,
      remote: true
    });

    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((job) => job.niches.includes("Beauty"))).toBe(true);
    expect(jobs.every((job) => (job.budgetMaxCents ?? 0) >= 300_000)).toBe(true);
    expect(jobs.every((job) => job.remote)).toBe(true);
  });

  it("finds a seed job by id", () => {
    const job = getSeedJobBoardItem("00000000-0000-4000-8000-000000008000");

    expect(job).toMatchObject({
      id: "00000000-0000-4000-8000-000000008000",
      brandName: "Glossier"
    });
  });
});
