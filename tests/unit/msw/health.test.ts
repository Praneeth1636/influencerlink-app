import { describe, expect, it } from "vitest";

describe("MSW test harness", () => {
  it("mocks network requests in unit tests", async () => {
    const response = await fetch("https://api.creatorlink.test/health");
    const body = (await response.json()) as { ok: boolean; service: string };

    expect(response.ok).toBe(true);
    expect(body).toEqual({ ok: true, service: "creatorlink" });
  });
});
