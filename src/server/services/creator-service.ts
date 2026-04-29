import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, ilike, inArray, or, sql } from "drizzle-orm";
import {
  creatorAggregates,
  creatorPlatforms,
  creators,
  platformMetrics,
  posts,
  type Creator,
  type User
} from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type CreatorListInput = {
  limit: number;
  cursor?: string;
  niche?: string;
  minReach?: number;
  openToCollabs?: boolean;
};

export type CreatorSearchInput = {
  query: string;
  limit: number;
};

export type CreatorUpdateInput = Partial<
  Pick<
    Creator,
    | "displayName"
    | "bio"
    | "headline"
    | "location"
    | "niches"
    | "avatarUrl"
    | "coverUrl"
    | "openToCollabs"
    | "ratesPublic"
    | "baseRateCents"
    | "currency"
  >
>;

export async function listCreators(db: Database, input: CreatorListInput) {
  const filters = [
    input.cursor ? sql`${creators.id} > ${input.cursor}` : undefined,
    input.niche ? sql`${creators.niches} @> ARRAY[${input.niche}]::text[]` : undefined,
    typeof input.minReach === "number" ? gte(creatorAggregates.totalReach, input.minReach) : undefined,
    typeof input.openToCollabs === "boolean" ? eq(creators.openToCollabs, input.openToCollabs) : undefined
  ].filter(Boolean);

  const rows = await db
    .select({
      creator: creators,
      aggregate: creatorAggregates
    })
    .from(creators)
    .leftJoin(creatorAggregates, eq(creatorAggregates.creatorId, creators.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(creatorAggregates.totalReach), desc(creators.createdAt))
    .limit(input.limit + 1);

  return {
    items: rows.slice(0, input.limit),
    nextCursor: rows.length > input.limit ? rows[input.limit]?.creator.id : null
  };
}

export async function getCreatorById(db: Database, id: string) {
  const [row] = await db.select().from(creators).where(eq(creators.id, id)).limit(1);
  return row ?? null;
}

export async function getCreatorByHandle(db: Database, handle: string) {
  const [row] = await db.select().from(creators).where(eq(creators.handle, handle)).limit(1);
  return row ?? null;
}

export async function getCreatorProfileByHandle(db: Database, handle: string) {
  const [profile] = await db
    .select({
      creator: creators,
      aggregate: creatorAggregates
    })
    .from(creators)
    .leftJoin(creatorAggregates, eq(creatorAggregates.creatorId, creators.id))
    .where(eq(creators.handle, handle))
    .limit(1);

  if (!profile) {
    return null;
  }

  const platformRows = await db
    .select()
    .from(creatorPlatforms)
    .where(eq(creatorPlatforms.creatorId, profile.creator.id))
    .orderBy(desc(creatorPlatforms.lastSyncedAt));

  const metrics =
    platformRows.length > 0
      ? await db
          .select()
          .from(platformMetrics)
          .where(
            inArray(
              platformMetrics.creatorPlatformId,
              platformRows.map((platform) => platform.id)
            )
          )
          .orderBy(desc(platformMetrics.snapshotDate))
      : [];

  const latestMetricsByPlatform = new Map<string, (typeof metrics)[number]>();
  for (const metric of metrics) {
    if (!latestMetricsByPlatform.has(metric.creatorPlatformId)) {
      latestMetricsByPlatform.set(metric.creatorPlatformId, metric);
    }
  }

  const creatorPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.authorType, "creator"), eq(posts.authorId, profile.creator.id)))
    .orderBy(desc(posts.createdAt))
    .limit(12);

  return {
    ...profile,
    platforms: platformRows.map((platform) => ({
      platform,
      latestMetrics: latestMetricsByPlatform.get(platform.id) ?? null
    })),
    posts: creatorPosts
  };
}

export async function searchCreators(db: Database, input: CreatorSearchInput) {
  const query = `%${input.query}%`;

  return db
    .select({
      creator: creators,
      aggregate: creatorAggregates
    })
    .from(creators)
    .leftJoin(creatorAggregates, eq(creatorAggregates.creatorId, creators.id))
    .where(
      or(
        ilike(creators.handle, query),
        ilike(creators.displayName, query),
        ilike(creators.bio, query),
        ilike(creators.headline, query),
        sql`${creators.niches}::text ILIKE ${query}`
      )
    )
    .orderBy(desc(creatorAggregates.totalReach), desc(creators.createdAt))
    .limit(input.limit);
}

export async function updateCreatorProfile(db: Database, user: User, creator: Creator, input: CreatorUpdateInput) {
  const [updated] = await db
    .update(creators)
    .set({
      ...input,
      updatedAt: new Date()
    })
    .where(eq(creators.id, creator.id))
    .returning();

  if (!updated) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Creator profile not found"
    });
  }

  await writeAuditLog(db, {
    user,
    action: "creator.update",
    entityType: "creator",
    entityId: creator.id,
    metadata: { fields: Object.keys(input) }
  });

  return updated;
}
