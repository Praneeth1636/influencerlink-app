import type { inferRouterOutputs } from "@trpc/server";
import { buildSeedData, type SeedData } from "@/lib/db/seed";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type JobListRow = RouterOutputs["job"]["list"][number];
type JobDetailRow = NonNullable<RouterOutputs["job"]["byId"]>;

export type JobBoardFilters = {
  niche?: string;
  minBudgetCents?: number;
  remote?: boolean;
};

export type JobBoardItem = {
  id: string;
  title: string;
  description: string;
  brandName: string;
  brandSlug: string;
  industry: string;
  hqLocation: string;
  niches: string[];
  deliverables: string[];
  minFollowers: number | null;
  minEngagement: number | null;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  deadline: Date | null;
  remote: boolean;
  location: string | null;
  applicationCount: number;
  fitScore: number;
};

export function mapJobRows(rows: JobListRow[]): JobBoardItem[] {
  return rows.map((row) => toJobBoardItem(row));
}

export function mapJobDetail(row: JobDetailRow): JobBoardItem {
  return toJobBoardItem(row);
}

export function buildSeedJobBoardItems(filters: JobBoardFilters = {}, seed: SeedData = buildSeedData()) {
  const niche = filters.niche?.trim().toLowerCase();

  return seed.jobs
    .filter((job) => job.status === "open")
    .map((job) => {
      const brand = seed.brands.find((row) => row.id === job.brandId);

      return toJobBoardItem({
        job: toSeedJob(job),
        brand: {
          id: brand?.id ?? "",
          slug: brand?.slug ?? "brand",
          name: brand?.name ?? "Brand",
          tagline: brand?.tagline ?? null,
          about: brand?.about ?? null,
          websiteUrl: brand?.websiteUrl ?? null,
          logoUrl: brand?.logoUrl ?? null,
          coverUrl: brand?.coverUrl ?? null,
          industry: brand?.industry ?? "Consumer",
          sizeRange: brand?.sizeRange ?? null,
          hqLocation: brand?.hqLocation ?? "Remote",
          verified: brand?.verified ?? false,
          followerCount: brand?.followerCount ?? 0,
          createdAt: brand?.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
          updatedAt: brand?.updatedAt ?? new Date("2026-04-01T00:00:00.000Z")
        }
      });
    })
    .filter((job) => {
      const nicheMatch = niche ? job.niches.some((value) => value.toLowerCase() === niche) : true;
      const budgetMatch = filters.minBudgetCents ? (job.budgetMaxCents ?? 0) >= filters.minBudgetCents : true;
      const remoteMatch = typeof filters.remote === "boolean" ? job.remote === filters.remote : true;

      return nicheMatch && budgetMatch && remoteMatch;
    })
    .sort((a, b) => b.fitScore - a.fitScore || b.applicationCount - a.applicationCount)
    .slice(0, 24);
}

export function getSeedJobBoardItem(id: string, seed: SeedData = buildSeedData()) {
  return buildSeedJobBoardItems({}, seed).find((job) => job.id === id) ?? null;
}

function toJobBoardItem(row: JobListRow | JobDetailRow): JobBoardItem {
  const deliverables = row.job.deliverables
    .map((deliverable) => {
      const title = deliverable.title;
      return typeof title === "string" ? title : null;
    })
    .filter((value): value is string => Boolean(value));
  const minEngagement = row.job.minEngagement ? Number(row.job.minEngagement) : null;

  return {
    id: row.job.id,
    title: row.job.title,
    description: row.job.description,
    brandName: row.brand.name,
    brandSlug: row.brand.slug,
    industry: row.brand.industry ?? "Consumer",
    hqLocation: row.brand.hqLocation ?? "Remote",
    niches: row.job.niches,
    deliverables,
    minFollowers: row.job.minFollowers,
    minEngagement,
    budgetMinCents: row.job.budgetMinCents,
    budgetMaxCents: row.job.budgetMaxCents,
    deadline: row.job.deadline,
    remote: row.job.remote,
    location: row.job.location,
    applicationCount: row.job.applicationCount,
    fitScore: calculateFitScore({
      budgetMaxCents: row.job.budgetMaxCents,
      minEngagement,
      remote: row.job.remote,
      applicationCount: row.job.applicationCount
    })
  };
}

function toSeedJob(job: SeedData["jobs"][number]): JobListRow["job"] {
  return {
    id: job.id!,
    brandId: job.brandId,
    postedById: job.postedById,
    title: job.title,
    description: job.description,
    deliverables: job.deliverables ?? [],
    niches: job.niches ?? [],
    minFollowers: job.minFollowers ?? null,
    minEngagement: job.minEngagement ?? null,
    budgetMinCents: job.budgetMinCents ?? null,
    budgetMaxCents: job.budgetMaxCents ?? null,
    deadline: job.deadline ?? null,
    location: job.location ?? null,
    remote: job.remote ?? true,
    status: job.status ?? "open",
    applicationCount: job.applicationCount ?? 0,
    createdAt: job.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: job.updatedAt ?? new Date("2026-04-01T00:00:00.000Z")
  };
}

function calculateFitScore(input: {
  budgetMaxCents: number | null;
  minEngagement: number | null;
  remote: boolean;
  applicationCount: number;
}) {
  const budgetScore = Math.min(38, Math.round((input.budgetMaxCents ?? 0) / 20_000));
  const engagementScore = Math.min(28, Math.round((input.minEngagement ?? 0) * 6));
  const remoteScore = input.remote ? 14 : 8;
  const momentumScore = Math.min(19, Math.round(input.applicationCount / 3));

  return Math.min(99, budgetScore + engagementScore + remoteScore + momentumScore);
}
