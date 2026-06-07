import Link from "next/link";
import { ArrowLeft, BookmarkCheck, BriefcaseBusiness, CalendarDays, DollarSign, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaymentTile, type PaymentTileData } from "@/components/domain/payment-tile";
import {
  getSeedCreatorJobsWorkspace,
  mapCreatorJobsWorkspace,
  type CreatorApplicationItem,
  type CreatorJobsWorkspace,
  type CreatorSavedJobItem
} from "@/lib/jobs/creator-workspace";
import { createTRPCServerCaller } from "@/lib/trpc/server";

const statusTone = {
  submitted: "border-[#e9e9e7] bg-white text-[#787774]",
  shortlisted: "border-[#f3d5c4] bg-[#faf0ea] text-[#D86B3D]",
  hired: "border-[#bfe8d0] bg-[#e8f8ef] text-[#147a3b]",
  rejected: "border-[#e9e9e7] bg-[#fbfbfa] text-[#787774]"
};

export default async function SavedJobsPage() {
  const workspace = await getWorkspace();
  const paymentByApplication = await loadCreatorPayments().catch(() => new Map<string, PaymentTileData>());

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-3 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f]"
            href="/jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
        </div>

        <article className="rounded-[30px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)]">
          <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-[#D86B3D] hover:bg-[#faf0ea]">
            <BookmarkCheck className="mr-2 h-3.5 w-3.5" />
            Creator jobs workspace
          </Badge>
          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-semibold tracking-[-0.06em]">
            Track saved briefs and every creator application.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#787774]">
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
                <ApplicationCard
                  application={application}
                  payment={paymentByApplication.get(application.id) ?? null}
                  key={application.id}
                />
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

async function loadCreatorPayments(): Promise<Map<string, PaymentTileData>> {
  const caller = await createTRPCServerCaller();
  const rows = await caller.payment.listForCreator();
  return new Map(
    rows.map((row) => [
      row.applicationId,
      {
        id: row.id,
        status: row.status,
        amountCents: row.amountCents,
        platformFeeCents: row.platformFeeCents,
        creatorPayoutCents: row.creatorPayoutCents,
        currency: row.currency
      }
    ])
  );
}

function ApplicationCard({
  application,
  payment
}: {
  application: CreatorApplicationItem;
  payment: PaymentTileData | null;
}) {
  return (
    <article className="rounded-[26px] border border-[#e9e9e7] bg-white p-5 shadow-[0_14px_40px_rgba(17,24,39,0.035)]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Badge className={`rounded-full border px-3 py-1 hover:bg-white ${statusTone[application.status]}`}>
            {application.status}
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">{application.job.title}</h2>
          <p className="mt-2 text-sm font-semibold text-[#787774]">
            {application.job.brandName} · {application.job.remote ? "Remote" : (application.job.location ?? "Local")}
          </p>
        </div>
        <Link
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d222b]"
          href={`/jobs/${application.job.id}`}
        >
          View brief
        </Link>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#787774]">{application.pitch}</p>

      <div className="mt-5 grid gap-2 md:grid-cols-3">
        <Metric
          icon={DollarSign}
          label="Proposed"
          value={application.proposedRateCents ? formatMoney(application.proposedRateCents) : "Open"}
        />
        <Metric icon={CalendarDays} label="Applied" value={formatDate(application.createdAt)} />
        <Metric icon={BriefcaseBusiness} label="Brand" value={application.job.brandName} />
      </div>

      {payment && (
        <div className="mt-5">
          <PaymentTile payment={payment} viewer="creator" />
        </div>
      )}
    </article>
  );
}

function SavedJobCard({ saved }: { saved: CreatorSavedJobItem }) {
  return (
    <article className="rounded-[26px] border border-[#e9e9e7] bg-white p-5 shadow-[0_14px_40px_rgba(17,24,39,0.035)]">
      <h2 className="text-xl font-semibold tracking-[-0.04em]">{saved.job.title}</h2>
      <p className="mt-2 text-sm font-semibold text-[#787774]">{saved.job.brandName}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#787774]">{saved.job.description}</p>
      <div className="mt-4 grid gap-2">
        <MiniStat
          label="Budget"
          value={`${formatMoney(saved.job.budgetMinCents)}-${formatMoney(saved.job.budgetMaxCents)}`}
        />
        <MiniStat label="Saved" value={formatDate(saved.savedAt)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {saved.job.niches.map((niche) => (
          <span
            className="rounded-full border border-[#e9e9e7] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#787774]"
            key={niche}
          >
            {niche}
          </span>
        ))}
      </div>
      <Link
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-[#e9e9e7] px-4 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f]"
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
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8dee8] p-6 text-sm leading-6 text-[#787774]">{text}</div>
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

function Metric({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3">
      <Icon className="h-4 w-4 text-[#D86B3D]" />
      <p className="mt-3 text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#37352f]">{value}</p>
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
