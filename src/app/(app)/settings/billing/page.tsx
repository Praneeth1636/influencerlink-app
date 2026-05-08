import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, Gauge, LockKeyhole, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BILLING_PLANS, BRAND_FREE_PLAN, CREATOR_FREE_PLAN, formatPlanPrice } from "@/lib/billing/plans";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import type { BillingAccountSummary } from "@/server/services/billing-service";
import { CheckoutButton, CustomerPortalButton } from "./billing-actions";

export default async function BillingSettingsPage() {
  const summary = await getSummary();
  const accounts = [summary.creator, summary.brand].filter(isBillingAccountSummary);
  const brandAccountId = summary.brand?.accountId;

  return (
    <main className="mx-auto grid max-w-[1180px] gap-6 px-5 py-8">
      <section className="border-border bg-muted/30 rounded-3xl border p-6 shadow-2xl shadow-black/20">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
              <BadgeDollarSign className="mr-2 h-3.5 w-3.5" />
              Billing MVP
            </Badge>
            <h1 className="mt-5 max-w-3xl text-[clamp(34px,6vw,64px)] leading-[0.96] font-black tracking-[-0.06em]">
              Turn Terrace into a paid marketplace.
            </h1>
            <p className="text-foreground/55 mt-4 max-w-2xl text-sm leading-7">
              Free plans now have real server-side limits for creator applications, brand briefs, DMs, and creator
              searches. Stripe checkout comes next; this phase makes the product enforce value before payment wiring.
            </p>
          </div>

          <div className="border-primary/25 bg-primary/10 rounded-2xl border p-5">
            <p className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">Paywall levers</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Creator apps" value="5 free" />
              <Metric label="Brand DMs" value="5 free" />
              <Metric label="Briefs" value="1 free" />
              <Metric label="Searches" value="5 free" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountUsageCard account={account} key={`${account.audience}-${account.ownerLabel}`} />
          ))
        ) : (
          <div className="border-border bg-card rounded-xl border p-6">
            <p className="text-lg font-black">No billing profile yet</p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Finish creator or brand onboarding to activate plan tracking.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">Plan catalog</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.045em]">Upgrade paths</h2>
          </div>
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary hidden rounded-xl border px-4 py-2 text-sm font-bold transition sm:inline-flex"
            href="/contact"
          >
            Talk to sales
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {BILLING_PLANS.map((plan) => (
            <article
              className="border-border bg-card hover:border-primary/35 rounded-xl border p-5 transition"
              key={plan.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs font-black tracking-[0.18em] uppercase">
                    {plan.audience}
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-[-0.035em]">{plan.name}</h3>
                </div>
                <p className="bg-muted/40 text-foreground/68 rounded-full px-3 py-1 text-xs font-black">
                  {formatPlanPrice(plan)}
                </p>
              </div>
              <p className="text-muted-foreground mt-3 min-h-12 text-sm leading-6">{plan.description}</p>
              <ul className="border-border mt-4 grid gap-2 border-t pt-4">
                {plan.features.slice(0, 4).map((feature) => (
                  <li className="text-muted-foreground flex items-center gap-2 text-sm" key={feature}>
                    <Sparkles className="text-primary h-3.5 w-3.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.priceCents > 0 && plan.interval !== "custom" ? (
                <div className="mt-5">
                  <CheckoutButton
                    audience={plan.audience}
                    brandId={plan.audience === "brand" ? brandAccountId : undefined}
                    planId={plan.id}
                  />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

async function getSummary() {
  try {
    const caller = await createTRPCServerCaller();
    return await caller.billing.summary({});
  } catch {
    return {
      creator: buildFallbackAccount("creator", "Sara Rivera"),
      brand: buildFallbackAccount("brand", "Glossier"),
      plans: BILLING_PLANS
    };
  }
}

function buildFallbackAccount(audience: "creator" | "brand", ownerLabel: string): BillingAccountSummary {
  const plan = audience === "creator" ? CREATOR_FREE_PLAN : BRAND_FREE_PLAN;

  return {
    audience,
    accountId: audience === "creator" ? "seed-creator" : "seed-brand",
    ownerLabel,
    plan,
    priceLabel: formatPlanPrice(plan),
    usage: [
      {
        meter: "applications",
        label: "Applications",
        used: audience === "creator" ? 3 : 0,
        limit: plan.quotas.applications
      },
      {
        meter: "jobsPosted",
        label: "Briefs posted",
        used: audience === "brand" ? 1 : 0,
        limit: plan.quotas.jobsPosted
      },
      { meter: "dmsSent", label: "DMs sent", used: audience === "brand" ? 4 : 0, limit: plan.quotas.dmsSent },
      {
        meter: "searchesRun",
        label: "Searches run",
        used: audience === "brand" ? 3 : 8,
        limit: plan.quotas.searchesRun
      }
    ]
  };
}

function AccountUsageCard({ account }: { account: BillingAccountSummary }) {
  return (
    <article className="border-border bg-card rounded-xl border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">
            {account.audience} billing
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.045em]">{account.ownerLabel}</h2>
        </div>
        <div className="border-primary/25 bg-primary/10 rounded-2xl border px-4 py-3 text-right">
          <p className="text-primary text-sm font-black">{account.plan.name}</p>
          <p className="text-foreground/45 mt-1 text-xs font-bold">{account.priceLabel}</p>
        </div>
      </div>

      <div className="mt-5">
        <CustomerPortalButton brandId={account.audience === "brand" ? account.accountId : undefined} />
      </div>

      <div className="mt-6 grid gap-4">
        {account.usage.map((line) => (
          <UsageLine key={line.meter} label={line.label} limit={line.limit} used={line.used} />
        ))}
      </div>
    </article>
  );
}

function UsageLine({ label, limit, used }: { label: string; limit: number | null; used: number }) {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 18;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gauge className="text-primary h-4 w-4" />
          <p className="text-foreground/78 text-sm font-black">{label}</p>
        </div>
        <p className="text-muted-foreground text-xs font-bold">
          {limit === null ? `${used} / unlimited` : `${used} / ${limit}`}
        </p>
      </div>
      <div className="bg-muted/40 h-2 rounded-full">
        <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
      {limit !== null && used >= limit ? (
        <p className="text-primary flex items-center gap-2 text-xs font-bold">
          <LockKeyhole className="h-3.5 w-3.5" />
          Limit reached. Upgrade to continue.
        </p>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-muted/30 rounded-xl border p-3">
      <p className="text-lg font-black tracking-[-0.04em]">{value}</p>
      <p className="text-muted-foreground mt-1 text-[11px] font-bold">{label}</p>
    </div>
  );
}

function isBillingAccountSummary(account: BillingAccountSummary | null): account is BillingAccountSummary {
  return account !== null;
}
