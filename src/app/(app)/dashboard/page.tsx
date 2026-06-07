// Brand-side dashboard. Creators land on /feed (sidebar already routes them
// there); brands land here. Renders inside the (app) AppShell — sidebar
// chrome is already there, so we only own the page body.

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { resolveAppRole } from "@/lib/auth/role";
import { createTRPCServerCaller } from "@/lib/trpc/server";

function formatDeadline(iso: string | null) {
  if (!iso) return "No deadline";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

function formatSpend(cents: number) {
  if (cents >= 100_000) return `$${(cents / 100_000).toFixed(1)}k`;
  return `$${(cents / 100).toLocaleString()}`;
}

export default async function DashboardPage() {
  const role = await resolveAppRole();
  if (role === "creator" && process.env.NODE_ENV === "production") redirect("/feed");

  const caller = await createTRPCServerCaller();
  const memberships = await caller.brand.myMemberships().catch(() => []);
  const primaryBrandId = memberships[0]?.brand?.id ?? null;
  const data = primaryBrandId ? await caller.brand.dashboard({ brandId: primaryBrandId }).catch(() => null) : null;

  const activeCampaigns = data?.activeCampaigns ?? [];
  const shortlisted = data?.shortlisted ?? [];
  const recentMessages = data?.recentMessages ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const stats = data?.stats ?? { activeCampaigns: 0, totalApplicants: 0, shortlisted: 0, totalSpendCents: 0 };

  return (
    <main className="bg-white text-[#37352f]">
      <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-10">
        {/* Header — Notion-flat: plain title, hairline rule, no floating card. */}
        <header className="creatorlink-animate-in flex flex-col gap-4 border-b border-[#ededec] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[#37352f] sm:text-[30px]">Dashboard</h1>
            <p className="mt-1 text-sm text-[#787774]">Campaigns, applicants, messages, and spend in one view.</p>
          </div>
          <Link
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#37352f] px-4 text-sm font-medium text-white transition-colors hover:bg-[#262420]"
            href="/jobs/new"
          >
            <Plus className="h-4 w-4" />
            Create campaign
          </Link>
        </header>

        {/* Summary bar — one cohesive object, divided. Flat, hairline borders. */}
        <section className="creatorlink-animate-in creatorlink-delay-1 mt-6 grid grid-cols-2 divide-y divide-[#ededec] overflow-hidden rounded-lg border border-[#e9e9e7] bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <StatCell label="Active campaigns" value={String(stats.activeCampaigns)} />
          <StatCell label="Total applicants" value={String(stats.totalApplicants)} />
          <StatCell label="Shortlisted" value={String(stats.shortlisted)} />
          <StatCell label="Total spend" value={formatSpend(stats.totalSpendCents)} accent />
        </section>

        <div className="creatorlink-animate-in creatorlink-delay-2 mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-9">
            <section>
              <SectionHeader title="Active campaigns" href="/jobs" />
              {activeCampaigns.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeCampaigns.map((campaign) => (
                    <CampaignPanel key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              ) : (
                <EmptyShell
                  title="No active campaigns"
                  body="Post your first brief. Verified creators start applying within hours."
                  ctaHref="/jobs/new"
                  ctaLabel="Create campaign"
                />
              )}
            </section>

            <section>
              <SectionHeader title="Shortlisted creators" href="/applications" />
              {shortlisted.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {shortlisted.map((creator) => (
                    <CreatorPanel key={creator.id} creator={creator} />
                  ))}
                </div>
              ) : (
                <EmptyShell
                  title="No shortlist yet"
                  body="Move applicants to your shortlist from any brief's applicant view."
                  ctaHref="/jobs"
                  ctaLabel="Review applicants"
                />
              )}
            </section>
          </div>

          {/* Right rail */}
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-lg border border-[#e9e9e7] bg-white">
              <RailHeader title="Messages" href="/messages" />
              <div className="px-2 pb-2">
                {recentMessages.length ? (
                  recentMessages.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/messages/${thread.id}`}
                      className="group flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-[#f7f7f5]"
                    >
                      <Avatar name={thread.participantName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#37352f]">{thread.participantName}</p>
                        <p className="truncate text-xs text-[#787774]">{thread.lastMessage}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <RailEmpty>No conversations yet.</RailEmpty>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#e9e9e7] bg-white">
              <RailHeader title="Recent activity" />
              <div className="px-4 pb-4">
                {recentActivity.length ? (
                  <ol className="relative space-y-4 border-l border-[#ededec] pl-4">
                    {recentActivity.map((event, idx) => (
                      <li key={`${event.title}-${idx}`} className="relative">
                        <span className="absolute top-1.5 left-[-21px] h-2 w-2 rounded-full bg-[#D86B3D] ring-4 ring-white" />
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-sm font-medium text-[#37352f]">{event.title}</h4>
                          <span className="shrink-0 text-xs text-[#9b9a97]">{event.timeAgo}</span>
                        </div>
                        <p className="mt-0.5 text-xs leading-5 text-[#787774]">{event.body}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <RailEmpty>Activity appears as briefs and applicants move.</RailEmpty>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-5 py-4">
      <p
        className={`text-[24px] font-semibold tracking-[-0.02em] tabular-nums ${accent ? "text-[#D86B3D]" : "text-[#37352f]"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[13px] text-[#787774]">{label}</p>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#37352f]">{title}</h2>
      {href ? (
        <Link
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#787774] transition hover:gap-1.5 hover:text-[#37352f]"
          href={href}
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function RailHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f1f1ef] px-4 py-3">
      <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-[#37352f]">{title}</h3>
      {href ? (
        <Link className="text-xs font-medium text-[#787774] transition hover:text-[#37352f]" href={href}>
          View all
        </Link>
      ) : null}
    </div>
  );
}

function RailEmpty({ children }: { children: ReactNode }) {
  return <p className="px-2 py-6 text-center text-sm text-[#9b9a97]">{children}</p>;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#faf0ea] text-xs font-bold text-[#bf5a30]">
      {initials}
    </span>
  );
}

type CampaignRow = {
  id: string;
  title: string;
  description: string;
  platform: string;
  budget: string;
  deadline: string | null;
  status: string;
  applicantsCount: number;
};

type ShortlistedRow = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  niche: string;
  location: string;
  avatar: string | null;
  verified: boolean;
  totalFollowers: number;
  engagementRate: number;
  ratePerPost: number;
};

function CampaignPanel({ campaign }: { campaign: CampaignRow }) {
  return (
    <article className="group rounded-lg border border-[#e9e9e7] bg-white p-4 transition-colors hover:bg-[#fbfbfa]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-[#faf0ea] px-2 py-0.5 text-xs font-medium text-[#bf5a30]">{campaign.platform}</span>
        <span className="text-xs font-medium text-[#9b9a97]">
          {campaign.applicantsCount} {campaign.applicantsCount === 1 ? "applicant" : "applicants"}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold tracking-[-0.01em] text-[#37352f]">{campaign.title}</h3>
      <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-[#787774]">{campaign.description}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-[#f1f1ef] pt-3.5 text-[13px]">
        <span className="font-semibold text-[#37352f] tabular-nums">{campaign.budget}</span>
        <span className="text-[#c7c7c4]">·</span>
        <span className="text-[#787774]">{formatDeadline(campaign.deadline)}</span>
      </div>
    </article>
  );
}

function EmptyShell({
  title,
  body,
  ctaHref,
  ctaLabel
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[#e1e1de] bg-[#fbfbfa] px-6 py-9 text-center">
      <h3 className="text-sm font-semibold text-[#37352f]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-6 text-[#787774]">{body}</p>
      <Link
        className="mt-4 inline-flex h-8 items-center justify-center rounded-md bg-[#37352f] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#262420]"
        href={ctaHref}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function CreatorPanel({ creator }: { creator: ShortlistedRow }) {
  const reach =
    creator.totalFollowers >= 1_000_000
      ? `${(creator.totalFollowers / 1_000_000).toFixed(1)}M`
      : `${Math.round(creator.totalFollowers / 1000)}K`;
  return (
    <article className="group rounded-lg border border-[#e9e9e7] bg-white p-4 transition-colors hover:bg-[#fbfbfa]">
      <div className="flex items-start gap-3">
        <Avatar name={creator.name} />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-[-0.01em] text-[#37352f]">{creator.name}</h3>
          <p className="truncate text-xs text-[#787774]">
            {creator.niche} · {creator.location}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-[#787774]">{creator.bio}</p>
      <div className="mt-3.5 flex items-center gap-5 border-t border-[#f1f1ef] pt-3.5">
        <Metric label="Reach" value={reach} />
        <Metric label="Engagement" value={`${creator.engagementRate}%`} />
        <Metric label="Rate" value={`$${creator.ratePerPost.toLocaleString()}`} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold tracking-[-0.01em] text-[#37352f] tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-[#9b9a97]">{label}</p>
    </div>
  );
}
