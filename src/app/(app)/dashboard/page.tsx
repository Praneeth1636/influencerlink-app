// Brand-side dashboard. Creators land on /feed (sidebar already routes them
// there); brands land here. Renders inside the (app) AppShell — sidebar
// chrome is already there, so we only own the page body.

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart, DollarSign, PlusCircle, Star, Users } from "lucide-react";
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

  // Resolve the first brand membership so we know which brand to render for.
  // Most users have exactly one; multi-brand is a post-MVP problem.
  const caller = await createTRPCServerCaller();
  const memberships = await caller.brand.myMemberships().catch(() => []);
  const primaryBrandId = memberships[0]?.brand?.id ?? null;

  // Pull dashboard data if there's a brand context; otherwise render empty
  // shells. Creators visiting in dev (production redirects them) also fall
  // through to the empty state — that's fine, the eyebrow shows "Brand workspace"
  // and the page invites them to create a campaign.
  const data = primaryBrandId ? await caller.brand.dashboard({ brandId: primaryBrandId }).catch(() => null) : null;

  const activeCampaigns = data?.activeCampaigns ?? [];
  const shortlisted = data?.shortlisted ?? [];
  const recentMessages = data?.recentMessages ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const stats = data?.stats ?? { activeCampaigns: 0, totalApplicants: 0, shortlisted: 0, totalSpendCents: 0 };

  return (
    <main className="animate-in fade-in slide-in-from-bottom-4 space-y-7 bg-white text-[#111318] duration-500">
      <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.05)] sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9aa3b2] uppercase">Brand workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#687386]">Campaigns, applicants, messages, and spend in one calm view.</p>
        </div>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#090b10] px-5 text-sm font-semibold text-white transition hover:bg-[#1b1f27]"
          href="/jobs/new"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Campaign
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <DashboardStat
              title="Active Campaigns"
              value={String(stats.activeCampaigns)}
              icon={<BarChart className="h-5 w-5" />}
            />
            <DashboardStat
              title="Total Applicants"
              value={String(stats.totalApplicants)}
              icon={<Users className="h-5 w-5" />}
            />
            <DashboardStat title="Shortlisted" value={String(stats.shortlisted)} icon={<Star className="h-5 w-5" />} />
            <DashboardStat
              title="Total Spend"
              value={formatSpend(stats.totalSpendCents)}
              icon={<DollarSign className="h-5 w-5" />}
            />
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <SectionTitle eyebrow="Briefs" title="Active Campaigns" />
              <ViewAllLink href="/jobs" />
            </div>
            {activeCampaigns.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeCampaigns.map((campaign) => (
                  <CampaignPanel key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <EmptyShell
                title="No active campaigns yet"
                body="Post your first brief and creators will start applying within hours."
                ctaHref="/jobs/new"
                ctaLabel="Create Campaign"
              />
            )}
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <SectionTitle eyebrow="Talent" title="Shortlisted Creators" />
              <ViewAllLink href="/applications" />
            </div>
            {shortlisted.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {shortlisted.map((creator) => (
                  <CreatorPanel key={creator.id} creator={creator} />
                ))}
              </div>
            ) : (
              <EmptyShell
                title="No shortlist yet"
                body="Move applicants to Shortlisted from any brief's applicants view."
                ctaHref="/jobs"
                ctaLabel="Review Applicants"
              />
            )}
          </div>
        </div>

        <div className="space-y-8">
          <section className="rounded-[22px] border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <div className="flex items-center justify-between pb-4">
              <SectionTitle eyebrow="Inbox" title="Recent Messages" compact />
              <Link className="text-sm font-semibold text-[#687386] hover:text-[#111318]" href="/messages">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentMessages.length ? (
                recentMessages.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/messages/${thread.id}`}
                    className="group -mx-2 flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-[#f8f9fb]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#9fc9e4,#e28a77)]">
                      <Users className="h-5 w-5 text-[#111318]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold transition-colors group-hover:text-[#D86B3D]">
                        {thread.participantName}
                      </p>
                      <p className="truncate text-xs text-[#687386]">{thread.lastMessage}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[#687386]">No conversations yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[22px] border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <div className="pb-4">
              <SectionTitle eyebrow="Audit" title="Recent Activity" compact />
            </div>
            <div className="space-y-4">
              {recentActivity.length ? (
                recentActivity.map((event, idx) => (
                  <div
                    key={`${event.title}-${idx}`}
                    className="flex items-start gap-3 rounded-2xl border border-[#ececec] bg-[#fbfcfd] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7f2] text-[#D86B3D]">
                      {event.kind === "application" ? <Users className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <span className="text-xs whitespace-nowrap text-[#9aa3b2]">{event.timeAgo}</span>
                      </div>
                      <p className="text-xs text-[#687386]">{event.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#687386]">Activity will appear as briefs and applicants move.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DashboardStat({
  title,
  value,
  icon,
  helper
}: {
  title: string;
  value: string;
  icon: ReactNode;
  helper?: string;
}) {
  return (
    <article className="rounded-[22px] border border-[#ececec] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
      <div className="flex items-center justify-between text-[#9aa3b2]">
        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">{title}</span>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{value}</p>
      {helper ? <p className="mt-1 text-xs text-[#D86B3D]">{helper}</p> : null}
    </article>
  );
}

function SectionTitle({ eyebrow, title, compact = false }: { eyebrow: string; title: string; compact?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9aa3b2] uppercase">{eyebrow}</p>
      <h2 className={`${compact ? "text-lg" : "text-xl"} mt-1 font-semibold tracking-[-0.04em]`}>{title}</h2>
    </div>
  );
}

function ViewAllLink({ href }: { href: string }) {
  return (
    <Link className="inline-flex items-center text-sm font-semibold text-[#687386] hover:text-[#111318]" href={href}>
      View all <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
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
    <article className="rounded-[24px] border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-[#f3d5c4] bg-[#fff7f2] px-3 py-1 text-xs font-semibold text-[#D86B3D]">
          {campaign.platform}
        </span>
        <span className="text-xs font-medium text-[#687386]">{campaign.applicantsCount} applicants</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em]">{campaign.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#687386]">{campaign.description}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-[#ececec] bg-[#fbfcfd] px-3 py-1.5 font-semibold">
          {campaign.budget}
        </span>
        <span className="rounded-full border border-[#ececec] bg-[#fbfcfd] px-3 py-1.5 text-[#687386]">
          {formatDeadline(campaign.deadline)}
        </span>
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
    <article className="rounded-[24px] border border-dashed border-[#ececec] bg-[#fbfcfd] p-6 text-center">
      <h3 className="text-base font-semibold text-[#111318]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#687386]">{body}</p>
      <Link
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#090b10] px-4 text-sm font-semibold text-white transition hover:bg-[#1b1f27]"
        href={ctaHref}
      >
        {ctaLabel}
      </Link>
    </article>
  );
}

function CreatorPanel({ creator }: { creator: ShortlistedRow }) {
  return (
    <article className="rounded-[24px] border border-[#ececec] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#9fc9e4,#e28a77)] text-sm font-semibold">
          {creator.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-[-0.035em]">{creator.name}</h3>
          <p className="text-sm text-[#687386]">
            {creator.niche} · {creator.location}
          </p>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#687386]">{creator.bio}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniStat
          label="Reach"
          value={
            creator.totalFollowers >= 1_000_000
              ? `${(creator.totalFollowers / 1_000_000).toFixed(1)}M`
              : `${Math.round(creator.totalFollowers / 1000)}K`
          }
        />
        <MiniStat label="Eng" value={`${creator.engagementRate}%`} />
        <MiniStat label="Rate" value={`$${creator.ratePerPost.toLocaleString()}`} />
      </div>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ececec] bg-[#fbfcfd] p-3">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9aa3b2] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
