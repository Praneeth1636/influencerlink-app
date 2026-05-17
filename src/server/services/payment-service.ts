// Brief payment service. Owns the lifecycle of money attached to an accepted
// application: row in 'pending' → payment intent created → brand pays
// ('captured') → delivery confirmed → transfer to creator's Stripe Connect
// account ('released'). Refunds and failures branch off.
//
// We use the separate-charges-and-transfers pattern because the brand pays
// at hire time but funds release only after delivery confirmation — these
// two events are often weeks apart, so destination charges (which couple
// them) don't fit.

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import {
  briefPayments,
  creatorPayoutAccounts,
  creators,
  jobApplications,
  jobs,
  type BrandMember,
  type BriefPayment,
  type Creator,
  type User
} from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/stripe/client";
import { StripeNotConfiguredError } from "@/lib/stripe/connect";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";
import { createNotification } from "./notification-service";

const log = logger.child({ module: "payment-service" });

/** Platform fee in basis points (1/100 of a percent). 1000 = 10%. */
export const PLATFORM_FEE_BPS = 1000;

function computeSplit(amountCents: number) {
  const platformFeeCents = Math.floor((amountCents * PLATFORM_FEE_BPS) / 10_000);
  const creatorPayoutCents = amountCents - platformFeeCents;
  return { platformFeeCents, creatorPayoutCents };
}

function assertStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new StripeNotConfiguredError();
  }
}

/**
 * Called when a brand sets application.status = 'hired'. Idempotent —
 * returns the existing row if one already exists. Does NOT create the
 * Stripe payment intent yet; that happens on `confirmPayment` when the
 * brand actually goes to pay, so we don't leak intents into Stripe for
 * applications that never get paid.
 *
 * Amount logic: prefer the creator's proposed rate on the application;
 * fall back to the midpoint of the job's budget range; finally, the job's
 * min budget. If all three are absent, throws — brand needs to set a
 * rate before hiring.
 */
export async function createBriefPaymentForApplication(db: Database, applicationId: string): Promise<BriefPayment> {
  const [existing] = await db
    .select()
    .from(briefPayments)
    .where(eq(briefPayments.applicationId, applicationId))
    .limit(1);
  if (existing) return existing;

  const [row] = await db
    .select({
      application: jobApplications,
      job: jobs,
      creator: creators
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(creators, eq(creators.id, jobApplications.creatorId))
    .where(eq(jobApplications.id, applicationId))
    .limit(1);

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }

  const amountCents = resolveAmountCents(
    row.application.proposedRateCents,
    row.job.budgetMinCents,
    row.job.budgetMaxCents
  );
  if (!amountCents) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Set a proposed rate or budget on the brief before hiring"
    });
  }

  const { platformFeeCents, creatorPayoutCents } = computeSplit(amountCents);

  const [created] = await db
    .insert(briefPayments)
    .values({
      applicationId,
      jobId: row.job.id,
      brandId: row.job.brandId,
      creatorId: row.creator.id,
      amountCents,
      platformFeeCents,
      creatorPayoutCents,
      status: "pending"
    })
    .returning();

  if (!created) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create payment row" });
  }

  log.info(
    { paymentId: created.id, applicationId, amountCents, platformFeeCents },
    "brief_payment row created on hire"
  );
  return created;
}

function resolveAmountCents(
  proposed: number | null,
  minBudget: number | null,
  maxBudget: number | null
): number | null {
  if (proposed && proposed > 0) return proposed;
  if (minBudget && maxBudget) return Math.floor((minBudget + maxBudget) / 2);
  if (minBudget) return minBudget;
  if (maxBudget) return maxBudget;
  return null;
}

/**
 * Brand explicitly confirms payment via Stripe Checkout (hosted page).
 * Returns the Checkout session URL — caller redirects the brand to it.
 * Stripe handles card collection, 3DS, and the post-payment redirect back
 * to /jobs/[id]/applicants?paid=ok.
 *
 * Idempotent — if an open session already exists, returns its URL.
 */
