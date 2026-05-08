import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getSeedApplicantsBoard,
  mapApplicantsBoard,
  type ApplicantStatus,
  type JobApplicantsBoard
} from "@/lib/jobs/applicants";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import { ApplicantStatusActions } from "./status-actions";

type ApplicantsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const columns: Array<{ label: string; status: ApplicantStatus }> = [
  { label: "Submitted", status: "submitted" },
  { label: "Shortlisted", status: "shortlisted" },
  { label: "Hired", status: "hired" },
  { label: "Rejected", status: "rejected" }
];

export default async function ApplicantsPage({ params }: ApplicantsPageProps) {
  const { id } = await params;
  const board = await getApplicants(id);

  if (!board) {
    notFound();
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
            href={`/jobs/${board.jobId}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Brief
          </Link>
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
            href="/jobs"
          >
            Jobs
          </Link>
        </div>

        <article className="border-border bg-card rounded-xl border p-6">
          <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
            <BriefcaseBusiness className="mr-2 h-3.5 w-3.5" />
            Applicant pipeline
          </Badge>
          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            Manage applicants for {board.brandName}.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-7">{board.title}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {columns.map((column) => (
              <MiniStat
                key={column.status}
                label={column.label}
                value={String(board.applicants.filter((applicant) => applicant.status === column.status).length)}
              />
            ))}
          </div>
        </article>

        <section className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => {
            const applicants = board.applicants.filter((applicant) => applicant.status === column.status);

            return (
              <div className="border-border bg-card grid content-start gap-3 rounded-xl border p-3" key={column.status}>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-muted-foreground text-sm font-black tracking-[0.14em] uppercase">
                    {column.label}
                  </h2>
                  <span className="bg-muted/40 text-foreground/48 rounded-full px-2 py-1 text-xs font-black">
                    {applicants.length}
                  </span>
                </div>

                {applicants.length === 0 ? (
                  <div className="border-border text-muted-foreground rounded-xl border border-dashed p-4 text-sm leading-6">
                    No creators in this stage yet.
                  </div>
                ) : (
                  applicants.map((applicant) => (
                    <article className="border-border bg-muted/30 rounded-xl border p-4" key={applicant.id}>
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-black">
                          {initials(applicant.displayName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              className="text-foreground hover:text-primary font-black"
                              href={`/profile/${applicant.handle}`}
                            >
                              {applicant.displayName}
                            </Link>
                            {applicant.verified && <BadgeCheck className="text-primary h-4 w-4" />}
                          </div>
                          <p className="text-foreground/48 mt-1 line-clamp-2 text-xs leading-5">{applicant.headline}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground mt-4 line-clamp-4 text-sm leading-6">{applicant.pitch}</p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Metric icon={Users} label="Reach" value={formatNumber(applicant.totalReach)} />
                        <Metric
                          icon={DollarSign}
                          label="Rate"
                          value={applicant.proposedRateCents ? formatMoney(applicant.proposedRateCents) : "Open"}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {applicant.niches.slice(0, 3).map((niche) => (
                          <span
                            className="bg-muted/40 text-foreground/50 rounded-full px-2.5 py-1 text-[10px] font-black"
                            key={niche}
                          >
                            {niche}
                          </span>
                        ))}
                      </div>

                      <ApplicantStatusActions
                        applicationId={applicant.id}
                        brandId={board.brandId}
                        currentStatus={applicant.status}
                      />
                    </article>
                  ))
                )}
              </div>
            );
          })}
        </section>
      </section>
    </main>
  );
}

async function getApplicants(jobId: string): Promise<JobApplicantsBoard | null> {
  try {
    const caller = await createTRPCServerCaller();
    const job = await caller.job.byId({ id: jobId });

    if (!job) {
      return getSeedApplicantsBoard(jobId);
    }

    return mapApplicantsBoard(
      await caller.job.applicants({
        brandId: job.brand.id,
        jobId
      })
    );
  } catch {
    return getSeedApplicantsBoard(jobId);
  }
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-muted/30 rounded-xl border p-3">
      <p className="text-muted-foreground text-[10px] font-black tracking-[0.14em] uppercase">{label}</p>
      <p className="text-foreground mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="border-border bg-muted/20 rounded-lg border p-2">
      <Icon className="text-primary h-3.5 w-3.5" />
      <p className="text-muted-foreground mt-2 text-[9px] font-black tracking-[0.14em] uppercase">{label}</p>
      <p className="text-foreground mt-0.5 text-xs font-black">{value}</p>
    </div>
  );
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value / 100);
}
