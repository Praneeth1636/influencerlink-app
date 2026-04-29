import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import type Stripe from "stripe";
import {
  brandMembers,
  brands,
  creators,
  jobApplications,
  jobs,
  messages,
  searches,
  subscriptionPlans,
  subscriptions,
  type Creator,
  type User
} from "@/lib/db/schema";
import {
  BILLING_PLANS,
  type BillingAudience,
  type BillingPlanDefinition,
  findPlanByName,
  formatPlanPrice,
  getFreePlanForAudience,
  getQuotaLimit,
  type QuotaMeter
} from "@/lib/billing/plans";
import { stripe } from "@/lib/stripe/client";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type BillingScope = {
  user: User;
  creator?: Creator;
  brandId?: string;
};

export type UsageLine = {
  meter: QuotaMeter;
  label: string;
  used: number;
  limit: number | null;
};

export type BillingAccountSummary = {
  audience: BillingAudience;
  accountId: string;
  ownerLabel: string;
  plan: BillingPlanDefinition;
  priceLabel: string;
  usage: UsageLine[];
};

export type CheckoutInput = {
  planId: string;
  audience: BillingAudience;
  brandId?: string;
  origin: string;
};

const meteredLabels: Record<QuotaMeter, string> = {
  applications: "Applications",
  jobsPosted: "Briefs posted",
  dmsSent: "DMs sent",
  searchesRun: "Searches run"
};

export async function assertQuotaAvailable(db: Database, scope: BillingScope, meter: QuotaMeter) {
  const summary = await getMeteredSummary(db, scope);
  const usage = summary.usage.find((line) => line.meter === meter);

  if (!usage || usage.limit === null || usage.used < usage.limit) {
    return;
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: `${usage.label} limit reached on ${summary.plan.name}. Upgrade to keep going.`
  });
}

export async function recordSearchRun(
  db: Database,
  user: User,
  input: {
    query?: string;
    filters?: Record<string, unknown>;
  }
) {
  await db.insert(searches).values({
    userId: user.id,
    query: input.query,
    filters: input.filters ?? {}
  });

  await writeAuditLog(db, {
    user,
    action: "billing.search_metered",
    entityType: "search",
    metadata: {
      query: input.query ?? null,
      filters: input.filters ?? {}
    }
  });
}

export async function getBillingSummary(db: Database, user: User, input: { brandId?: string } = {}) {
  const creatorSummary = await getCreatorSummary(db, user);
  const brandSummary = await getBrandSummary(db, user, input.brandId);

  return {
    creator: creatorSummary,
    brand: brandSummary,
    plans: BILLING_PLANS
  };
}

export async function createCheckoutSession(db: Database, user: User, input: CheckoutInput) {
  const plan = getPaidPlan(input.planId, input.audience);
  const account = await getCheckoutAccount(db, user, input);
  const metadata = {
    userId: account.userId ?? "",
    brandId: account.brandId ?? "",
    planId: plan.id,
    planName: plan.name,
    audience: plan.audience
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: account.brandId ?? account.userId,
    success_url: `${input.origin}/settings/billing?checkout=success`,
    cancel_url: `${input.origin}/settings/billing?checkout=cancelled`,
    metadata,
    subscription_data: {
      metadata
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.priceCents,
          recurring: {
            interval: plan.interval === "year" ? "year" : "month"
          },
          product_data: {
            name: plan.name,
            description: plan.description,
            metadata: {
              planId: plan.id,
              audience: plan.audience
            }
          }
        }
      }
    ]
  });

  await writeAuditLog(db, {
    user,
    action: "billing.checkout.create",
    entityType: "subscription",
    metadata: {
      planId: plan.id,
      audience: plan.audience,
      brandId: account.brandId ?? null,
      stripeSessionId: session.id
    }
  });

  if (!session.url) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe checkout session did not return a URL"
    });
  }

  return {
    url: session.url
  };
}

