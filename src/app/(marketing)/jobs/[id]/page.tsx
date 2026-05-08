import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, DollarSign, MapPin, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSeedJobBoardItem, mapJobDetail } from "@/lib/jobs/job-board";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import { SaveJobButton } from "../saved/save-job-button";
import { JobApplyForm } from "./apply-form";

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
    <main className="bg-background text-foreground min-h-screen">
      <header className="border-border bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
            href="/jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary hidden h-10 items-center justify-center rounded-xl border px-4 text-sm font-bold transition sm:inline-flex"
              href={`/jobs/${job.id}/applicants`}
            >
              Review applicants
            </Link>
            <Link
              className="bg-primary text-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black transition"
              href="#apply"
            >
              <Send className="mr-2 h-4 w-4" />
              Apply
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="border-border bg-card rounded-xl border p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
              <BriefcaseBusiness className="mr-2 h-3.5 w-3.5" />
              Open brief
            </Badge>
            <Badge className="bg-muted/40 text-muted-foreground hover:bg-muted/40 rounded-full">{job.industry}</Badge>
            {job.remote && (
              <Badge className="rounded-full bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/12">Remote</Badge>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            {job.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-base font-bold">
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

          <div className="border-border mt-8 border-t pt-7">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Brief</h2>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">{job.description}</p>
          </div>

          <div className="border-border mt-8 grid gap-6 border-t pt-7 md:grid-cols-2">
            <section>
              <h2 className="text-xl font-black tracking-[-0.035em]">Deliverables</h2>
              <div className="mt-4 grid gap-3">
                {job.deliverables.map((deliverable) => (
                  <div
                    className="border-border bg-muted/30 flex items-center gap-3 rounded-xl border p-3"
                    key={deliverable}
                  >
                    <CheckCircle2 className="text-primary h-4 w-4" />
                    <span className="text-foreground/70 text-sm font-bold">{deliverable}</span>
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
          <article className="border-primary/25 bg-primary/10 rounded-2xl border p-5" id="apply">
            <p className="text-primary text-[11px] font-black tracking-[0.2em] uppercase">Creator action</p>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">Apply with a tight pitch.</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Submit a short, specific pitch. Terrace creates the application and opens a job conversation with the
              brand recruiter.
            </p>
            <JobApplyForm jobId={job.id} />
          </article>

          <article className="border-border bg-card rounded-xl border p-5">
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Niches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.niches.map((niche) => (
                <span
                  className="bg-muted/40 text-muted-foreground rounded-full px-3 py-1.5 text-[11px] font-black"
                  key={niche}
                >
                  {niche}
                </span>
              ))}
            </div>
          </article>

          <article className="border-border bg-card rounded-xl border p-5">
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Creator workspace</p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Save this brief to compare it with other opportunities before pitching.
            </p>
            <div className="mt-5">
              <SaveJobButton jobId={job.id} />
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
    <div className="border-border bg-muted/30 rounded-xl border p-4">
      <Icon className="text-primary h-4 w-4" />
      <p className="text-muted-foreground mt-3 text-[10px] font-black tracking-[0.14em] uppercase">{label}</p>
      <p className="text-foreground mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function Requirement({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-muted/30 rounded-xl border p-3">
      <p className="text-muted-foreground text-[10px] font-black tracking-[0.14em] uppercase">{label}</p>
      <p className="text-foreground mt-1 text-sm font-black">{value}</p>
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
