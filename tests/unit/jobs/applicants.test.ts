import { describe, expect, it } from "vitest";
import { getSeedApplicantsBoard } from "@/lib/jobs/applicants";

describe("job applicants mapping", () => {
  it("builds a seeded applicant board for a brand gig", () => {
    const board = getSeedApplicantsBoard("00000000-0000-4000-8000-000000008000");

    expect(board).toMatchObject({
      brandName: "GlowHaus",
      title: expect.stringContaining("GlowHaus")
    });
    expect(board?.applicants).toHaveLength(4);
    expect(board?.applicants[0]).toMatchObject({
      displayName: "Maya Chen",
      status: "submitted"
    });
  });
});
