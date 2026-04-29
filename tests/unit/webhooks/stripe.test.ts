import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { constructEventMock, syncCheckoutSessionMock, syncStripeSubscriptionMock, markPastDueMock } = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  syncCheckoutSessionMock: vi.fn(),
  syncStripeSubscriptionMock: vi.fn(),
  markPastDueMock: vi.fn()
}));

vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    webhooks: {
      constructEvent: constructEventMock
    }
  }
}));

vi.mock("@/lib/db/client", () => ({
  db: {}
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

vi.mock("@/server/services/billing-service", () => ({
  syncCheckoutSession: syncCheckoutSessionMock,
  syncStripeSubscription: syncStripeSubscriptionMock,
  markStripeSubscriptionPastDue: markPastDueMock
}));

function buildRequest(body = "{}") {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: {
      "stripe-signature": "t=123,v1=abc"
    },
    body
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    constructEventMock.mockReset();
    syncCheckoutSessionMock.mockReset().mockResolvedValue(null);
    syncStripeSubscriptionMock.mockReset().mockResolvedValue(null);
    markPastDueMock.mockReset().mockResolvedValue(null);
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it("returns 500 when the webhook secret is missing", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const res = await POST(buildRequest());

    expect(res.status).toBe(500);
  });

  it("returns 400 when signature verification fails", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const res = await POST(buildRequest());

    expect(res.status).toBe(400);
  });

  it("syncs checkout sessions after successful payment", async () => {
    const session = { id: "cs_test", subscription: "sub_test" };
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session }
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const res = await POST(buildRequest());

    expect(res.status).toBe(204);
    expect(syncCheckoutSessionMock).toHaveBeenCalledWith({}, session);
  });

  it("syncs subscription lifecycle events", async () => {
    constructEventMock.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_test" } }
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const res = await POST(buildRequest());

    expect(res.status).toBe(204);
    expect(syncStripeSubscriptionMock).toHaveBeenCalledWith({}, "sub_test");
  });

  it("marks subscriptions past due on failed invoices", async () => {
    constructEventMock.mockReturnValue({
      type: "invoice.payment_failed",
      data: { object: { subscription: "sub_test" } }
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const res = await POST(buildRequest());

    expect(res.status).toBe(204);
    expect(markPastDueMock).toHaveBeenCalledWith({}, "sub_test");
  });
});
