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
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e9e7] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-3 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f]"
            href="/jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              className="hidden h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-4 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f] sm:inline-flex"
              href={`/jobs/${job.id}/applicants`}
            >
              Review applicants
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d222b]"
              href="#apply"
            >
              <Send className="mr-2 h-4 w-4" />
              Apply
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[30px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-[#e08550] hover:bg-[#faf0ea]">
              <BriefcaseBusiness className="mr-2 h-3.5 w-3.5" />
              Open brief
            </Badge>
            <Badge className="rounded-full border border-[#e9e9e7] bg-white text-[#787774] hover:bg-white">
              {job.industry}
            </Badge>
            {job.remote && (
              <Badge className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] text-[#147a3b] hover:bg-[#e8f8ef]">
                Remote
              </Badge>
            )}
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-semibold tracking-[-0.06em]">
            {job.title}
          </h1>
          <p className="mt-4 text-base font-semibold text-[#787774]">
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

          <div className="mt-8 border-t border-[#e9e9e7] pt-7">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Brief</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#787774]">{job.description}</p>
          </div>

          <div className="mt-8 grid gap-6 border-t border-[#e9e9e7] pt-7 md:grid-cols-2">
            <section>
              <h2 className="text-xl font-semibold tracking-[-0.035em]">Deliverables</h2>
              <div className="mt-4 grid gap-3">
                {job.deliverables.map((deliverable) => (
                  <div
                    className="flex items-center gap-3 rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3"
                    key={deliverable}
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#e08550]" />
                    <span className="text-sm font-semibold text-[#4b5563]">{deliverable}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-[-0.035em]">Creator requirements</h2>
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
          <article className="rounded-[26px] border border-[#f3d5c4] bg-[#faf0ea] p-5" id="apply">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#e08550] uppercase">Creator action</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Apply with a tight pitch.</h2>
            <p className="mt-3 text-sm leading-6 text-[#787774]">
              Submit a short, specific pitch. Terrace creates the application and opens a job conversation with the
              brand recruiter.
            </p>
            <JobApplyForm jobId={job.id} />
          </article>

          <article className="rounded-[26px] border border-[#e9e9e7] bg-white p-5 shadow-[0_14px_40px_rgba(17,24,39,0.035)]">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Niches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.niches.map((niche) => (
                <span
                  className="rounded-full border border-[#e9e9e7] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#787774]"
                  key={niche}
                >
                  {niche}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[26px] border border-[#e9e9e7] bg-white p-5 shadow-[0_14px_40px_rgba(17,24,39,0.035)]">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Creator workspace</p>
            <p className="mt-3 text-sm leading-6 text-[#787774]">
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
    <div className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-4">
      <Icon className="h-4 w-4 text-[#e08550]" />
      <p className="mt-3 text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#37352f]">{value}</p>
    </div>
  );
}

function Requirement({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#37352f]">{value}</p>
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
