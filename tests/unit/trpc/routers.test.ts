import { afterEach, describe, expect, it, vi } from "vitest";
import type { BrandMember, Creator, User } from "@/lib/db/schema";
import { appRouter } from "@/server/routers/_app";
import type { Database, TRPCContext } from "@/server/trpc";
import { createCallerFactory } from "@/server/trpc";
import {
  getCreatorByHandle,
  getCreatorProfileByHandle,
  listCreators,
  updateCreatorProfile
} from "@/server/services/creator-service";
import { createPost, likePost } from "@/server/services/post-service";
import { followTarget, listFollowers } from "@/server/services/follow-service";
import { listThreads } from "@/server/services/inbox-service";
import { getBrandBySlug, updateBrand } from "@/server/services/brand-service";
import { inviteBrandMember } from "@/server/services/org-service";

const serviceMocks = vi.hoisted(() => ({
  creator: {
    listCreators: vi.fn(),
    getCreatorById: vi.fn(),
    getCreatorByHandle: vi.fn(),
    getCreatorProfileByHandle: vi.fn(),
    searchCreators: vi.fn(),
    updateCreatorProfile: vi.fn()
  },
  post: {
    createPost: vi.fn(),
    listPosts: vi.fn(),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
    commentOnPost: vi.fn(),
    sharePost: vi.fn()
  },
  follow: {
    followTarget: vi.fn(),
    unfollowTarget: vi.fn(),
    listFollowers: vi.fn(),
    listFollowing: vi.fn()
  },
  inbox: {
    listThreads: vi.fn(),
    markThreadRead: vi.fn()
  },
  brand: {
    getBrandById: vi.fn(),
    getBrandBySlug: vi.fn(),
    updateBrand: vi.fn()
  },
  org: {
    inviteBrandMember: vi.fn(),
    removeBrandMember: vi.fn(),
    updateBrandMemberRole: vi.fn()
  }
}));

vi.mock("@/server/services/creator-service", () => serviceMocks.creator);
vi.mock("@/server/services/post-service", () => serviceMocks.post);
vi.mock("@/server/services/follow-service", () => serviceMocks.follow);
vi.mock("@/server/services/inbox-service", () => serviceMocks.inbox);
vi.mock("@/server/services/brand-service", () => serviceMocks.brand);
vi.mock("@/server/services/org-service", () => serviceMocks.org);

const createCaller = createCallerFactory(appRouter);
const db = {} as Database;
const userId = "11111111-1111-4111-8111-111111111111";
const creatorId = "22222222-2222-4222-8222-222222222222";
const brandId = "33333333-3333-4333-8333-333333333333";
const postId = "44444444-4444-4444-8444-444444444444";
const threadId = "55555555-5555-4555-8555-555555555555";
const memberUserId = "66666666-6666-4666-8666-666666666666";
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

function caller(ctx: Partial<TRPCContext> = {}) {
  return createCaller({
    headers: new Headers(),
    db,
    user,
    creator,
    brandMember,
    ...ctx
  });
}

