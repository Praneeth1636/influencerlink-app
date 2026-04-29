export type BillingAudience = "creator" | "brand";
export type QuotaMeter = "applications" | "jobsPosted" | "dmsSent" | "searchesRun";

export type PlanQuota = Record<QuotaMeter, number | null>;

export type BillingPlanDefinition = {
  id: string;
  name: string;
  audience: BillingAudience;
  priceCents: number;
  interval: "month" | "year" | "custom";
  description: string;
  quotas: PlanQuota;
  features: string[];
};

export const CREATOR_FREE_PLAN: BillingPlanDefinition = {
  id: "creator-free",
  name: "Creator Free",
  audience: "creator",
  priceCents: 0,
  interval: "month",
  description: "Start a verified creator profile and apply to a few briefs.",
  quotas: {
    applications: 5,
    jobsPosted: 0,
    dmsSent: null,
    searchesRun: 20
  },
  features: ["Profile", "Feed posting", "Reply to DMs", "5 job applications/month"]
};

export const BRAND_FREE_PLAN: BillingPlanDefinition = {
  id: "brand-free",
  name: "Brand Free",
  audience: "brand",
  priceCents: 0,
  interval: "month",
  description: "Validate creator discovery before upgrading the hiring motion.",
  quotas: {
    applications: 0,
    jobsPosted: 1,
    dmsSent: 5,
    searchesRun: 5
  },
  features: ["Company page", "1 active brief/month", "5 first-contact DMs/month", "Basic search"]
};

export const BILLING_PLANS: BillingPlanDefinition[] = [
  CREATOR_FREE_PLAN,
  {
    id: "creator-pro",
    name: "Creator Pro",
    audience: "creator",
    priceCents: 1_900,
    interval: "month",
    description: "Unlock unlimited applications and creator growth analytics.",
    quotas: {
      applications: null,
      jobsPosted: 0,
      dmsSent: null,
      searchesRun: 100
    },
    features: ["Unlimited applications", "Who viewed your profile", "Advanced analytics", "Featured search boost"]
  },
  {
    id: "creator-pro-plus",
    name: "Creator Pro+",
    audience: "creator",
    priceCents: 4_900,
    interval: "month",
    description: "Priority creator tooling for serious brand partnerships.",
    quotas: {
      applications: null,
      jobsPosted: 0,
      dmsSent: null,
      searchesRun: 250
    },
    features: ["Everything in Pro", "Priority support", "Verified fast-track", "AI message drafting"]
  },
  BRAND_FREE_PLAN,
  {
    id: "brand-growth",
    name: "Brand Growth",
    audience: "brand",
    priceCents: 9_900,
    interval: "month",
    description: "Run active creator hiring with useful limits for a small team.",
    quotas: {
      applications: 0,
      jobsPosted: 10,
      dmsSent: 100,
      searchesRun: null
    },
    features: ["10 briefs/month", "100 DMs/month", "Full search filters", "Saved searches"]
  },
  {
    id: "brand-scale",
    name: "Brand Scale",
    audience: "brand",
    priceCents: 49_900,
    interval: "month",
    description: "Scale creator hiring across a brand team.",
    quotas: {
      applications: 0,
      jobsPosted: null,
      dmsSent: 1_000,
      searchesRun: null
    },
    features: ["Unlimited briefs", "1000 DMs/month", "AI brief matching", "10 team seats"]
  },
  {
    id: "brand-enterprise",
    name: "Brand Enterprise",
    audience: "brand",
    priceCents: 0,
    interval: "custom",
    description: "Custom governance and support for enterprise creator programs.",
    quotas: {
      applications: 0,
      jobsPosted: null,
      dmsSent: null,
      searchesRun: null
    },
    features: ["SSO/SAML", "Audit exports", "Custom SLA", "Dedicated support"]
  }
];

export function getFreePlanForAudience(audience: BillingAudience) {
  return audience === "creator" ? CREATOR_FREE_PLAN : BRAND_FREE_PLAN;
}

export function findPlanByName(name: string, audience: BillingAudience) {
  return (
    BILLING_PLANS.find((plan) => plan.audience === audience && plan.name.toLowerCase() === name.toLowerCase()) ??
    getFreePlanForAudience(audience)
  );
}

export function formatPlanPrice(plan: Pick<BillingPlanDefinition, "priceCents" | "interval">) {
  if (plan.interval === "custom") {
    return "Custom";
  }

  if (plan.priceCents === 0) {
    return "Free";
  }

  return `$${Math.round(plan.priceCents / 100).toLocaleString()}/${plan.interval}`;
}

export function getQuotaLimit(plan: Pick<BillingPlanDefinition, "quotas">, meter: QuotaMeter) {
  return plan.quotas[meter];
}
