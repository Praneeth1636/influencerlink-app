import { describe, expect, it } from "vitest";
import { getSeedCreatorJobsWorkspace } from "@/lib/jobs/creator-workspace";

describe("creator jobs workspace mapping", () => {
  it("builds seeded saved jobs and application history for a creator", () => {
    const workspace = getSeedCreatorJobsWorkspace("sararivera");

    expect(workspace.savedJobs).toHaveLength(3);
    expect(workspace.applications.length).toBeGreaterThan(0);
    expect(workspace.savedJobs[0]?.job.title).toContain("Glossier");
    expect(workspace.applications[0]).toMatchObject({
      status: "submitted",
      job: {
        brandName: "Glossier"
      }
    });
  });
});
