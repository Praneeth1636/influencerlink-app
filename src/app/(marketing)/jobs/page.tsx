import Link from "next/link";
import { BriefcaseBusiness, Filter, Radio } from "lucide-react";
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
  const topJob = jobs[0];

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_2%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-4">
          <Link
            className="logoMark miniLogo shrink-0 bg-white/5 ring-1 ring-white/10"
            href="/feed"
            aria-label="CreatorLink feed"
          >
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">Creator jobs</p>
            <p className="hidden text-sm text-white/60 sm:block">Open briefs from verified brand teams</p>
          </div>
          <Link
            className="ml-auto rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/jobs/saved"
          >
            Saved jobs
          </Link>
          <Link
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/jobs/new"
          >
            Post brief
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-7 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <form action="/jobs" className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#D85A30]/12 text-[#ffb49c] ring-1 ring-[#D85A30]/20">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Filters</p>
                <h1 className="text-2xl font-black tracking-[-0.04em]">Job board</h1>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-black tracking-[0.14em] text-white/35 uppercase">Niche</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#151518] px-3 text-sm text-white outline-none focus:border-[#D85A30]/60"
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
              <span className="text-xs font-black tracking-[0.14em] text-white/35 uppercase">Budget</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#151518] px-3 text-sm text-white outline-none focus:border-[#D85A30]/60"
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

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <input
                className="h-4 w-4 accent-[#D85A30]"
                defaultChecked={filters.remote}
                name="remote"
                type="checkbox"
                value="1"
              />
              <span className="text-sm font-bold text-white/68">Remote briefs only</span>
            </label>

            <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#D85A30] text-sm font-black text-white transition hover:bg-[#c54f29]">
              <Filter className="mr-2 h-4 w-4" />
              Search briefs
            </button>
          </form>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Market pulse</p>
            <div className="mt-4 grid gap-3">
              <MiniStat label="Open briefs" value={String(jobs.length)} />
              <MiniStat label="Top fit" value={topJob ? `${topJob.fitScore}%` : "0%"} />
              <MiniStat label="Top budget" value={topJob ? formatMoney(topJob.budgetMaxCents) : "$0"} />
            </div>
          </article>
        </aside>

        <section className="grid min-w-0 content-start gap-5">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/10">
            <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
              <Radio className="mr-2 h-3.5 w-3.5" />
              Live briefs
            </Badge>
            <h2 className="mt-5 text-[clamp(32px,5vw,58px)] leading-[0.98] font-black tracking-[-0.055em]">
              Browse brand campaigns built for creator proof, not vanity.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              This is the creator-side job marketplace. Each brief carries brand context, deliverables, audience
              requirements, budget, and a fit score to help creators decide fast.
            </p>
          </article>

          {jobs.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
              <p className="text-lg font-black">No briefs found</p>
              <p className="mt-2 text-sm leading-6 text-white/52">
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
    return mapJobRows(
      await caller.job.list({
        limit: 24,
        niche: filters.niche,
        minBudgetCents: filters.minBudgetCents,
        remote: filters.remote
      })
    );
  } catch {
    return buildSeedJobBoardItems(filters);
  }
}

function JobCard({ job }: { job: JobBoardItem }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-[#D85A30]/35 hover:bg-white/[0.06]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-white/8 text-white/58 hover:bg-white/8">{job.industry}</Badge>
            {job.remote ? (
              <Badge className="rounded-full bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/12">Remote</Badge>
            ) : (
              <Badge className="rounded-full bg-sky-400/12 text-sky-200 hover:bg-sky-400/12">Local</Badge>
            )}
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-[-0.045em]">{job.title}</h3>
          <p className="mt-2 text-sm font-bold text-white/55">
            {job.brandName} · {job.remote ? "Remote" : (job.location ?? job.hqLocation)}
          </p>
        </div>

        <div className="grid h-16 w-20 shrink-0 place-items-center rounded-xl border border-[#D85A30]/35 bg-[#D85A30]/14 text-center text-[#ffb49c]">
          <strong className="text-xl font-black tracking-[-0.04em]">{job.fitScore}%</strong>
          <span className="-mt-2 text-[10px] font-black tracking-[0.12em] uppercase opacity-70">fit</span>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-white/58">{job.description}</p>

      <div className="mt-5 grid gap-2 md:grid-cols-4">
        <MiniStat label="Budget" value={`${formatMoney(job.budgetMinCents)}-${formatMoney(job.budgetMaxCents)}`} />
        <MiniStat label="Min reach" value={job.minFollowers ? formatNumber(job.minFollowers) : "Open"} />
        <MiniStat label="Engagement" value={job.minEngagement ? `${job.minEngagement.toFixed(1)}%+` : "Open"} />
        <MiniStat label="Applicants" value={String(job.applicationCount)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.niches.map((niche) => (
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black text-white/58" key={niche}>
            {niche}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-black transition hover:bg-[#ffdfd2]"
          href={`/jobs/${job.id}`}
        >
          View brief
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
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
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
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
