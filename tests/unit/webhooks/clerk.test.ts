import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Hoisted mocks (created before vi.mock factories run)
// ---------------------------------------------------------------------------

const { verifyMock, dbInsertValues, dbUpdateWhere, dbDeleteWhere, headerGetMock } = vi.hoisted(() => ({
  verifyMock: vi.fn(),
  dbInsertValues: vi.fn(),
  dbUpdateWhere: vi.fn(),
  dbDeleteWhere: vi.fn(),
  headerGetMock: vi.fn()
}));

vi.mock("svix", () => {
  class MockWebhook {
    verify(...args: unknown[]) {
      return verifyMock(...args);
    }
  }
  return { Webhook: MockWebhook };
});

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({ get: headerGetMock })
}));

vi.mock("@/lib/db/client", () => ({
  db: {
    insert: vi.fn(() => ({ values: dbInsertValues })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({ where: dbUpdateWhere }))
    })),
    delete: vi.fn(() => ({ where: dbDeleteWhere }))
  }
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const validHeaders: Record<string, string> = {
  "svix-id": "msg_test_123",
  "svix-timestamp": "1700000000",
  "svix-signature": "v1,test-signature-base64"
};

function setHeaders(overrides: Partial<Record<string, string | undefined>> = {}) {
  const merged: Record<string, string | undefined> = { ...validHeaders, ...overrides };
  headerGetMock.mockImplementation((key: string) => merged[key] ?? null);
}

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/webhooks/clerk", () => {
  beforeEach(() => {
    verifyMock.mockReset();
    dbInsertValues.mockReset().mockResolvedValue([]);
    dbUpdateWhere.mockReset().mockResolvedValue([]);
    dbDeleteWhere.mockReset().mockResolvedValue([]);
    headerGetMock.mockReset();
    setHeaders();
    process.env.CLERK_WEBHOOK_SECRET = "whsec_testsecret";
  });

  afterEach(() => {
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  it("returns 500 when CLERK_WEBHOOK_SECRET is missing", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({ type: "user.created", data: {} }));

    expect(res.status).toBe(500);
  });

  it("returns 400 when svix headers are missing", async () => {
    setHeaders({ "svix-id": undefined });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({ type: "user.created", data: {} }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when svix signature verification fails", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({ type: "user.created", data: {} }));

    expect(res.status).toBe(400);
  });

  it("inserts a users row on user.created with the primary email", async () => {
    verifyMock.mockReturnValue({
      type: "user.created",
      data: {
        id: "user_2abcdef",
        email_addresses: [
          { id: "ea_1", email_address: "secondary@example.com" },
          { id: "ea_2", email_address: "primary@example.com" }
        ],
        primary_email_address_id: "ea_2"
      }
    });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(204);
    expect(dbInsertValues).toHaveBeenCalledWith({
      clerkId: "user_2abcdef",
      email: "primary@example.com",
      type: "creator"
    });
  });

  it("updates the email on user.updated", async () => {
    verifyMock.mockReturnValue({
      type: "user.updated",
      data: {
        id: "user_2abcdef",
        email_addresses: [{ id: "ea_1", email_address: "new@example.com" }],
        primary_email_address_id: "ea_1"
      }
    });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(204);
    expect(dbUpdateWhere).toHaveBeenCalledTimes(1);
  });

  it("deletes the users row on user.deleted (cascades via FK)", async () => {
    verifyMock.mockReturnValue({
      type: "user.deleted",
      data: { id: "user_2abcdef", deleted: true }
    });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(204);
    expect(dbDeleteWhere).toHaveBeenCalledTimes(1);
  });

  it("acknowledges organization.created without DB writes", async () => {
    verifyMock.mockReturnValue({
      type: "organization.created",
      data: { id: "org_123", name: "Acme", slug: "acme", created_by: "user_1" }
    });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(204);
    expect(dbInsertValues).not.toHaveBeenCalled();
  });

  it("acknowledges organizationMembership.created without DB writes", async () => {
    verifyMock.mockReturnValue({
      type: "organizationMembership.created",
      data: {
        organization: { id: "org_123" },
        public_user_data: { user_id: "user_1" },
        role: "admin"
      }
    });
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(204);
    expect(dbInsertValues).not.toHaveBeenCalled();
  });

  it("returns 500 when a DB write throws", async () => {
    verifyMock.mockReturnValue({
      type: "user.created",
      data: {
        id: "user_x",
        email_addresses: [{ id: "ea_1", email_address: "x@example.com" }],
        primary_email_address_id: "ea_1"
      }
    });
    dbInsertValues.mockRejectedValueOnce(new Error("connection refused"));
    const { POST } = await import("@/app/api/webhooks/clerk/route");

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(500);
  });
});
