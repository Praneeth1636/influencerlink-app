// Stripe Connect helpers — Express accounts only. Express is the right tier
// for solo creators: Stripe owns the KYC + tax form UX, we own the payment
// flow on top. Standard accounts force creators into a full Stripe dashboard
// (overkill); Custom requires us to build the dashboard (huge scope).

import type Stripe from "stripe";
import { stripe } from "./client";

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe Connect not configured — set STRIPE_SECRET_KEY");
    this.name = "StripeNotConfiguredError";
  }
}

function assertConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new StripeNotConfiguredError();
  }
}

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Create a Stripe Express Connect account for a creator. Idempotent at the
 * caller level — service layer checks for an existing row before this is
 * invoked. Returns the Stripe account id; persist it before redirecting the
 * creator into onboarding.
 */
export async function createExpressAccount(input: { email: string; country?: string }): Promise<Stripe.Account> {
  assertConfigured();
  return stripe.accounts.create({
    type: "express",
    country: input.country ?? "US",
    email: input.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    business_type: "individual",
    settings: {
      payouts: { schedule: { interval: "weekly", weekly_anchor: "monday" } }
    }
  });
}

/**
 * Generate a one-time onboarding link. The creator clicks → Stripe walks
 * them through KYC + bank account + tax form → returns to our `return_url`.
 * `refresh_url` fires if the link expires before they finish.
 */
export async function createOnboardingLink(stripeAccountId: string): Promise<Stripe.AccountLink> {
  assertConfigured();
  return stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${baseUrl()}/api/stripe/connect/start`,
    return_url: `${baseUrl()}/creator?payout=ok`,
    type: "account_onboarding"
  });
}

/**
 * After onboarding completes, this builds a temporary Express dashboard URL
 * so creators can update their bank account, view payouts, etc. without us
 * having to render any of that UI.
 */
export async function createLoginLink(stripeAccountId: string): Promise<Stripe.LoginLink> {
  assertConfigured();
  return stripe.accounts.createLoginLink(stripeAccountId);
}

export async function retrieveAccount(stripeAccountId: string): Promise<Stripe.Account> {
  assertConfigured();
  return stripe.accounts.retrieve(stripeAccountId);
}

/**
 * Roll up Stripe's three booleans into our coarse status enum. Called both
 * during the explicit `payout.status` query and from the `account.updated`
 * webhook so the DB stays in sync with Stripe.
 */
export function rollupStatus(
  account: Pick<Stripe.Account, "details_submitted" | "charges_enabled" | "payouts_enabled" | "requirements">
): "pending" | "onboarding" | "active" | "restricted" {
  const ds = Boolean(account.details_submitted);
  const ce = Boolean(account.charges_enabled);
  const pe = Boolean(account.payouts_enabled);
  if (ce && pe) return "active";
  if (account.requirements?.disabled_reason) return "restricted";
  if (ds) return "onboarding";
  return "pending";
}
