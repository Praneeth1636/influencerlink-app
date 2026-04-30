// Embedding generation + upsert. Inline-on-write for now (small text, fast
// embedder) — moves to Inngest background jobs in a later phase.

import { eq, and } from "drizzle-orm";
import { creators, embeddings, jobs } from "@/lib/db/schema";
import {
  buildCreatorEmbeddingText,
  buildJobEmbeddingText,
  EMBEDDING_DIMENSIONS,
  getEmbedder,
  type Embedder
} from "@/lib/ai/embedder";
import { logger } from "@/lib/logger";
import type { Database } from "@/server/trpc";

const log = logger.child({ module: "embedding-service" });

type EntityType = "creator" | "job";

async function upsertEmbedding(
  db: Database,
  args: { entityType: EntityType; entityId: string; vector: number[]; model: string }
) {
  if (args.vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding has wrong dimensions: ${args.vector.length} (expected ${EMBEDDING_DIMENSIONS})`);
  }

  // Drop existing rows for this entity then insert. The (entity_type, entity_id)
  // index makes the delete cheap. A single-row upsert isn't possible without a
  // unique constraint on (entity_type, entity_id) which we'd need to add as a
  // schema change — the delete+insert pattern keeps this commit narrow.
  await db
    .delete(embeddings)
    .where(and(eq(embeddings.entityType, args.entityType), eq(embeddings.entityId, args.entityId)));

  await db.insert(embeddings).values({
    entityType: args.entityType,
    entityId: args.entityId,
    model: args.model,
    embedding: args.vector
  });
}

export async function generateCreatorEmbedding(db: Database, creatorId: string, embedder: Embedder = getEmbedder()) {
  const [creator] = await db
    .select({
      id: creators.id,
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
    log.warn({ creatorId }, "creator not found, skipping embedding");
    return null;
  }

  const text = buildCreatorEmbeddingText(creator);
  const vector = await embedder.embed({ text, purpose: "creator-profile" });

  await upsertEmbedding(db, {
    entityType: "creator",
    entityId: creator.id,
    vector,
    model: embedder.model
  });

  log.debug({ creatorId, model: embedder.model }, "creator embedding stored");
  return { creatorId, model: embedder.model };
}

export async function generateJobEmbedding(db: Database, jobId: string, embedder: Embedder = getEmbedder()) {
  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      niches: jobs.niches,
      location: jobs.location
    })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) {
    log.warn({ jobId }, "job not found, skipping embedding");
    return null;
  }

  const text = buildJobEmbeddingText(job);
  const vector = await embedder.embed({ text, purpose: "job-brief" });

  await upsertEmbedding(db, {
    entityType: "job",
    entityId: job.id,
    vector,
    model: embedder.model
  });

  log.debug({ jobId, model: embedder.model }, "job embedding stored");
  return { jobId, model: embedder.model };
}
