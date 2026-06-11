import Link from "next/link";
import { BriefcaseBusiness, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildSeedJobBoardItems, mapJobRows, type JobBoardFilters, type JobBoardItem } from "@/lib/jobs/job-board";
import { createTRPCServerCaller } from "@/lib/trpc/server";

type JobsPageProps = {
  searchParams: Promise<{
    niche?: string;
    minBudget?: string;
    remote?: string;
  }>;
};

const nicheOptions = ["Beauty", "Skincare", "Fitness", "Lifestyle", "Food", "Tech", "Business"];
const budgetOptions = [
  { label: "Any budget", value: "" },
  { label: "$2K+", value: "200000" },
  { label: "$5K+", value: "500000" },
  { label: "$8K+", value: "800000" }
];

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const jobs = await getJobs(filters);

  return (
    <main className="min-h-screen bg-[#fbfbfa] font-sans">
      <section className="mx-auto max-w-[1280px] px-4 pt-6 pb-4 sm:px-5 sm:pt-8 sm:pb-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              Open work from verified brand teams.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#787774]">
              Each gig has budget, deliverables, audience fit, and a match score. Filter to your niche and apply with
              proof, not pitches.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="terrace-secondary-action h-9 px-4 text-sm sm:h-10" href="/signup?intent=creator">
              Save gigs
            </Link>
            <Link className="terrace-primary-action h-9 px-4 text-sm sm:h-10" href="/signup?intent=brand">
              Post as brand
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-4 px-4 pb-10 sm:px-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <form action="/jobs" className="rounded-lg border border-[#e9e9e7] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7f7f5] text-[#787774]">
                <BriefcaseBusiness className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold tracking-[-0.02em]">Filters</h2>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-semibold tracking-[0.14em] text-[#8a94a5] uppercase">Niche</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-[#e6e8ed] bg-white px-3 text-sm text-[#37352f] outline-none focus:border-[#8CC9E8]"
                defaultValue={filters.niche ?? ""}
                name="niche"
              >
                <option value="">All niches</option>
                {nicheOptions.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-semibold tracking-[0.14em] text-[#8a94a5] uppercase">Budget</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-[#e6e8ed] bg-white px-3 text-sm text-[#37352f] outline-none focus:border-[#8CC9E8]"
                defaultValue={filters.minBudgetCents ? String(filters.minBudgetCents) : ""}
                name="minBudget"
              >
                {budgetOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#e9e9e7] bg-[#fbfbfa] p-3">
              <input
                className="h-4 w-4 accent-[#e08550]"
                defaultChecked={filters.remote}
                name="remote"
                type="checkbox"
                value="1"
              />
              <span className="text-sm font-semibold text-[#4b5563]">Remote only</span>
            </label>

            <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#37352f] text-sm font-semibold text-white transition hover:bg-[#1d222b]">
              <Filter className="mr-2 h-4 w-4" />
              Apply filters
            </button>
          </form>
        </aside>

        <section className="grid min-w-0 content-start gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#787774]">
              {jobs.length} {jobs.length === 1 ? "gig" : "gigs"} match your filters
            </p>
          </div>

          {jobs.length === 0 && (
            <div className="rounded-lg border border-[#e9e9e7] bg-white p-6">
              <p className="text-lg font-semibold">No gigs found</p>
              <p className="mt-2 text-sm leading-6 text-[#787774]">
                Try a broader niche, lower budget threshold, or include local campaigns.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard job={job} key={job.id} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

async function getJobs(filters: JobBoardFilters) {
  try {
    const caller = await createTRPCServerCaller();
    const liveJobs = mapJobRows(
      await caller.job.list({
        limit: 24,
        niche: filters.niche,
        minBudgetCents: filters.minBudgetCents,
        remote: filters.remote
      })
    );
    return liveJobs.length > 0 ? liveJobs : buildSeedJobBoardItems(filters);
  } catch {
    return buildSeedJobBoardItems(filters);
  }
}

function JobCard({ job }: { job: JobBoardItem }) {
  return (
    <article className="rounded-lg border border-[#e9e9e7] bg-white p-4 transition hover:border-[#d9d9d6] sm:p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-[#e9e9e7] bg-white text-[#787774] hover:bg-white">
              {job.industry}
            </Badge>
            {job.remote ? (
              <Badge className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] text-[#147a3b] hover:bg-[#e8f8ef]">
                Remote
              </Badge>
            ) : (
              <Badge className="rounded-full border border-[#d6eaf8] bg-[#edf8ff] text-[#2f83b7] hover:bg-[#edf8ff]">
                Local
              </Badge>
            )}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.045em] sm:text-2xl">{job.title}</h3>
          <p className="mt-2 text-sm font-semibold text-[#787774]">
            {job.brandName} · {job.remote ? "Remote" : (job.location ?? job.hqLocation)}
          </p>
        </div>

        <div className="grid h-14 w-16 shrink-0 place-items-center rounded-lg border border-[#f3d5c4] bg-[#faf0ea] text-center text-[#e08550] sm:h-16 sm:w-20">
          <strong className="text-lg font-semibold tracking-[-0.04em] sm:text-xl">{job.fitScore}%</strong>
          <span className="-mt-2 text-[10px] font-semibold tracking-[0.12em] uppercase opacity-70">fit</span>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#787774]">{job.description}</p>

      <div className="mt-5 grid gap-2 md:grid-cols-4">
        <MiniStat label="Budget" value={`${formatMoney(job.budgetMinCents)}-${formatMoney(job.budgetMaxCents)}`} />
        <MiniStat label="Min reach" value={job.minFollowers ? formatNumber(job.minFollowers) : "Open"} />
        <MiniStat label="Engagement" value={job.minEngagement ? `${job.minEngagement.toFixed(1)}%+` : "Open"} />
        <MiniStat label="Applicants" value={String(job.applicationCount)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.niches.map((niche) => (
          <span
            className="rounded-full border border-[#e9e9e7] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#787774]"
            key={niche}
          >
            {niche}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#e9e9e7] pt-5">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d222b]"
          href={`/jobs/${job.id}`}
        >
          View gig
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-4 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f]"
          href={`/company/${job.brandSlug}`}
        >
          View brand
        </Link>
      </div>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#37352f]">{value}</p>
    </div>
  );
}

function parseFilters(params: Awaited<JobsPageProps["searchParams"]>): JobBoardFilters {
  const minBudget = Number(params.minBudget);

  return {
    niche: params.niche || undefined,
    minBudgetCents: Number.isFinite(minBudget) && minBudget > 0 ? minBudget : undefined,
    remote: params.remote === "1" ? true : undefined
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatMoney(value: number | null) {
  if (!value) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value / 100);
}
