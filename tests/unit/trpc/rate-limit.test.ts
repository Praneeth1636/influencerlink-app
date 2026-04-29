import { afterEach, describe, expect, it, vi } from "vitest";
import type { BrandMember, Creator, User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";

const { enforceRateLimitMock, likePostMock } = vi.hoisted(() => ({
  enforceRateLimitMock: vi.fn(),
  likePostMock: vi.fn()
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock
}));

vi.mock("@/server/services/post-service", () => ({
  createPost: vi.fn(),
  listPosts: vi.fn(),
  likePost: likePostMock,
  unlikePost: vi.fn(),
  commentOnPost: vi.fn(),
  sharePost: vi.fn()
}));

const userId = "11111111-1111-4111-8111-111111111111";
const creatorId = "22222222-2222-4222-8222-222222222222";
const brandId = "33333333-3333-4333-8333-333333333333";
const postId = "44444444-4444-4444-8444-444444444444";
const now = new Date("2026-01-01T00:00:00.000Z");

const user: User = {
  id: userId,
  clerkId: "user_test_123",
  email: "creator@example.com",
  type: "creator",
  onboardedAt: now,
  createdAt: now
};

const creator: Creator = {
  id: creatorId,
  userId,
  handle: "sara",
  displayName: "Sara Rivera",
  bio: "Beauty creator",
  headline: "Beauty and lifestyle creator",
  location: "Los Angeles, CA",
  niches: ["beauty"],
  avatarUrl: null,
  coverUrl: null,
  verified: true,
  profileViews: 0,
  openToCollabs: true,
  ratesPublic: true,
  baseRateCents: 320_000,
  currency: "USD",
  createdAt: now,
  updatedAt: now
};

const brandMember: BrandMember = {
  brandId,
  userId,
  role: "admin",
  invitedBy: null,
  joinedAt: now
};

async function createCaller() {
  const [{ appRouter }, { createCallerFactory }] = await Promise.all([
    import("@/server/routers/_app"),
    import("@/server/trpc")
  ]);

  return createCallerFactory(appRouter)({
    headers: new Headers({ "x-forwarded-for": "203.0.113.9" }),
    db: {} as Database,
    user,
    creator,
    brandMember
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("tRPC rate limiting middleware", () => {
  it("applies the read limiter to query procedures", async () => {
    enforceRateLimitMock.mockResolvedValue({
      enabled: true,
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now(),
      identifier: `read:user:${userId}`
    });

    await expect((await createCaller()).health()).resolves.toEqual({
      ok: true,
      service: "creatorlink-trpc"
    });

    expect(enforceRateLimitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "read",
        userId,
        path: "health"
      })
    );
  });

  it("applies the write limiter to mutation procedures", async () => {
    enforceRateLimitMock.mockResolvedValue({
      enabled: true,
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now(),
      identifier: `write:user:${userId}`
    });
    likePostMock.mockResolvedValue({ postId, liked: true });

    await expect((await createCaller()).post.like({ postId })).resolves.toEqual({ postId, liked: true });

    expect(enforceRateLimitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "write",
        userId,
        path: "post.like"
      })
    );
  });

  it("rejects requests when the limiter denies the call", async () => {
    enforceRateLimitMock.mockResolvedValue({
      enabled: true,
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 60_000,
      identifier: `write:user:${userId}`
    });

    await expect((await createCaller()).post.like({ postId })).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS"
    });
    expect(likePostMock).not.toHaveBeenCalled();
  });
});
