// Creator payout service. Owns the lifecycle of a creator's Stripe Connect
// Express account: create, fetch onboarding link, sync status from webhook,
// hand back an Express dashboard login link.

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { creatorPayoutAccounts, creators, users, type Creator, type User } from "@/lib/db/schema";
import {
  createExpressAccount,
  createLoginLink,
  createOnboardingLink,
  retrieveAccount,
  rollupStatus,
  StripeNotConfiguredError
} from "@/lib/stripe/connect";
import { logger } from "@/lib/logger";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

const log = logger.child({ module: "payout-service" });

/**
 * Returns the creator's payout account, creating one in Stripe + DB if it
 * doesn't exist yet. Always idempotent — calling twice is fine.
 */
export async function ensurePayoutAccount(db: Database, user: User, creator: Creator) {
  const [existing] = await db
    .select()
    .from(creatorPayoutAccounts)
    .where(eq(creatorPayoutAccounts.creatorId, creator.id))
    .limit(1);

  if (existing) return existing;

  const account = await createExpressAccount({ email: user.email, country: "US" });

  const [created] = await db
    .insert(creatorPayoutAccounts)
    .values({
      creatorId: creator.id,
      stripeAccountId: account.id,
      country: account.country ?? "US",
      defaultCurrency: account.default_currency ?? "usd",
      status: "pending"
    })
    .returning();

  if (!created) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to persist payout account" });
  }

  await writeAuditLog(db, {
    user,
    action: "payout.account_created",
    entityType: "creator_payout_account",
    entityId: created.id,
    metadata: { stripeAccountId: account.id }
  });

  return created;
}

/**
 * Build the URL that drops the creator into Stripe Express onboarding.
 * Caller redirects to it. Links are single-use; generate a fresh one each
 * time (Stripe's pattern, not ours).
 */
export async function startOnboarding(db: Database, user: User, creator: Creator) {
  const account = await ensurePayoutAccount(db, user, creator);
  const link = await createOnboardingLink(account.stripeAccountId);
  return { url: link.url, accountId: account.id };
}

/**
 * One-shot status sync. Cheap call, used by the tRPC `status` query so the
 * UI never shows stale state if the webhook is late or never fired.
 */
export async function syncAccountStatus(db: Database, stripeAccountId: string) {
  const remote = await retrieveAccount(stripeAccountId);
  const status = rollupStatus(remote);

  await db
    .update(creatorPayoutAccounts)
    .set({
      detailsSubmitted: Boolean(remote.details_submitted),
      chargesEnabled: Boolean(remote.charges_enabled),
      payoutsEnabled: Boolean(remote.payouts_enabled),
      status,
      defaultCurrency: remote.default_currency ?? "usd",
      updatedAt: new Date()
    })
    .where(eq(creatorPayoutAccounts.stripeAccountId, stripeAccountId));

  log.info({ stripeAccountId, status }, "payout account synced");
  return status;
}

/**
 * Webhook entry point — Stripe POSTs `account.updated` whenever Connect state
 * changes (KYC done, capabilities flipped, etc.). We accept whichever Stripe
 * type the webhook handler hands us and re-run rollup against the live row.
 */
export async function applyAccountUpdate(
  db: Database,
  account: {
    id: string;
    details_submitted?: boolean | null;
    charges_enabled?: boolean | null;
    payouts_enabled?: boolean | null;
    requirements?: { disabled_reason?: string | null } | null;
    default_currency?: string | null;
  }
) {
  // rollupStatus reads only the boolean-coerced fields; Stripe types are
  // non-null but the webhook payload type uses `?` — coerce to satisfy both.
  const status = rollupStatus({
    details_submitted: Boolean(account.details_submitted),
    charges_enabled: Boolean(account.charges_enabled),
    payouts_enabled: Boolean(account.payouts_enabled),
    requirements: account.requirements ? { disabled_reason: account.requirements.disabled_reason ?? null } : null
  } as Parameters<typeof rollupStatus>[0]);
  await db
    .update(creatorPayoutAccounts)
    .set({
      detailsSubmitted: Boolean(account.details_submitted),
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      status,
      defaultCurrency: account.default_currency ?? "usd",
      updatedAt: new Date()
    })
    .where(eq(creatorPayoutAccounts.stripeAccountId, account.id));
  log.info({ stripeAccountId: account.id, status }, "payout account webhook applied");
}

/**
 * One-shot Stripe Express dashboard URL. Creators use this to update their
 * bank account, see scheduled payouts, etc. We don't store it — these expire
 * fast.
 */
export async function getDashboardLink(db: Database, _user: User, creator: Creator) {
  const [row] = await db
    .select()
    .from(creatorPayoutAccounts)
    .where(eq(creatorPayoutAccounts.creatorId, creator.id))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "No payout account on file" });
  }
  if (row.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Finish Stripe onboarding before opening the dashboard"
    });
  }
  const link = await createLoginLink(row.stripeAccountId);
  return { url: link.url };
}

/** Look up a payout account by clerkId — used by the post-onboarding callback. */
export async function findByClerkId(db: Database, clerkId: string) {
  const [row] = await db
    .select({
      account: creatorPayoutAccounts,
      user: users,
      creator: creators
    })
    .from(creatorPayoutAccounts)
    .innerJoin(creators, eq(creators.id, creatorPayoutAccounts.creatorId))
    .innerJoin(users, eq(users.id, creators.userId))
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return row ?? null;
}

export { StripeNotConfiguredError };
