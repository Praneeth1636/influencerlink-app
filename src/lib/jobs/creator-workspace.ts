import type { inferRouterOutputs } from "@trpc/server";
import { buildSeedData, type SeedData } from "@/lib/db/seed";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type CreatorWorkspaceRow = RouterOutputs["job"]["creatorWorkspace"];
type ApplicationRow = CreatorWorkspaceRow["applications"][number];
type SavedJobRow = CreatorWorkspaceRow["savedJobs"][number];

export type CreatorJobStatus = "submitted" | "shortlisted" | "rejected" | "hired";

export type CreatorWorkspaceJob = {
  id: string;
  title: string;
  description: string;
  brandName: string;
  brandSlug: string;
  industry: string;
  niches: string[];
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  deadline: Date | null;
  remote: boolean;
  location: string | null;
};

export type CreatorApplicationItem = {
  id: string;
  pitch: string;
  proposedRateCents: number | null;
  status: CreatorJobStatus;
  createdAt: Date;
  job: CreatorWorkspaceJob;
};

export type CreatorSavedJobItem = {
  savedAt: Date;
  job: CreatorWorkspaceJob;
};

export type CreatorJobsWorkspace = {
  applications: CreatorApplicationItem[];
  savedJobs: CreatorSavedJobItem[];
};

export function mapCreatorJobsWorkspace(row: CreatorWorkspaceRow): CreatorJobsWorkspace {
  return {
    applications: row.applications.map(toApplicationItem),
    savedJobs: row.savedJobs.map(toSavedJobItem)
  };
}

export function getSeedCreatorJobsWorkspace(
  handle = "sararivera",
  seed: SeedData = buildSeedData()
): CreatorJobsWorkspace {
  const creator = seed.creators.find((row) => row.handle === handle) ?? seed.creators[0]!;

  const applications = seed.jobApplications
    .filter((application) => application.creatorId === creator.id)
    .map((application): CreatorApplicationItem | null => {
      const job = seed.jobs.find((row) => row.id === application.jobId);
      const brand = job ? seed.brands.find((row) => row.id === job.brandId) : undefined;

      if (!job || !brand) {
        return null;
      }

      return {
        id: application.id!,
        pitch: application.pitch,
        proposedRateCents: application.proposedRateCents ?? null,
        status: application.status ?? "submitted",
        createdAt: application.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
        job: toSeedWorkspaceJob(job, brand)
      };
    })
    .filter((application): application is CreatorApplicationItem => Boolean(application));

  const savedJobs = seed.jobSavedByCreator
    .filter((saved) => saved.creatorId === creator.id)
    .map((saved): CreatorSavedJobItem | null => {
      const job = seed.jobs.find((row) => row.id === saved.jobId);
      const brand = job ? seed.brands.find((row) => row.id === job.brandId) : undefined;

      if (!job || !brand) {
        return null;
      }

      return {
        savedAt: saved.savedAt ?? new Date("2026-04-01T00:00:00.000Z"),
        job: toSeedWorkspaceJob(job, brand)
      };
    })
    .filter((saved): saved is CreatorSavedJobItem => Boolean(saved));

  return {
    applications,
    savedJobs
  };
}

function toApplicationItem(row: ApplicationRow): CreatorApplicationItem {
  return {
    id: row.application.id,
    pitch: row.application.pitch,
    proposedRateCents: row.application.proposedRateCents,
    status: row.application.status,
    createdAt: row.application.createdAt,
    job: toWorkspaceJob(row.job, row.brand)
  };
}

function toSavedJobItem(row: SavedJobRow): CreatorSavedJobItem {
  return {
    savedAt: row.saved.savedAt,
    job: toWorkspaceJob(row.job, row.brand)
  };
}

function toWorkspaceJob(job: ApplicationRow["job"], brand: ApplicationRow["brand"]): CreatorWorkspaceJob {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    brandName: brand.name,
    brandSlug: brand.slug,
    industry: brand.industry ?? "Consumer",
    niches: job.niches,
    budgetMinCents: job.budgetMinCents,
    budgetMaxCents: job.budgetMaxCents,
    deadline: job.deadline,
    remote: job.remote,
    location: job.location
  };
}

function toSeedWorkspaceJob(job: SeedData["jobs"][number], brand: SeedData["brands"][number]): CreatorWorkspaceJob {
  return {
    id: job.id!,
    title: job.title,
    description: job.description,
    brandName: brand.name,
    brandSlug: brand.slug,
    industry: brand.industry ?? "Consumer",
    niches: job.niches ?? [],
    budgetMinCents: job.budgetMinCents ?? null,
    budgetMaxCents: job.budgetMaxCents ?? null,
    deadline: job.deadline ?? null,
    remote: job.remote ?? true,
    location: job.location ?? null
  };
}
