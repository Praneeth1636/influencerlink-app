import { describe, expect, it } from "vitest";
import { buildSeedData } from "@/lib/db/seed";

describe("buildSeedData", () => {
  it("builds the expected Terrace development dataset", () => {
    const seed = buildSeedData();

    expect(seed.users).toHaveLength(22);
    expect(seed.creators).toHaveLength(12);
    expect(seed.brands).toHaveLength(10);
    expect(seed.brandMembers).toHaveLength(10);
    expect(seed.creatorAggregates).toHaveLength(12);
    expect(seed.creatorPlatforms).toHaveLength(36);
    expect(seed.platformMetrics).toHaveLength(36);
    expect(seed.posts).toHaveLength(100);
    expect(seed.follows).toHaveLength(120);
    expect(seed.jobs).toHaveLength(20);
    expect(seed.jobApplications).toHaveLength(80);
    expect(seed.jobSavedByCreator).toHaveLength(36);
    expect(seed.messageThreads).toHaveLength(12);
    expect(seed.threadParticipants).toHaveLength(24);
    expect(seed.messages).toHaveLength(36);
    expect(seed.notifications).toHaveLength(80);
    expect(seed.subscriptionPlans).toHaveLength(7);
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
      ...seed.jobApplications.map((row) => row.id),
      ...seed.messageThreads.map((row) => row.id),
      ...seed.messages.map((row) => row.id),
      ...seed.notifications.map((row) => row.id),
      ...seed.subscriptionPlans.map((row) => row.id)
    ];

    expect(new Set(ids).size).toBe(ids.length);
    expect(seed.creators[0]?.handle).toBe("mayachen");
    expect(seed.posts[0]?.authorType).toBe("creator");
    expect(seed.posts[0]?.source).toBe("youtube");
    expect(seed.jobs[0]?.title).toContain("GlowHaus");
    expect(seed.jobSavedByCreator[0]?.jobId).toBe(seed.jobs[0]?.id);
    expect(seed.messages[0]?.body).toContain("GlowHaus");
    expect(seed.notifications[0]?.type).toBe("job_application.submitted");
  });
});
