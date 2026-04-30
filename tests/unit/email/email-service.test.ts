import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deliverEmailMock, dbInsert } = vi.hoisted(() => ({
  deliverEmailMock: vi.fn(),
  dbInsert: vi.fn().mockResolvedValue([])
}));

vi.mock("@/lib/email/resend", async () => {
  const actual = await vi.importActual<typeof import("@/lib/email/resend")>("@/lib/email/resend");
  return {
    ...actual,
    deliverEmail: deliverEmailMock
  };
});

vi.mock("@/lib/logger", () => ({
  logger: {
    child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() })
  }
}));

const dbStub = {
  insert: vi.fn(() => ({ values: dbInsert }))
};

const envelope = {
  to: "creator@example.com",
  subject: "Welcome",
  html: "<p>Hi</p>",
  text: "Hi"
};

describe("email-service.sendEmail", () => {
  beforeEach(() => {
    deliverEmailMock.mockReset();
    dbInsert.mockReset().mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("delivers the envelope and writes an audit log row on success", async () => {
    deliverEmailMock.mockResolvedValueOnce({ id: "resend_abc" });
    const { sendEmail } = await import("@/server/services/email-service");

    const result = await sendEmail(dbStub as never, {
      envelope,
      category: "welcome",
      user: { id: "user-1" }
    });

    expect(result).toEqual({ ok: true, id: "resend_abc" });
    expect(deliverEmailMock).toHaveBeenCalledTimes(1);
    expect(dbInsert).toHaveBeenCalledTimes(1);
    expect(dbInsert.mock.calls[0]?.[0]).toMatchObject({
      action: "email.sent",
      entityType: "email",
      userId: "user-1",
      metadata: expect.objectContaining({ category: "welcome", resendId: "resend_abc" })
    });
  });

  it("soft-fails with not_configured when RESEND_API_KEY is missing", async () => {
    const { EmailNotConfiguredError } = await import("@/lib/email/resend");
    deliverEmailMock.mockRejectedValueOnce(new EmailNotConfiguredError());
    const { sendEmail } = await import("@/server/services/email-service");

    const result = await sendEmail(dbStub as never, { envelope, category: "welcome" });

    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(dbInsert).not.toHaveBeenCalled();
  });

  it("soft-fails with delivery_failed when the transport throws", async () => {
    deliverEmailMock.mockRejectedValueOnce(new Error("502 from upstream"));
    const { sendEmail } = await import("@/server/services/email-service");

    const result = await sendEmail(dbStub as never, { envelope, category: "welcome" });

    expect(result).toEqual({ ok: false, reason: "delivery_failed" });
    expect(dbInsert).not.toHaveBeenCalled();
  });
});
