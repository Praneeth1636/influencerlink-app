import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
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
  findPlanByName,
  formatPlanPrice,
  getFreePlanForAudience,
  getQuotaLimit,
  type BillingAudience,
  type BillingPlanDefinition,
  type QuotaMeter
} from "@/lib/billing/plans";
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
  ownerLabel: string;
  plan: BillingPlanDefinition;
  priceLabel: string;
  usage: UsageLine[];
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
    ownerLabel: scope.user.email,
    plan: getFreePlanForAudience(scope.user.type === "brand_member" ? "brand" : "creator"),
    usage: getZeroUsage()
  });
}

async function getCreatorSummary(db: Database, user: User) {
  const [creator] = await db.select().from(creators).where(eq(creators.userId, user.id)).limit(1);

  if (!creator) {
    return null;
  }

  return buildAccountSummary({
    audience: "creator",
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
  ownerLabel: string;
  plan: BillingPlanDefinition;
  usage: Record<QuotaMeter, number>;
}): BillingAccountSummary {
  return {
    audience: input.audience,
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
