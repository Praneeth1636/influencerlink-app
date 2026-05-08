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
    <main className="bg-background text-foreground min-h-screen">
      <header className="border-border bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-4">
          <Link
            className="logoMark miniLogo ring-border shrink-0 bg-white/5 ring-1"
            href="/feed"
            aria-label="Terrace feed"
          >
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">Creator jobs</p>
            <p className="text-muted-foreground hidden text-sm sm:block">Open briefs from verified brand teams</p>
          </div>
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary ml-auto rounded-xl border px-4 py-2 text-sm font-bold transition"
            href="/jobs/saved"
          >
            Saved jobs
          </Link>
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary rounded-xl border px-4 py-2 text-sm font-bold transition"
            href="/jobs/new"
          >
            Post brief
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-7 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <form action="/jobs" className="border-border bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/12 text-primary ring-primary/20 grid h-10 w-10 place-items-center rounded-xl ring-1">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Filters</p>
                <h1 className="text-2xl font-black tracking-[-0.04em]">Job board</h1>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-muted-foreground text-xs font-black tracking-[0.14em] uppercase">Niche</span>
              <select
                className="border-border bg-input text-foreground focus:border-primary/60 mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none"
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
              <span className="text-muted-foreground text-xs font-black tracking-[0.14em] uppercase">Budget</span>
              <select
                className="border-border bg-input text-foreground focus:border-primary/60 mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none"
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

            <label className="border-border bg-muted/30 mt-4 flex items-center gap-3 rounded-xl border p-3">
              <input
                className="accent-primary h-4 w-4"
                defaultChecked={filters.remote}
                name="remote"
                type="checkbox"
                value="1"
              />
              <span className="text-foreground/68 text-sm font-bold">Remote briefs only</span>
            </label>

            <button className="bg-primary text-foreground hover:bg-primary/90 mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-black transition">
              <Filter className="mr-2 h-4 w-4" />
              Search briefs
            </button>
          </form>

          <article className="border-border bg-card rounded-xl border p-5">
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Market pulse</p>
            <div className="mt-4 grid gap-3">
              <MiniStat label="Open briefs" value={String(jobs.length)} />
              <MiniStat label="Top fit" value={topJob ? `${topJob.fitScore}%` : "0%"} />
              <MiniStat label="Top budget" value={topJob ? formatMoney(topJob.budgetMaxCents) : "$0"} />
            </div>
          </article>
        </aside>

        <section className="grid min-w-0 content-start gap-5">
          <article className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
              <Radio className="mr-2 h-3.5 w-3.5" />
              Live briefs
            </Badge>
            <h2 className="mt-5 text-[clamp(32px,5vw,58px)] leading-[0.98] font-black tracking-[-0.055em]">
              Browse brand campaigns built for creator proof, not vanity.
            </h2>
            <p className="text-foreground/55 mt-4 max-w-2xl text-sm leading-7">
              This is the creator-side job marketplace. Each brief carries brand context, deliverables, audience
              requirements, budget, and a fit score to help creators decide fast.
            </p>
          </article>

          {jobs.length === 0 && (
            <div className="border-border bg-card rounded-xl border p-6">
              <p className="text-lg font-black">No briefs found</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
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
    <article className="border-border bg-card hover:border-primary/35 hover:bg-muted/30 rounded-xl border p-5 transition hover:-translate-y-0.5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-muted/40 text-muted-foreground hover:bg-muted/40 rounded-full">{job.industry}</Badge>
            {job.remote ? (
              <Badge className="rounded-full bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/12">Remote</Badge>
            ) : (
              <Badge className="rounded-full bg-sky-400/12 text-sky-200 hover:bg-sky-400/12">Local</Badge>
            )}
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-[-0.045em]">{job.title}</h3>
          <p className="text-foreground/55 mt-2 text-sm font-bold">
            {job.brandName} · {job.remote ? "Remote" : (job.location ?? job.hqLocation)}
          </p>
        </div>

        <div className="border-primary/35 bg-primary/14 text-primary grid h-16 w-20 shrink-0 place-items-center rounded-xl border text-center">
          <strong className="text-xl font-black tracking-[-0.04em]">{job.fitScore}%</strong>
          <span className="-mt-2 text-[10px] font-black tracking-[0.12em] uppercase opacity-70">fit</span>
        </div>
      </div>

      <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-6">{job.description}</p>

      <div className="mt-5 grid gap-2 md:grid-cols-4">
        <MiniStat label="Budget" value={`${formatMoney(job.budgetMinCents)}-${formatMoney(job.budgetMaxCents)}`} />
        <MiniStat label="Min reach" value={job.minFollowers ? formatNumber(job.minFollowers) : "Open"} />
        <MiniStat label="Engagement" value={job.minEngagement ? `${job.minEngagement.toFixed(1)}%+` : "Open"} />
        <MiniStat label="Applicants" value={String(job.applicationCount)} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {job.niches.map((niche) => (
          <span
            className="bg-muted/40 text-muted-foreground rounded-full px-3 py-1.5 text-[11px] font-black"
            key={niche}
          >
            {niche}
          </span>
        ))}
      </div>

      <div className="border-border mt-5 flex flex-wrap items-center gap-3 border-t pt-5">
        <Link
          className="hover:bg-primary/10 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-black transition"
          href={`/jobs/${job.id}`}
        >
          View brief
        </Link>
        <Link
          className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-bold transition"
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
    <div className="border-border bg-muted/30 rounded-xl border p-3">
      <p className="text-muted-foreground text-[10px] font-black tracking-[0.14em] uppercase">{label}</p>
      <p className="text-foreground mt-1 text-sm font-black">{value}</p>
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
