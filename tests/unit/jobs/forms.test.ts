import { describe, expect, it } from "vitest";
import { dollarsToCents, splitCsv, splitLines, toJobApplicationInput, toJobCreateInput } from "@/lib/jobs/forms";

describe("job form helpers", () => {
  it("normalizes brand brief form values into job create input", () => {
    expect(
      toJobCreateInput({
        brandId: " 33333333-3333-4333-8333-333333333333 ",
        title: " Summer launch ",
        description: " Build a creator campaign around a product drop. ",
        deliverablesText: "1 Reel\n\n1 TikTok",
        nichesText: "Beauty, Lifestyle, ",
        minFollowers: "100000",
        minEngagement: "4.5",
        budgetMinDollars: "2500",
        budgetMaxDollars: "5000",
        deadline: "2026-06-15",
        location: "Los Angeles",
        remote: true,
        status: "open"
      })
    ).toMatchObject({
      brandId: "33333333-3333-4333-8333-333333333333",
      title: "Summer launch",
      deliverables: [{ title: "1 Reel" }, { title: "1 TikTok" }],
      niches: ["Beauty", "Lifestyle"],
      minFollowers: 100000,
      minEngagement: "4.5",
      budgetMinCents: 250000,
      budgetMaxCents: 500000,
      location: "Los Angeles",
      remote: true,
      status: "open"
    });
  });

  it("normalizes creator applications", () => {
    expect(
      toJobApplicationInput("99999999-9999-4999-8999-999999999999", {
        pitch: " I can make this feel native to beauty audiences. ",
        proposedRateDollars: "3200"
      })
    ).toEqual({
      jobId: "99999999-9999-4999-8999-999999999999",
      pitch: "I can make this feel native to beauty audiences.",
      proposedRateCents: 320000,
      attachments: []
    });
  });

  it("handles empty list and money fields safely", () => {
    expect(splitLines("")).toEqual([]);
    expect(splitCsv("Beauty,,Tech")).toEqual(["Beauty", "Tech"]);
    expect(dollarsToCents("not-a-number")).toBeUndefined();
  });
});