async function expectUnauthorized(run: () => Promise<unknown>) {
  await expect(run()).rejects.toMatchObject({
    code: "UNAUTHORIZED"
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("appRouter Phase 4.2 routers", () => {
  it("creator router lists and updates creators", async () => {
    vi.mocked(listCreators).mockResolvedValueOnce({ items: [{ creator, aggregate: null }], nextCursor: null });
    vi.mocked(getCreatorByHandle).mockResolvedValueOnce(creator);
    vi.mocked(getCreatorProfileByHandle).mockResolvedValueOnce({
      creator,
      aggregate: null,
      platforms: [],
      posts: []
    });
    vi.mocked(updateCreatorProfile).mockResolvedValueOnce({ ...creator, headline: "UGC strategist" });

    await expect(caller().creator.list({ niche: "beauty" })).resolves.toEqual({
      items: [{ creator, aggregate: null }],
      nextCursor: null
    });
    await expect(caller().creator.byHandle({ handle: "Sara" })).resolves.toMatchObject({ handle: "sara" });
    await expect(caller().creator.profile({ handle: "Sara" })).resolves.toMatchObject({
      creator: { handle: "sara" },
      platforms: [],
      posts: []
    });
    await expect(caller().creator.update({ headline: "UGC strategist" })).resolves.toMatchObject({
      headline: "UGC strategist"
    });
  });

  it("post router creates and likes posts", async () => {
    const post = {
      id: postId,
      authorType: "creator" as const,
      authorId: creatorId,
      body: "Just crossed 500K on TikTok",
      mediaJson: [],
      type: "milestone" as const,
      visibility: "public" as const,
      createdAt: now,
      updatedAt: now
    };
    vi.mocked(createPost).mockResolvedValueOnce(post);
    vi.mocked(likePost).mockResolvedValueOnce({ postId, liked: true });

    await expect(caller().post.create({ body: post.body })).resolves.toEqual(post);
    await expect(caller().post.like({ postId })).resolves.toEqual({ postId, liked: true });
  });

  it("follow router follows creators and lists followers", async () => {
    const follow = {
      id: "77777777-7777-4777-8777-777777777777",
      followerId: userId,
      followedType: "creator" as const,
      followedId: creatorId,
      createdAt: now
    };
    vi.mocked(followTarget).mockResolvedValueOnce(follow);
    vi.mocked(listFollowers).mockResolvedValueOnce([follow]);

    await expect(caller().follow.follow({ followedType: "creator", followedId: creatorId })).resolves.toEqual(follow);
    await expect(caller().follow.listFollowers({ followedType: "creator", followedId: creatorId })).resolves.toEqual([
      follow
    ]);
  });

  it("inbox router lists thread previews", async () => {
    const threadPreview = {
      thread: { id: threadId, type: "direct" as const, jobId: null, createdAt: now, lastMessageAt: now },
      participant: { threadId, userId, role: "member", lastReadAt: null, muted: false },
      lastMessage: {
        id: "88888888-8888-4888-8888-888888888888",
        threadId,
        senderId: userId,
        body: "Interested in a launch?",
        attachments: [],
        replyToId: null,
        createdAt: now,
        editedAt: null,
        deletedAt: null
      },
      unreadCount: 1
    };
    vi.mocked(listThreads).mockResolvedValueOnce([threadPreview]);

    await expect(caller().inbox.listThreads({ limit: 10 })).resolves.toEqual([threadPreview]);
  });

  it("brand router reads public pages and updates admin-owned brands", async () => {
    const brand = {
      id: brandId,
      slug: "glossier",
      name: "Glossier",
      tagline: null,
      about: null,
      websiteUrl: null,
      logoUrl: null,
      coverUrl: null,
      industry: "Beauty",
      sizeRange: "51-200",
      hqLocation: "New York, NY",
      verified: true,
      followerCount: 0,
      createdAt: now,
      updatedAt: now
    };
    vi.mocked(getBrandBySlug).mockResolvedValueOnce(brand);
    vi.mocked(updateBrand).mockResolvedValueOnce({ ...brand, tagline: "Beauty that moves culture" });

    await expect(caller().brand.bySlug({ slug: "Glossier" })).resolves.toEqual(brand);
    await expect(caller().brand.update({ brandId, tagline: "Beauty that moves culture" })).resolves.toMatchObject({
      tagline: "Beauty that moves culture"
    });
  });

  it("org router invites brand members", async () => {
    const membership = { brandId, userId: memberUserId, role: "recruiter" as const, invitedBy: userId, joinedAt: now };
    vi.mocked(inviteBrandMember).mockResolvedValueOnce(membership);

    await expect(caller().org.invite({ brandId, userId: memberUserId, role: "recruiter" })).resolves.toEqual(
      membership
    );
  });

  it.each([
    ["creator.update", () => caller({ user: null }).creator.update({ headline: "New headline" })],
    ["post.create", () => caller({ user: null }).post.create({ body: "Launch day" })],
    ["post.like", () => caller({ user: null }).post.like({ postId })],
    ["post.unlike", () => caller({ user: null }).post.unlike({ postId })],
    ["post.comment", () => caller({ user: null }).post.comment({ postId, body: "Love this" })],
    ["post.share", () => caller({ user: null }).post.share({ postId, body: "Worth reading" })],
    ["follow.follow", () => caller({ user: null }).follow.follow({ followedType: "creator", followedId: creatorId })],
    [
      "follow.unfollow",
      () => caller({ user: null }).follow.unfollow({ followedType: "creator", followedId: creatorId })
    ],
    ["follow.listFollowing", () => caller({ user: null }).follow.listFollowing({ limit: 10 })],
    ["inbox.listThreads", () => caller({ user: null }).inbox.listThreads({ limit: 10 })],
    ["inbox.markRead", () => caller({ user: null }).inbox.markRead({ threadId })],
    ["brand.update", () => caller({ user: null }).brand.update({ brandId, tagline: "New" })],
    ["org.invite", () => caller({ user: null }).org.invite({ brandId, userId: memberUserId, role: "viewer" })],
    ["org.removeMember", () => caller({ user: null }).org.removeMember({ brandId, userId: memberUserId })],
    ["org.updateRole", () => caller({ user: null }).org.updateRole({ brandId, userId: memberUserId, role: "admin" })]
  ])("%s rejects unauthenticated callers", async (_name, run) => {
    await expectUnauthorized(run);
  });
});
