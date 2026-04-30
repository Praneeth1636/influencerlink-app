// Match service. Uses the persisted embeddings + pgvector cosine distance
// (the <=> operator) to rank creators against a job brief and vice versa.
// Returns a normalised match score (0..100) so UI components can display it
// without knowing which embedder produced it.

import { and, eq, sql } from "drizzle-orm";
import { creatorAggregates, creators, embeddings, jobs } from "@/lib/db/schema";
import { buildCreatorEmbeddingText, buildJobEmbeddingText, getEmbedder } from "@/lib/ai/embedder";
import { logger } from "@/lib/logger";
import type { Database } from "@/server/trpc";

const log = logger.child({ module: "match-service" });

export type CreatorMatch = {
  creator: {
    id: string;
    handle: string;
    displayName: string;
    headline: string | null;
    bio: string | null;
    niches: string[];
    avatarUrl: string | null;
    location: string | null;
    verified: boolean;
    openToCollabs: boolean;
  };
  aggregate: {
    totalReach: number;
    weightedEngagement: string;
  } | null;
  matchScore: number; // 0..100, higher is better
  cosineSimilarity: number; // -1..1, raw signal
};

export type JobMatch = {
  job: {
    id: string;
    title: string;
    description: string;
    niches: string[];
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    location: string | null;
  };
  matchScore: number;
  cosineSimilarity: number;
};

function cosineToScore(distance: number): { similarity: number; score: number } {
  // pgvector's cosine *distance* is (1 - similarity). Map similarity (-1..1)
  // onto a 0..100 score, clamping to non-negative so unrelated content doesn't
  // produce confusing negative percentages.
  const similarity = Math.max(-1, Math.min(1, 1 - distance));
  const score = Math.round(Math.max(0, similarity) * 100);
  return { similarity, score };
}

async function fetchVectorForEntity(
  db: Database,
  entityType: "creator" | "job",
  entityId: string
): Promise<number[] | null> {
  const [row] = await db
    .select({ embedding: embeddings.embedding })
    .from(embeddings)
    .where(and(eq(embeddings.entityType, entityType), eq(embeddings.entityId, entityId)))
    .limit(1);
  return row?.embedding ?? null;
}

/**
 * Rank creators for a given job brief. Falls back to embedding the job text
 * live when no persisted job vector exists yet (e.g., the job was created
 * before embeddings were enabled).
 */
export async function findCreatorsForJob(
  db: Database,
  args: { jobId: string; limit: number }
): Promise<CreatorMatch[]> {
  const queryVector = await loadOrComputeJobVector(db, args.jobId);
  if (!queryVector) return [];

  return findCreatorsForVector(db, { queryVector, limit: args.limit });
}

export async function findCreatorsForVector(
  db: Database,
  args: { queryVector: number[]; limit: number }
): Promise<CreatorMatch[]> {
  const distanceExpr = sql<number>`${embeddings.embedding} <=> ${vectorLiteral(args.queryVector)}::vector`;

  const rows = await db
    .select({
      creator: {
        id: creators.id,
        handle: creators.handle,
        displayName: creators.displayName,
        headline: creators.headline,
        bio: creators.bio,
        niches: creators.niches,
        avatarUrl: creators.avatarUrl,
        location: creators.location,
        verified: creators.verified,
        openToCollabs: creators.openToCollabs
      },
      aggregate: {
        totalReach: creatorAggregates.totalReach,
        weightedEngagement: creatorAggregates.weightedEngagement
      },
      distance: distanceExpr
    })
    .from(embeddings)
    .innerJoin(creators, eq(creators.id, embeddings.entityId))
    .leftJoin(creatorAggregates, eq(creatorAggregates.creatorId, creators.id))
    .where(eq(embeddings.entityType, "creator"))
    .orderBy(distanceExpr)
    .limit(args.limit);

  return rows.map((row) => {
    const { similarity, score } = cosineToScore(Number(row.distance));
    return {
      creator: row.creator,
      aggregate: row.aggregate?.totalReach != null ? row.aggregate : null,
      matchScore: score,
      cosineSimilarity: similarity
    };
  });
}

/**
 * Rank jobs for a given creator. Used on the creator-side "best briefs for you"
 * surface and to score applications in the brand-side applicants pipeline.
 */
export async function findJobsForCreator(
  db: Database,
  args: { creatorId: string; limit: number }
): Promise<JobMatch[]> {
  const queryVector = await loadOrComputeCreatorVector(db, args.creatorId);
  if (!queryVector) return [];

  return findJobsForVector(db, { queryVector, limit: args.limit });
}

export async function findJobsForVector(
  db: Database,
  args: { queryVector: number[]; limit: number }
): Promise<JobMatch[]> {
  const distanceExpr = sql<number>`${embeddings.embedding} <=> ${vectorLiteral(args.queryVector)}::vector`;

  const rows = await db
    .select({
      job: {
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        niches: jobs.niches,
        budgetMinCents: jobs.budgetMinCents,
        budgetMaxCents: jobs.budgetMaxCents,
        location: jobs.location
      },
      distance: distanceExpr
    })
    .from(embeddings)
    .innerJoin(jobs, eq(jobs.id, embeddings.entityId))
    .where(and(eq(embeddings.entityType, "job"), eq(jobs.status, "open")))
    .orderBy(distanceExpr)
    .limit(args.limit);

  return rows.map((row) => {
    const { similarity, score } = cosineToScore(Number(row.distance));
    return {
      job: row.job,
      matchScore: score,
      cosineSimilarity: similarity
    };
  });
}

async function loadOrComputeJobVector(db: Database, jobId: string): Promise<number[] | null> {
  const persisted = await fetchVectorForEntity(db, "job", jobId);
  if (persisted) return persisted;

  const [job] = await db
    .select({
      title: jobs.title,
      description: jobs.description,
      niches: jobs.niches,
      location: jobs.location
    })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  if (!job) {
    log.warn({ jobId }, "no job, no match");
    return null;
  }
  const embedder = getEmbedder();
  return embedder.embed({ text: buildJobEmbeddingText(job), purpose: "job-brief" });
}

async function loadOrComputeCreatorVector(db: Database, creatorId: string): Promise<number[] | null> {
  const persisted = await fetchVectorForEntity(db, "creator", creatorId);
  if (persisted) return persisted;

  const [creator] = await db
    .select({
      displayName: creators.displayName,
      handle: creators.handle,
      headline: creators.headline,
      bio: creators.bio,
      niches: creators.niches,
      location: creators.location
    })
    .from(creators)
    .where(eq(creators.id, creatorId))
    .limit(1);
  if (!creator) {
    log.warn({ creatorId }, "no creator, no match");
    return null;
  }
  const embedder = getEmbedder();
  return embedder.embed({ text: buildCreatorEmbeddingText(creator), purpose: "creator-profile" });
}

// pgvector accepts both the canonical "[1,2,3]" string form and JSON array.
// Use the bracketed form so it round-trips through prepared statements safely.
function vectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}
