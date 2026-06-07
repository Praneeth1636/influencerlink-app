import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaymentTile, type PaymentTileData } from "@/components/domain/payment-tile";
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

  // Look up brief_payments for hired applicants so we can render the PaymentTile
  // inline. We key by applicationId. Safe to call even before any hires —
  // listForBrand returns [] for new brands. Soft-fail if Stripe isn't
  // configured yet (dev without keys).
  const paymentByApplication = await loadPayments(board.brandId).catch(() => new Map<string, PaymentTileData>());

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-3 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f]"
            href={`/jobs/${board.jobId}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Brief
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-3 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] hover:text-[#37352f]"
            href="/jobs"
          >
            Jobs
          </Link>
        </div>

        <article className="rounded-[30px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_54px_rgba(17,24,39,0.04)]">
          <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-[#D86B3D] hover:bg-[#faf0ea]">
            <BriefcaseBusiness className="mr-2 h-3.5 w-3.5" />
            Applicant pipeline
          </Badge>
          <h1 className="mt-5 max-w-4xl text-[clamp(34px,6vw,68px)] leading-[0.96] font-semibold tracking-[-0.06em]">
            Manage applicants for {board.brandName}.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#787774]">{board.title}</p>
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
                className="grid content-start gap-3 rounded-[26px] border border-[#e9e9e7] bg-white p-3 shadow-[0_14px_40px_rgba(17,24,39,0.035)]"
                key={column.status}
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold tracking-[0.14em] text-[#8a94a5] uppercase">{column.label}</h2>
                  <span className="rounded-full border border-[#e9e9e7] bg-[#fbfbfa] px-2 py-1 text-xs font-semibold text-[#787774]">
                    {applicants.length}
                  </span>
                </div>

                {applicants.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#d8dee8] p-4 text-sm leading-6 text-[#787774]">
                    No creators in this stage yet.
                  </div>
                ) : (
                  applicants.map((applicant) => (
                    <article className="rounded-[22px] border border-[#e9e9e7] bg-[#fbfbfa] p-4" key={applicant.id}>
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dff1fb] text-sm font-semibold text-[#37352f]">
                          {initials(applicant.displayName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              className="font-semibold text-[#37352f] hover:text-[#D86B3D]"
                              href={`/profile/${applicant.handle}`}
                            >
                              {applicant.displayName}
                            </Link>
                            {applicant.verified && <BadgeCheck className="h-4 w-4 text-[#D86B3D]" />}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#787774]">{applicant.headline}</p>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#787774]">{applicant.pitch}</p>

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
                            className="rounded-full border border-[#e9e9e7] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#787774]"
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

                      {paymentByApplication.get(applicant.id) && (
                        <div className="mt-4">
                          <PaymentTile
                            payment={paymentByApplication.get(applicant.id)!}
                            viewer="brand"
                            brandId={board.brandId}
                          />
                        </div>
                      )}
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

async function loadPayments(brandId: string): Promise<Map<string, PaymentTileData>> {
  const caller = await createTRPCServerCaller();
  const rows = await caller.payment.listForBrand({ brandId });
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#37352f]">{value}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-white p-2">
      <Icon className="h-3.5 w-3.5 text-[#D86B3D]" />
      <p className="mt-2 text-[9px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-[#37352f]">{value}</p>
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
