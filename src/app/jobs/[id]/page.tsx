import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, DollarSign, MapPin, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSeedJobBoardItem, mapJobDetail } from "@/lib/jobs/job-board";
import { createTRPCServerCaller } from "@/lib/trpc/server";

type JobDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_2%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              className="hidden h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c] sm:inline-flex"
              href={`/company/${job.brandSlug}`}
            >
              View brand
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#D85A30] px-4 text-sm font-black text-white transition hover:bg-[#c54f29]"
              href="/login"
            >
              <Send className="mr-2 h-4 w-4" />
              Apply
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
              <BriefcaseBusiness className="mr-2 h-3.5 w-3.5" />
              Open brief
            </Badge>
            <Badge className="rounded-full bg-white/8 text-white/58 hover:bg-white/8">{job.industry}</Badge>
            {job.remote && (
              <Badge className="rounded-full bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/12">Remote</Badge>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            {job.title}
          </h1>
          <p className="mt-4 text-base font-bold text-white/58">
            {job.brandName} · {job.remote ? "Remote" : (job.location ?? job.hqLocation)}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={DollarSign}
              label="Budget"
              value={`${formatMoney(job.budgetMinCents)}-${formatMoney(job.budgetMaxCents)}`}
            />
            <Metric icon={MapPin} label="Location" value={job.remote ? "Remote" : (job.location ?? job.hqLocation)} />
            <Metric icon={CalendarDays} label="Deadline" value={formatDate(job.deadline)} />
            <Metric icon={CheckCircle2} label="Fit score" value={`${job.fitScore}%`} />
          </div>

          <div className="mt-8 border-t border-white/10 pt-7">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Brief</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{job.description}</p>
          </div>

          <div className="mt-8 grid gap-6 border-t border-white/10 pt-7 md:grid-cols-2">
            <section>
              <h2 className="text-xl font-black tracking-[-0.035em]">Deliverables</h2>
              <div className="mt-4 grid gap-3">
                {job.deliverables.map((deliverable) => (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
                    key={deliverable}
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#ffb49c]" />
                    <span className="text-sm font-bold text-white/70">{deliverable}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-[-0.035em]">Creator requirements</h2>
              <div className="mt-4 grid gap-3">
                <Requirement label="Minimum reach" value={job.minFollowers ? formatNumber(job.minFollowers) : "Open"} />
                <Requirement
                  label="Minimum engagement"
                  value={job.minEngagement ? `${job.minEngagement.toFixed(1)}%+` : "Open"}
                />
                <Requirement label="Applicants so far" value={String(job.applicationCount)} />
              </div>
            </section>
          </div>
        </article>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="rounded-2xl border border-[#D85A30]/25 bg-[#D85A30]/10 p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-[#ffb49c] uppercase">Creator action</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">Apply with a tight pitch.</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">
              The backend application flow is wired now. Once auth UI is connected, creators can submit a pitch and the
              app will create the application plus a job message thread.
            </p>
            <Link
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-black text-black transition hover:bg-[#ffdfd2]"
              href="/login"
            >
              Sign in to apply
            </Link>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Niches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.niches.map((niche) => (
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black text-white/58" key={niche}>
                  {niche}
                </span>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

async function getJob(id: string) {
  try {
    const caller = await createTRPCServerCaller();
    const job = await caller.job.byId({ id });
    return job ? mapJobDetail(job) : getSeedJobBoardItem(id);
  } catch {
    return getSeedJobBoardItem(id);
  }
}

function Metric({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <Icon className="h-4 w-4 text-[#ffb49c]" />
      <p className="mt-3 text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Requirement({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
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

function formatDate(value: Date | null) {
  if (!value) {
    return "Rolling";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(value);
}
