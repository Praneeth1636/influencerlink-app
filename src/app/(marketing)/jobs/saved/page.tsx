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
  submitted: "bg-muted/40 text-muted-foreground",
  shortlisted: "bg-primary/14 text-primary",
  hired: "bg-emerald-400/12 text-emerald-200",
  rejected: "bg-white/6 text-muted-foreground"
};

export default async function SavedJobsPage() {
  const workspace = await getWorkspace();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
            href="/jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
        </div>

        <article className="border-border bg-card rounded-xl border p-6">
          <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
            <BookmarkCheck className="mr-2 h-3.5 w-3.5" />
            Creator jobs workspace
          </Badge>
          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            Track saved briefs and every creator application.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-7">
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
    <article className="border-border bg-card rounded-xl border p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Badge className={`hover:bg-muted/40 rounded-full px-3 py-1 ${statusTone[application.status]}`}>
            {application.status}
          </Badge>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.045em]">{application.job.title}</h2>
          <p className="text-foreground/55 mt-2 text-sm font-bold">
            {application.job.brandName} · {application.job.remote ? "Remote" : (application.job.location ?? "Local")}
          </p>
        </div>
        <Link
          className="hover:bg-primary/10 inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-sm font-black text-black transition"
          href={`/jobs/${application.job.id}`}
        >
          View brief
        </Link>
      </div>

      <p className="text-muted-foreground mt-4 text-sm leading-6">{application.pitch}</p>

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
    <article className="border-border bg-card rounded-xl border p-5">
      <h2 className="text-xl font-black tracking-[-0.04em]">{saved.job.title}</h2>
      <p className="text-foreground/55 mt-2 text-sm font-bold">{saved.job.brandName}</p>
      <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6">{saved.job.description}</p>
      <div className="mt-4 grid gap-2">
        <MiniStat
          label="Budget"
          value={`${formatMoney(saved.job.budgetMinCents)}-${formatMoney(saved.job.budgetMaxCents)}`}
        />
        <MiniStat label="Saved" value={formatDate(saved.savedAt)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {saved.job.niches.map((niche) => (
          <span className="bg-muted/40 text-foreground/50 rounded-full px-2.5 py-1 text-[10px] font-black" key={niche}>
            {niche}
          </span>
        ))}
      </div>
      <Link
        className="border-border text-foreground/68 hover:border-primary/35 hover:text-primary mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border px-4 text-sm font-black transition"
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
      <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-6 text-sm leading-6">
      {text}
    </div>
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

function Metric({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return (
    <div className="border-border bg-muted/30 rounded-xl border p-3">
      <Icon className="text-primary h-4 w-4" />
      <p className="text-muted-foreground mt-3 text-[10px] font-black tracking-[0.14em] uppercase">{label}</p>
      <p className="text-foreground mt-1 text-sm font-black">{value}</p>
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
