import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { presignPutUrlMock, dbInsert, dbSelectLimit } = vi.hoisted(() => ({
  presignPutUrlMock: vi.fn(),
  dbInsert: vi.fn().mockResolvedValue([]),
  dbSelectLimit: vi.fn()
}));

vi.mock("@/lib/storage/r2", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage/r2")>("@/lib/storage/r2");
  return {
    ...actual,
    presignPutUrl: presignPutUrlMock
  };
});

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: vi.fn(() => ({ values: dbInsert })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: dbSelectLimit }))
      }))
    }))
  }
}));

const fakeUser = {
  id: "00000000-0000-4000-8000-00000000aaaa",
  clerkId: "user_clerk",
  email: "creator@example.com",
  type: "creator" as const,
  onboardedAt: null,
  suspendedAt: null,
  suspendedReason: null,
  createdAt: new Date()
};

const dbStub = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({ limit: dbSelectLimit }))
    }))
  })),
  insert: vi.fn(() => ({ values: dbInsert }))
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("storage-service.requestUpload", () => {
  beforeEach(() => {
    presignPutUrlMock.mockReset();
    dbInsert.mockReset().mockResolvedValue([]);
    dbSelectLimit.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported content types for a kind", async () => {
    const { requestUpload } = await import("@/server/services/storage-service");
    dbSelectLimit.mockResolvedValueOnce([{ id: "creator-1" }]);

    await expect(
      requestUpload(dbStub as never, fakeUser, {
        kind: "avatar",
        contentType: "video/mp4",
        contentLength: 1_000
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects oversize uploads", async () => {
    const { requestUpload } = await import("@/server/services/storage-service");
    dbSelectLimit.mockResolvedValueOnce([{ id: "creator-1" }]);

    await expect(
      requestUpload(dbStub as never, fakeUser, {
        kind: "avatar",
        contentType: "image/jpeg",
        contentLength: 50 * 1024 * 1024
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects avatar uploads when the creator profile is missing", async () => {
    const { requestUpload } = await import("@/server/services/storage-service");
    dbSelectLimit.mockResolvedValueOnce([]); // no creator row yet

    await expect(
      requestUpload(dbStub as never, fakeUser, {
        kind: "avatar",
        contentType: "image/jpeg",
        contentLength: 100_000
      })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("returns presigned upload + public URLs for a valid avatar request", async () => {
    const { requestUpload } = await import("@/server/services/storage-service");
    dbSelectLimit.mockResolvedValueOnce([{ id: "creator-1" }]);
    presignPutUrlMock.mockResolvedValueOnce({
      url: "https://r2.example/upload?sig=abc",
      publicUrl: "https://r2.example/creator/creator-1/avatar/file.jpg"
    });

    const result = await requestUpload(dbStub as never, fakeUser, {
      kind: "avatar",
      contentType: "image/jpeg",
      contentLength: 100_000
    });

    expect(result.uploadUrl).toBe("https://r2.example/upload?sig=abc");
    expect(result.publicUrl).toContain("creator/creator-1/avatar/");
    expect(result.expiresInSeconds).toBe(300);
    expect(presignPutUrlMock).toHaveBeenCalledTimes(1);
    expect(dbInsert).toHaveBeenCalledTimes(1); // audit log written
  });

  it("translates StorageNotConfiguredError into a PRECONDITION_FAILED tRPC error", async () => {
    const { StorageNotConfiguredError } = await import("@/lib/storage/r2");
    const { requestUpload } = await import("@/server/services/storage-service");
    dbSelectLimit.mockResolvedValueOnce([{ id: "creator-1" }]);
    presignPutUrlMock.mockRejectedValueOnce(new StorageNotConfiguredError());

    await expect(
      requestUpload(dbStub as never, fakeUser, {
        kind: "avatar",
        contentType: "image/jpeg",
        contentLength: 100_000
      })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
