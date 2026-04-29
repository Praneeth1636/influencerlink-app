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
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_2%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href={`/jobs/${board.jobId}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Brief
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/jobs"
          >
            Jobs
          </Link>
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
          <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
            <BriefcaseBusiness className="mr-2 h-3.5 w-3.5" />
            Applicant pipeline
          </Badge>
          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            Manage applicants for {board.brandName}.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">{board.title}</p>
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
              <div
                className="grid content-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                key={column.status}
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-black tracking-[0.14em] text-white/52 uppercase">{column.label}</h2>
                  <span className="rounded-full bg-white/8 px-2 py-1 text-xs font-black text-white/48">
                    {applicants.length}
                  </span>
                </div>

                {applicants.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm leading-6 text-white/42">
                    No creators in this stage yet.
                  </div>
                ) : (
                  applicants.map((applicant) => (
                    <article className="rounded-xl border border-white/10 bg-black/25 p-4" key={applicant.id}>
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-black">
                          {initials(applicant.displayName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              className="font-black text-white hover:text-[#ffb49c]"
                              href={`/profile/${applicant.handle}`}
                            >
                              {applicant.displayName}
                            </Link>
                            {applicant.verified && <BadgeCheck className="h-4 w-4 text-[#ffb49c]" />}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/48">{applicant.headline}</p>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/58">{applicant.pitch}</p>

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
                            className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-black text-white/50"
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
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
      <Icon className="h-3.5 w-3.5 text-[#ffb49c]" />
      <p className="mt-2 text-[9px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-black text-white">{value}</p>
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