export async function createCustomerPortalSession(
  db: Database,
  user: User,
  input: {
    brandId?: string;
    origin: string;
  }
) {
  const summary = input.brandId ? await getBrandSummary(db, user, input.brandId) : await getCreatorSummary(db, user);

  if (!summary) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No billing account found for this portal request"
    });
  }

  const [subscriptionRow] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        inArray(subscriptions.status, ["active", "trialing", "past_due", "unpaid"]),
        input.brandId ? eq(subscriptions.brandId, input.brandId) : eq(subscriptions.userId, user.id)
      )
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  if (!subscriptionRow) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No active Stripe subscription found"
    });
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionRow.stripeSubscriptionId);
  const customerId = getCustomerId(subscription.customer);

  if (!customerId) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Stripe subscription has no customer id"
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${input.origin}/settings/billing`
  });

  await writeAuditLog(db, {
    user,
    action: "billing.portal.create",
    entityType: "subscription",
    entityId: subscriptionRow.id,
    metadata: {
      stripeSubscriptionId: subscriptionRow.stripeSubscriptionId
    }
  });

  return {
    url: session.url
  };
}

export async function syncStripeSubscription(db: Database, stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const metadata = subscription.metadata;
  const audience = parseAudience(metadata.audience);
  const plan = findPlanByName(metadata.planName ?? "", audience);
  const planRow = await ensureSubscriptionPlan(db, plan);
  const status = mapStripeSubscriptionStatus(subscription.status);
  const currentPeriodEnd = getStripeSubscriptionPeriodEnd(subscription);
  const values = {
    userId: metadata.userId || null,
    brandId: metadata.brandId || null,
    planId: planRow.id,
    stripeSubscriptionId: subscription.id,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: new Date()
  };

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set(values)
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db.insert(subscriptions).values(values).returning();

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to sync Stripe subscription"
    });
  }

  return created;
}

export async function syncCheckoutSession(db: Database, session: Stripe.Checkout.Session) {
  const subscriptionId = getSubscriptionId(session.subscription);

  if (!subscriptionId) {
    return null;
  }

  return syncStripeSubscription(db, subscriptionId);
}

export async function markStripeSubscriptionPastDue(db: Database, stripeSubscriptionId: string) {
  const [updated] = await db
    .update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date()
    })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .returning();

  return updated ?? null;
}

async function getMeteredSummary(db: Database, scope: BillingScope) {
  if (scope.brandId) {
    const summary = await getBrandSummary(db, scope.user, scope.brandId);
    if (!summary) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Brand billing scope required"
      });
    }

    return summary;
  }

  if (scope.creator) {
    return buildAccountSummary({
      audience: "creator",
      accountId: scope.creator.id,
      ownerLabel: scope.creator.displayName,
      plan: await getEffectivePlan(db, "creator", { userId: scope.user.id }),
      usage: await getCreatorUsage(db, scope.creator, scope.user)
    });
  }

  if (scope.user.type === "brand_member") {
    const summary = await getBrandSummary(db, scope.user);
    if (summary) {
      return summary;
    }
  }

  return buildAccountSummary({
    audience: scope.user.type === "brand_member" ? "brand" : "creator",
    accountId: scope.user.id,
    ownerLabel: scope.user.email,
    plan: getFreePlanForAudience(scope.user.type === "brand_member" ? "brand" : "creator"),
    usage: getZeroUsage()
  });
}

async function getCheckoutAccount(db: Database, user: User, input: CheckoutInput) {
  if (input.audience === "creator") {
    const summary = await getCreatorSummary(db, user);

    if (!summary) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Creator billing account required"
      });
    }

    return {
      userId: user.id,
      brandId: undefined
    };
  }

  if (!input.brandId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "brandId is required for brand checkout"
    });
  }

  const summary = await getBrandSummary(db, user, input.brandId);

  if (!summary) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Brand billing account required"
    });
  }

  return {
    userId: undefined,
    brandId: input.brandId
  };
}

async function getCreatorSummary(db: Database, user: User) {
  const [creator] = await db.select().from(creators).where(eq(creators.userId, user.id)).limit(1);

  if (!creator) {
    return null;
  }

  return buildAccountSummary({
    audience: "creator",
    accountId: creator.id,
    ownerLabel: creator.displayName,
    plan: await getEffectivePlan(db, "creator", { userId: user.id }),
    usage: await getCreatorUsage(db, creator, user)
  });
}

async function getBrandSummary(db: Database, user: User, requestedBrandId?: string) {
  const filters = [
    eq(brandMembers.userId, user.id),
    requestedBrandId ? eq(brandMembers.brandId, requestedBrandId) : undefined
  ].filter(Boolean);

  const [membership] = await db
    .select({
      brand: brands,
      member: brandMembers
    })
    .from(brandMembers)
    .innerJoin(brands, eq(brands.id, brandMembers.brandId))
    .where(and(...filters))
    .orderBy(desc(brandMembers.joinedAt))
    .limit(1);

  if (!membership) {
    return null;
  }

  return buildAccountSummary({
    audience: "brand",
    accountId: membership.brand.id,
    ownerLabel: membership.brand.name,
    plan: await getEffectivePlan(db, "brand", { brandId: membership.brand.id }),
    usage: await getBrandUsage(db, membership.brand.id, user)
  });
}

async function getEffectivePlan(
  db: Database,
  audience: BillingAudience,
  scope: {
    userId?: string;
    brandId?: string;
  }
) {
  const filters = [
    inArray(subscriptions.status, ["active", "trialing"]),
    audience === "creator" && scope.userId ? eq(subscriptions.userId, scope.userId) : undefined,
    audience === "brand" && scope.brandId ? eq(subscriptions.brandId, scope.brandId) : undefined
  ].filter(Boolean);

  const [active] = await db
    .select({
      plan: subscriptionPlans
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptionPlans.id, subscriptions.planId))
    .where(and(...filters))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return active ? findPlanByName(active.plan.name, audience) : getFreePlanForAudience(audience);
}

async function getCreatorUsage(db: Database, creator: Creator, user: User) {
  const periodStart = getCurrentPeriodStart();
  const [applications, searchesRun] = await Promise.all([
    countRows(
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobApplications)
        .where(and(eq(jobApplications.creatorId, creator.id), gte(jobApplications.createdAt, periodStart)))
    ),
    countRows(
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(searches)
        .where(and(eq(searches.userId, user.id), gte(searches.createdAt, periodStart)))
    )
  ]);

  return {
    applications,
    jobsPosted: 0,
    dmsSent: 0,
    searchesRun
  };
}

async function getBrandUsage(db: Database, brandId: string, user: User) {
  const periodStart = getCurrentPeriodStart();
  const [jobsPosted, dmsSent, searchesRun] = await Promise.all([
    countRows(
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(and(eq(jobs.brandId, brandId), gte(jobs.createdAt, periodStart)))
    ),
    countRows(
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(and(eq(messages.senderId, user.id), gte(messages.createdAt, periodStart)))
    ),
    countRows(
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(searches)
        .where(and(eq(searches.userId, user.id), gte(searches.createdAt, periodStart)))
    )
  ]);

  return {
    applications: 0,
    jobsPosted,
    dmsSent,
    searchesRun
  };
}

function buildAccountSummary(input: {
  audience: BillingAudience;
  accountId: string;
  ownerLabel: string;
  plan: BillingPlanDefinition;
  usage: Record<QuotaMeter, number>;
}): BillingAccountSummary {
  return {
    audience: input.audience,
    accountId: input.accountId,
    ownerLabel: input.ownerLabel,
    plan: input.plan,
    priceLabel: formatPlanPrice(input.plan),
    usage: Object.entries(input.usage).map(([meter, used]) => ({
      meter: meter as QuotaMeter,
      label: meteredLabels[meter as QuotaMeter],
      used,
      limit: getQuotaLimit(input.plan, meter as QuotaMeter)
    }))
  };
}

function getZeroUsage(): Record<QuotaMeter, number> {
  return {
    applications: 0,
    jobsPosted: 0,
    dmsSent: 0,
    searchesRun: 0
  };
}

async function countRows(query: Promise<Array<{ count: number }>>) {
  const [row] = await query;
  return row?.count ?? 0;
}

function getCurrentPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
}

function getPaidPlan(planId: string, audience: BillingAudience) {
  const plan = BILLING_PLANS.find((candidate) => candidate.id === planId && candidate.audience === audience);

  if (!plan || plan.priceCents <= 0 || plan.interval === "custom") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select a paid self-serve plan"
    });
  }

  return plan;
}

async function ensureSubscriptionPlan(db: Database, plan: BillingPlanDefinition) {
  const [existing] = await db
    .select()
    .from(subscriptionPlans)
    .where(and(eq(subscriptionPlans.name, plan.name), eq(subscriptionPlans.audience, plan.audience)))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(subscriptionPlans)
    .values({
      name: plan.name,
      audience: plan.audience,
      priceCents: plan.priceCents,
      interval: plan.interval === "year" ? "year" : "month",
      features: {
        planId: plan.id,
        quotas: plan.quotas,
        features: plan.features
      }
    })
    .returning();

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to create subscription plan"
    });
  }

  return created;
}

function parseAudience(value: string | undefined): BillingAudience {
  return value === "brand" ? "brand" : "creator";
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): "incomplete" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "unpaid":
      return status;
    default:
      return "incomplete";
  }
}

function getStripeSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  return typeof periodEnd === "number" ? new Date(periodEnd * 1000) : null;
}

function getSubscriptionId(value: string | Stripe.Subscription | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function getCustomerId(value: string | Stripe.Customer | Stripe.DeletedCustomer) {
  return typeof value === "string" ? value : value.id;
}
