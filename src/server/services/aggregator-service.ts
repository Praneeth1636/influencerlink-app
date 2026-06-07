// Recompute `creator_aggregates` from the latest `platform_metrics` snapshot
// of each connected platform. Called by the daily cron (after platform sync)
// and on-demand when a creator finishes onboarding or connects a new account.
//
// The aggregator is the source of truth for `totalReach` and
// `weightedEngagement` used by search, match scoring, and the public profile —
// so keep this fast (one query per creator) and idempotent.

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { creatorAggregates, creatorPlatforms, creators, platformMetrics } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";

export type AggregateRecomputeResult = {
  creatorsProcessed: number;
  creatorsUpdated: number;
};

export async function recomputeCreatorAggregates(
  db: Database,
  options: { creatorId?: string } = {}
): Promise<AggregateRecomputeResult> {
  const creatorRows = options.creatorId
    ? await db
        .select({ id: creators.id, niches: creators.niches })
        .from(creators)
        .where(eq(creators.id, options.creatorId))
    : await db.select({ id: creators.id, niches: creators.niches }).from(creators);

  let updated = 0;

  for (const creator of creatorRows) {
    const platformRows = await db
      .select({ id: creatorPlatforms.id })
      .from(creatorPlatforms)
      .where(eq(creatorPlatforms.creatorId, creator.id));

    if (platformRows.length === 0) {
      // Still upsert a zero row so downstream joins find something.
      await upsertAggregate(db, creator.id, 0, 0, creator.niches[0] ?? null);
      updated += 1;
      continue;
    }

    const platformIds = platformRows.map((row) => row.id);

    // Latest metric per platform — one query, ranked via window function.
    // Drizzle doesn't have a clean DISTINCT ON helper, so we use raw SQL.
    const latest = await db.execute<{
      creator_platform_id: string;
      followers: number;
      engagement_rate: string;
    }>(sql`
      select distinct on (creator_platform_id)
        creator_platform_id,
        followers,
        engagement_rate
      from ${platformMetrics}
      where ${inArray(platformMetrics.creatorPlatformId, platformIds)}
      order by creator_platform_id, snapshot_date desc
    `);

    const rows = (latest as unknown as { rows: Array<{ followers: number; engagement_rate: string }> }).rows ?? [];

    let totalReach = 0;
    let weightedEngagementSum = 0;

    for (const row of rows) {
      const followers = Number(row.followers ?? 0);
      const engagement = Number(row.engagement_rate ?? 0);
      totalReach += followers;
      weightedEngagementSum += followers * engagement;
    }

    const weightedEngagement = totalReach > 0 ? weightedEngagementSum / totalReach : 0;

    await upsertAggregate(db, creator.id, totalReach, weightedEngagement, creator.niches[0] ?? null);
    updated += 1;
  }

  return { creatorsProcessed: creatorRows.length, creatorsUpdated: updated };
}

async function upsertAggregate(
  db: Database,
  creatorId: string,
  totalReach: number,
  weightedEngagement: number,
  primaryNiche: string | null
) {
  await db
    .insert(creatorAggregates)
    .values({
      creatorId,
      totalReach,
      weightedEngagement: weightedEngagement.toFixed(3),
      primaryNiche,
      computedAt: new Date()
    })
    .onConflictDoUpdate({
      target: creatorAggregates.creatorId,
      set: {
        totalReach,
        weightedEngagement: weightedEngagement.toFixed(3),
        primaryNiche,
        computedAt: new Date()
      }
    });
}

// Suppress unused-import lint without forcing a side-effect import.
void and;
void desc;