export async function createBriefCheckoutSession(
  db: Database,
  user: User,
  _member: BrandMember,
  paymentId: string
): Promise<{ paymentId: string; checkoutUrl: string }> {
  assertStripeConfigured();

  const [payment] = await db.select().from(briefPayments).where(eq(briefPayments.id, paymentId)).limit(1);
  if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
  if (payment.status === "captured" || payment.status === "released") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Payment already captured" });
  }
  if (payment.status === "refunded" || payment.status === "failed") {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Payment is ${payment.status}` });
  }

  const [job] = await db.select().from(jobs).where(eq(jobs.id, payment.jobId)).limit(1);
  const successPath = `/jobs/${payment.jobId}/applicants?paid=ok&payment=${payment.id}`;
  const cancelPath = `/jobs/${payment.jobId}/applicants?paid=cancelled`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_intent_data: {
      metadata: {
        paymentId: payment.id,
        applicationId: payment.applicationId,
        jobId: payment.jobId,
        brandId: payment.brandId,
        kind: "brief_payment"
      }
    },
    line_items: [
      {
        price_data: {
          currency: payment.currency,
          product_data: {
            name: job?.title ? `Brief: ${job.title}` : "Brief payment",
            description: "Funds are held on Terrace until you confirm delivery."
          },
          unit_amount: payment.amountCents
        },
        quantity: 1
      }
    ],
    success_url: `${baseUrl}${successPath}`,
    cancel_url: `${baseUrl}${cancelPath}`,
    metadata: {
      paymentId: payment.id,
      kind: "brief_payment"
    }
  });

  if (!session.url) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe checkout session has no URL" });
  }

  await db
    .update(briefPayments)
    .set({
      status: "authorized",
      stripePaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));

  await writeAuditLog(db, {
    user,
    action: "brief_payment.checkout_create",
    entityType: "brief_payment",
    entityId: payment.id,
    metadata: { sessionId: session.id, amountCents: payment.amountCents }
  });

  return { paymentId: payment.id, checkoutUrl: session.url };
}

/**
 * Webhook entry — Stripe Checkout completed for a brief_payment session.
 * Flips status to 'captured'. We piggy-back on the brand-side
 * `checkout.session.completed` webhook by inspecting metadata.kind.
 */
export async function applyBriefCheckoutCompleted(db: Database, session: Stripe.Checkout.Session) {
  const paymentId = session.metadata?.paymentId;
  if (!paymentId) return;

  const [payment] = await db.select().from(briefPayments).where(eq(briefPayments.id, paymentId)).limit(1);
  if (!payment) {
    log.warn({ paymentId, sessionId: session.id }, "checkout.session.completed for unknown brief_payment");
    return;
  }
  if (payment.status === "captured" || payment.status === "released") return; // idempotent

  const intentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  await db
    .update(briefPayments)
    .set({
      status: "captured",
      stripePaymentIntentId: intentId ?? payment.stripePaymentIntentId,
      capturedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));

  await createNotification(db, {
    userId: await resolveCreatorUserId(db, payment.creatorId),
    type: "brief_payment.captured",
    actorId: null,
    entityType: "brief_payment",
    entityId: payment.id,
    email: {
      subject: "Brief funded — start delivering",
      text: `The brand paid for your brief. $${(payment.creatorPayoutCents / 100).toFixed(2)} will release to your Stripe account after delivery is confirmed.`
    }
  });

  log.info({ paymentId: payment.id, sessionId: session.id }, "brief_payment captured via checkout");
}

/**
 * @deprecated Use createBriefCheckoutSession for the hosted-page flow.
 * Kept for the Stripe Elements path in case we wire it later.
 */
export async function confirmBriefPayment(db: Database, user: User, _member: BrandMember, paymentId: string) {
  assertStripeConfigured();

  const [payment] = await db.select().from(briefPayments).where(eq(briefPayments.id, paymentId)).limit(1);
  if (!payment) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
  }
  if (payment.status === "captured" || payment.status === "released") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Payment already captured" });
  }
  if (payment.status === "refunded" || payment.status === "failed") {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Payment is ${payment.status}` });
  }

  // Idempotent: return existing intent if we already minted one.
  if (payment.stripePaymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
    return {
      paymentId: payment.id,
      clientSecret: intent.client_secret,
      amountCents: payment.amountCents,
      currency: payment.currency
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: payment.amountCents,
    currency: payment.currency,
    capture_method: "automatic",
    metadata: {
      paymentId: payment.id,
      applicationId: payment.applicationId,
      jobId: payment.jobId,
      brandId: payment.brandId
    }
  });

  await db
    .update(briefPayments)
    .set({
      stripePaymentIntentId: intent.id,
      status: "authorized",
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));

  await writeAuditLog(db, {
    user,
    action: "brief_payment.confirm",
    entityType: "brief_payment",
    entityId: payment.id,
    metadata: { stripePaymentIntentId: intent.id, amountCents: payment.amountCents }
  });

  return {
    paymentId: payment.id,
    clientSecret: intent.client_secret,
    amountCents: payment.amountCents,
    currency: payment.currency
  };
}

/**
 * Webhook entry — brand's card was charged successfully. Mark captured and
 * notify the creator that payment cleared (they'll get the funds when the
 * brand releases).
 */
