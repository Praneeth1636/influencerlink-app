import type { inferRouterOutputs } from "@trpc/server";
import { buildSeedData, type SeedData } from "@/lib/db/seed";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type ApplicantsRow = RouterOutputs["job"]["applicants"];
type ApplicantRow = ApplicantsRow["applicants"][number];

export type ApplicantStatus = "submitted" | "shortlisted" | "rejected" | "hired";

export type JobApplicant = {
  id: string;
  creatorId: string;
  handle: string;
  displayName: string;
  headline: string;
  location: string;
  niches: string[];
  verified: boolean;
  pitch: string;
  proposedRateCents: number | null;
  status: ApplicantStatus;
  totalReach: number;
  weightedEngagement: number;
  createdAt: Date;
};

export type JobApplicantsBoard = {
  jobId: string;
  brandId: string;
  brandName: string;
  title: string;
  applicants: JobApplicant[];
};

export function mapApplicantsBoard(row: ApplicantsRow): JobApplicantsBoard {
  return {
    jobId: row.job.id,
    brandId: row.brand.id,
    brandName: row.brand.name,
    title: row.job.title,
    applicants: row.applicants.map(toApplicant)
  };
}

export function getSeedApplicantsBoard(jobId: string, seed: SeedData = buildSeedData()): JobApplicantsBoard | null {
  const job = seed.jobs.find((row) => row.id === jobId);

  if (!job) {
    return null;
  }

  const brand = seed.brands.find((row) => row.id === job.brandId);
  const applicants = seed.jobApplications
    .filter((application) => application.jobId === jobId)
    .map((application): JobApplicant | null => {
      const creator = seed.creators.find((row) => row.id === application.creatorId);

      if (!creator) {
        return null;
      }

      const aggregate = seed.creatorAggregates.find((row) => row.creatorId === creator.id);

      return {
        id: application.id!,
        creatorId: creator.id!,
        handle: creator.handle,
        displayName: creator.displayName,
        headline: creator.headline ?? "Creator",
        location: creator.location ?? "Remote",
        niches: creator.niches ?? [],
        verified: creator.verified ?? false,
        pitch: application.pitch,
        proposedRateCents: application.proposedRateCents ?? null,
        status: application.status ?? "submitted",
        totalReach: aggregate?.totalReach ?? 0,
        weightedEngagement: Number(aggregate?.weightedEngagement ?? 0),
        createdAt: application.createdAt ?? new Date("2026-04-01T00:00:00.000Z")
      };
    })
    .filter((application): application is JobApplicant => Boolean(application));

  return {
    jobId,
    brandId: job.brandId,
    brandName: brand?.name ?? "Brand",
    title: job.title,
    applicants
  };
}

function toApplicant(row: ApplicantRow): JobApplicant {
  return {
    id: row.application.id,
    creatorId: row.creator.id,
    handle: row.creator.handle,
    displayName: row.creator.displayName,
    headline: row.creator.headline ?? "Creator",
    location: row.creator.location ?? "Remote",
    niches: row.creator.niches,
    verified: row.creator.verified,
    pitch: row.application.pitch,
    proposedRateCents: row.application.proposedRateCents,
    status: row.application.status,
    totalReach: row.aggregate?.totalReach ?? 0,
    weightedEngagement: Number(row.aggregate?.weightedEngagement ?? 0),
    createdAt: row.application.createdAt
  };
}
