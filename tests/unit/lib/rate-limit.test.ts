import { describe, expect, it, vi } from "vitest";
import { enforceRateLimit, getClientIp, getRateLimitIdentifier } from "@/lib/rate-limit";

describe("rate limit helpers", () => {
  it("uses the authenticated user id as the identifier when present", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });

    expect(
      getRateLimitIdentifier({
        kind: "write",
        userId: "user_123",
        headers,
        path: "post.create"
      })
    ).toBe("write:user:user_123");
  });

  it("falls back to the forwarded client ip for anonymous reads", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });

    expect(getClientIp(headers)).toBe("203.0.113.7");
    expect(
      getRateLimitIdentifier({
        kind: "read",
        headers,
        path: "creator.list"
      })
    ).toBe("read:ip:203.0.113.7");
  });

  it("gracefully no-ops when Upstash credentials are not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(
      enforceRateLimit({
        kind: "ai",
        userId: "user_123",
        headers: new Headers(),
        path: "search.match"
      })
    ).resolves.toMatchObject({
      enabled: false,
      success: true,
      limit: 10,
      remaining: 10,
      identifier: "ai:user:user_123"
    });

    vi.unstubAllEnvs();
  });
});
