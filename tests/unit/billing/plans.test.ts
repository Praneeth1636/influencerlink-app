import { describe, expect, it } from "vitest";
import {
  BRAND_FREE_PLAN,
  CREATOR_FREE_PLAN,
  findPlanByName,
  formatPlanPrice,
  getQuotaLimit
} from "@/lib/billing/plans";

describe("billing plan definitions", () => {
  it("defines free limits for the marketplace paywall levers", () => {
    expect(getQuotaLimit(CREATOR_FREE_PLAN, "applications")).toBe(5);
    expect(getQuotaLimit(BRAND_FREE_PLAN, "jobsPosted")).toBe(1);
    expect(getQuotaLimit(BRAND_FREE_PLAN, "dmsSent")).toBe(5);
    expect(getQuotaLimit(BRAND_FREE_PLAN, "searchesRun")).toBe(5);
  });

  it("resolves paid plans by database plan name", () => {
    const plan = findPlanByName("Brand Scale", "brand");

    expect(plan.name).toBe("Brand Scale");
    expect(getQuotaLimit(plan, "jobsPosted")).toBeNull();
    expect(formatPlanPrice(plan)).toBe("$499/month");
  });
});
