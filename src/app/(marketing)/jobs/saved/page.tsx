import Link from "next/link";
import { ArrowLeft, BookmarkCheck, BriefcaseBusiness, CalendarDays, DollarSign, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getSeedCreatorJobsWorkspace,
  mapCreatorJobsWorkspace,
  type CreatorApplicationItem,
  type CreatorJobsWorkspace,
  type CreatorSavedJobItem
} from "@/lib/jobs/creator-workspace";
import { createTRPCServerCaller } from "@/lib/trpc/server";

const statusTone = {
  submitted: "bg-white/8 text-white/58",
  shortlisted: "bg-[#D85A30]/14 text-[#ffb49c]",
  hired: "bg-emerald-400/12 text-emerald-200",
  rejected: "bg-white/6 text-white/38"
};

export default async function SavedJobsPage() {
  const workspace = await getWorkspace();

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_2%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
          <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
            <BookmarkCheck className="mr-2 h-3.5 w-3.5" />
            Creator jobs workspace
          </Badge>
          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            Track saved briefs and every creator application.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
            This is the creator-side command center for opportunities: saved briefs, pitches sent, proposed rates, and
            application outcomes.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <MiniStat label="Saved jobs" value={String(workspace.savedJobs.length)} />
            <MiniStat label="Applications" value={String(workspace.applications.length)} />
            <MiniStat
              label="Shortlisted"
              value={String(workspace.applications.filter((item) => item.status === "shortlisted").length)}
            />
            <MiniStat
              label="Hired"
              value={String(workspace.applications.filter((item) => item.status === "hired").length)}
            />
          </div>
        </article>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid content-start gap-4">
            <SectionTitle eyebrow="Applications" title="Your pitch pipeline" />
            {workspace.applications.length === 0 ? (
              <EmptyState text="No applications yet. Find a brief and send a tight pitch." />
            ) : (
              workspace.applications.map((application) => (
                <ApplicationCard application={application} key={application.id} />
              ))
            )}
          </div>

          <aside className="grid content-start gap-4">
            <SectionTitle eyebrow="Saved" title="Briefs to revisit" />
            {workspace.savedJobs.length === 0 ? (
              <EmptyState text="No saved jobs yet. Save briefs from the job board to compare them here." />
            ) : (
              workspace.savedJobs.map((saved) => <SavedJobCard key={saved.job.id} saved={saved} />)
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}

async function getWorkspace(): Promise<CreatorJobsWorkspace> {
  try {
    const caller = await createTRPCServerCaller();
    return mapCreatorJobsWorkspace(await caller.job.creatorWorkspace());
  } catch {
    return getSeedCreatorJobsWorkspace();
  }
}

function ApplicationCard({ application }: { application: CreatorApplicationItem }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Badge className={`rounded-full px-3 py-1 hover:bg-white/8 ${statusTone[application.status]}`}>
            {application.status}
          </Badge>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.045em]">{application.job.title}</h2>
          <p className="mt-2 text-sm font-bold text-white/55">
            {application.job.brandName} · {application.job.remote ? "Remote" : (application.job.location ?? "Local")}
          </p>
        </div>
        <Link
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-black transition hover:bg-[#ffdfd2]"
          href={`/jobs/${application.job.id}`}
        >
          View brief
        </Link>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/58">{application.pitch}</p>

      <div className="mt-5 grid gap-2 md:grid-cols-3">
        <Metric
          icon={DollarSign}
          label="Proposed"
          value={application.proposedRateCents ? formatMoney(application.proposedRateCents) : "Open"}
        />
        <Metric icon={CalendarDays} label="Applied" value={formatDate(application.createdAt)} />
        <Metric icon={BriefcaseBusiness} label="Brand" value={application.job.brandName} />
      </div>
    </article>
  );
}

function SavedJobCard({ saved }: { saved: CreatorSavedJobItem }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <h2 className="text-xl font-black tracking-[-0.04em]">{saved.job.title}</h2>
      <p className="mt-2 text-sm font-bold text-white/55">{saved.job.brandName}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/52">{saved.job.description}</p>
      <div className="mt-4 grid gap-2">
        <MiniStat
          label="Budget"
          value={`${formatMoney(saved.job.budgetMinCents)}-${formatMoney(saved.job.budgetMaxCents)}`}
        />
        <MiniStat label="Saved" value={formatDate(saved.savedAt)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {saved.job.niches.map((niche) => (
          <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-black text-white/50" key={niche}>
            {niche}
          </span>
        ))}
      </div>
      <Link
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-black text-white/68 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
        href={`/jobs/${saved.job.id}`}
      >
        <Send className="mr-2 h-4 w-4" />
        Apply
      </Link>
    </article>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm leading-6 text-white/42">{text}</div>
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

function Metric({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <Icon className="h-4 w-4 text-[#ffb49c]" />
      <p className="mt-3 text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
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
