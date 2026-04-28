import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { authMock, dbLimit } = vi.hoisted(() => ({
  authMock: vi.fn(),
  dbLimit: vi.fn()
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: dbLimit
        }))
      }))
    }))
  }
}));

// drizzle-orm exports `eq` and `and` as pure functions; we let them through.

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("rbac", () => {
  beforeEach(() => {
    authMock.mockReset();
    dbLimit.mockReset();
  });

  describe("requireUser", () => {
    it("throws UnauthorizedError when not signed in", async () => {
      authMock.mockResolvedValueOnce({ userId: null });
      const { requireUser } = await import("@/lib/auth/rbac");

      await expect(requireUser()).rejects.toMatchObject({
        name: "UnauthorizedError",
        statusCode: 401
      });
    });

    it("throws NotFoundError when users row missing", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      dbLimit.mockResolvedValueOnce([]);
      const { requireUser } = await import("@/lib/auth/rbac");

      await expect(requireUser()).rejects.toMatchObject({
        name: "NotFoundError",
        statusCode: 404
      });
    });

    it("returns the users row when authenticated and present", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      const userRow = { id: "u1", clerkId: "user_clerk_1", email: "a@b.com", type: "creator" };
      dbLimit.mockResolvedValueOnce([userRow]);
      const { requireUser } = await import("@/lib/auth/rbac");

      await expect(requireUser()).resolves.toEqual(userRow);
    });
  });

  describe("requireCreator", () => {
    it("throws ForbiddenError when user.type is not creator", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      dbLimit.mockResolvedValueOnce([{ id: "u1", clerkId: "user_clerk_1", type: "brand_member" }]);
      const { requireCreator } = await import("@/lib/auth/rbac");

      await expect(requireCreator()).rejects.toMatchObject({
        name: "ForbiddenError",
        statusCode: 403
      });
    });

    it("throws NotFoundError when creators row missing", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      dbLimit
        .mockResolvedValueOnce([{ id: "u1", clerkId: "user_clerk_1", type: "creator" }]) // users row
        .mockResolvedValueOnce([]); // creators lookup empty
      const { requireCreator } = await import("@/lib/auth/rbac");

      await expect(requireCreator()).rejects.toMatchObject({
        name: "NotFoundError"
      });
    });

    it("returns user + creator when both rows exist and type matches", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      const user = { id: "u1", clerkId: "user_clerk_1", type: "creator" };
      const creator = { id: "c1", userId: "u1", handle: "sara" };
      dbLimit.mockResolvedValueOnce([user]).mockResolvedValueOnce([creator]);
      const { requireCreator } = await import("@/lib/auth/rbac");

      await expect(requireCreator()).resolves.toEqual({ user, creator });
    });
  });

  describe("requireBrandMember", () => {
    it("throws ForbiddenError when not a member", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      dbLimit
        .mockResolvedValueOnce([{ id: "u1", clerkId: "user_clerk_1", type: "brand_member" }])
        .mockResolvedValueOnce([]); // brand_members lookup empty
      const { requireBrandMember } = await import("@/lib/auth/rbac");

      await expect(requireBrandMember("brand_1")).rejects.toMatchObject({
        name: "ForbiddenError",
        message: expect.stringContaining("Not a member")
      });
    });

    it("throws ForbiddenError when role is below the threshold", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      dbLimit
        .mockResolvedValueOnce([{ id: "u1", clerkId: "user_clerk_1", type: "brand_member" }])
        .mockResolvedValueOnce([{ brandId: "brand_1", userId: "u1", role: "viewer" }]);
      const { requireBrandMember } = await import("@/lib/auth/rbac");

      await expect(requireBrandMember("brand_1", "admin")).rejects.toMatchObject({
        name: "ForbiddenError",
        message: expect.stringContaining("admin role or higher")
      });
    });

    it("returns the membership row when role meets the threshold (recruiter >= viewer)", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      const user = { id: "u1", clerkId: "user_clerk_1", type: "brand_member" };
      const member = { brandId: "brand_1", userId: "u1", role: "recruiter" };
      dbLimit.mockResolvedValueOnce([user]).mockResolvedValueOnce([member]);
      const { requireBrandMember } = await import("@/lib/auth/rbac");

      await expect(requireBrandMember("brand_1", "viewer")).resolves.toEqual({ user, member });
    });

    it("allows owner role for any threshold", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      const user = { id: "u1", clerkId: "user_clerk_1", type: "brand_member" };
      const member = { brandId: "brand_1", userId: "u1", role: "owner" };
      dbLimit.mockResolvedValueOnce([user]).mockResolvedValueOnce([member]);
      const { requireBrandMember } = await import("@/lib/auth/rbac");

      await expect(requireBrandMember("brand_1", "owner")).resolves.toEqual({ user, member });
    });

    it("defaults the threshold to viewer when minRole is omitted", async () => {
      authMock.mockResolvedValueOnce({ userId: "user_clerk_1" });
      const user = { id: "u1", clerkId: "user_clerk_1", type: "brand_member" };
      const member = { brandId: "brand_1", userId: "u1", role: "viewer" };
      dbLimit.mockResolvedValueOnce([user]).mockResolvedValueOnce([member]);
      const { requireBrandMember } = await import("@/lib/auth/rbac");

      await expect(requireBrandMember("brand_1")).resolves.toEqual({ user, member });
    });
  });
});