export async function applyPaymentIntentSucceeded(db: Database, intent: Stripe.PaymentIntent) {
  const [payment] = await db
    .select()
    .from(briefPayments)
    .where(eq(briefPayments.stripePaymentIntentId, intent.id))
    .limit(1);
  if (!payment) {
    log.warn({ intentId: intent.id }, "payment_intent.succeeded for unknown intent");
    return;
  }
  if (payment.status === "captured" || payment.status === "released") return; // idempotent

  const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : (intent.latest_charge?.id ?? null);

  await db
    .update(briefPayments)
    .set({
      status: "captured",
      stripeChargeId: chargeId,
      capturedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));

  await createNotification(db, {
    userId: await resolveCreatorUserId(db, payment.creatorId),
    type: "brief_payment.captured",
    actorId: null,
    entityType: "brief_payment",
    entityId: payment.id,
    email: {
      subject: "Brief funded — start delivering",
      text: `The brand paid for your brief. $${(payment.creatorPayoutCents / 100).toFixed(2)} will release to your Stripe account after delivery is confirmed.`
    }
  });

  log.info({ paymentId: payment.id, intentId: intent.id }, "brief_payment captured");
}

export async function applyPaymentIntentFailed(db: Database, intent: Stripe.PaymentIntent) {
  const [payment] = await db
    .select()
    .from(briefPayments)
    .where(eq(briefPayments.stripePaymentIntentId, intent.id))
    .limit(1);
  if (!payment) return;
  await db
    .update(briefPayments)
    .set({
      status: "failed",
      failureReason: intent.last_payment_error?.message ?? "payment_failed",
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));
  log.warn({ paymentId: payment.id, reason: intent.last_payment_error?.message }, "brief_payment failed");
}

/**
 * Brand confirms delivery — release funds to creator's Connect account.
 * The brand must own the brief; we already enforce that at the router via
 * brandProcedure.
 */
export async function releaseBriefPayment(db: Database, user: User, _member: BrandMember, paymentId: string) {
  assertStripeConfigured();

  const [payment] = await db.select().from(briefPayments).where(eq(briefPayments.id, paymentId)).limit(1);
  if (!payment) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
  }
  if (payment.status !== "captured") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot release a payment in '${payment.status}' state`
    });
  }

  const [payoutAccount] = await db
    .select()
    .from(creatorPayoutAccounts)
    .where(eq(creatorPayoutAccounts.creatorId, payment.creatorId))
    .limit(1);

  if (!payoutAccount || payoutAccount.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Creator has not finished Stripe onboarding — they need to set up payouts first"
    });
  }

  const transfer = await stripe.transfers.create({
    amount: payment.creatorPayoutCents,
    currency: payment.currency,
    destination: payoutAccount.stripeAccountId,
    transfer_group: payment.id,
    metadata: {
      paymentId: payment.id,
      applicationId: payment.applicationId
    }
  });

  await db
    .update(briefPayments)
    .set({
      status: "released",
      stripeTransferId: transfer.id,
      releasedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));

  await writeAuditLog(db, {
    user,
    action: "brief_payment.release",
    entityType: "brief_payment",
    entityId: payment.id,
    metadata: { transferId: transfer.id, payoutCents: payment.creatorPayoutCents }
  });

  await createNotification(db, {
    userId: await resolveCreatorUserId(db, payment.creatorId),
    type: "brief_payment.released",
    actorId: user.id,
    entityType: "brief_payment",
    entityId: payment.id,
    email: {
      subject: "Funds released",
      text: `$${(payment.creatorPayoutCents / 100).toFixed(2)} is on its way to your bank. Stripe typically settles within 2-7 business days.`
    }
  });

  log.info({ paymentId: payment.id, transferId: transfer.id }, "brief_payment released to creator");
  return { paymentId: payment.id, transferId: transfer.id, payoutCents: payment.creatorPayoutCents };
}

/**
 * Brand refund. Only allowed before release — once funds are with the
 * creator, the brand has to dispute through Stripe directly.
 */
export async function refundBriefPayment(db: Database, user: User, _member: BrandMember, paymentId: string) {
  assertStripeConfigured();

  const [payment] = await db.select().from(briefPayments).where(eq(briefPayments.id, paymentId)).limit(1);
  if (!payment) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
  }
  if (payment.status !== "captured") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot refund a payment in '${payment.status}' state`
    });
  }

  if (!payment.stripePaymentIntentId) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Captured payment has no intent id" });
  }

  await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    reason: "requested_by_customer"
  });

  await db
    .update(briefPayments)
    .set({
      status: "refunded",
      refundedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(briefPayments.id, payment.id));

  await writeAuditLog(db, {
    user,
    action: "brief_payment.refund",
    entityType: "brief_payment",
    entityId: payment.id,
    metadata: { amountCents: payment.amountCents }
  });

  return { paymentId: payment.id };
}

export async function getBriefPaymentByApplication(db: Database, _user: User, applicationId: string) {
  const [row] = await db.select().from(briefPayments).where(eq(briefPayments.applicationId, applicationId)).limit(1);
  return row ?? null;
}

async function resolveCreatorUserId(db: Database, creatorId: string): Promise<string> {
  const [row] = await db.select({ userId: creators.userId }).from(creators).where(eq(creators.id, creatorId)).limit(1);
  if (!row) throw new Error(`Creator ${creatorId} missing`);
  return row.userId;
}

export type { BriefPayment, Creator };
