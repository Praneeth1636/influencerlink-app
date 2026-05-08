import { z } from "zod";
import { createTRPCRouter, creatorProcedure, creatorWriteProcedure } from "@/server/trpc";
import { and, eq } from "drizzle-orm";
import { creatorPlatforms, platformMetrics } from "@/lib/db/schema";
import { disconnectPlatform, syncInstagramMetrics } from "@/server/services/platform-service";

export const platformRouter = createTRPCRouter({
  // List the creator's connected platforms (no token leakage — just metadata).
  list: creatorProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: creatorPlatforms.id,
        platform: creatorPlatforms.platform,
        externalHandle: creatorPlatforms.externalHandle,
        connectedAt: creatorPlatforms.connectedAt,
        lastSyncedAt: creatorPlatforms.lastSyncedAt
      })
      .from(creatorPlatforms)
      .where(eq(creatorPlatforms.creatorId, ctx.creator.id));
  }),

  // Latest metrics snapshot for a given connection.
  latestMetrics: creatorProcedure.input(z.object({ connectionId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [connection] = await ctx.db
      .select({ id: creatorPlatforms.id })
      .from(creatorPlatforms)
      .where(and(eq(creatorPlatforms.id, input.connectionId), eq(creatorPlatforms.creatorId, ctx.creator.id)))
      .limit(1);
    if (!connection) return null;

    const [snap] = await ctx.db
      .select()
      .from(platformMetrics)
      .where(eq(platformMetrics.creatorPlatformId, input.connectionId))
      .orderBy(platformMetrics.snapshotDate)
      .limit(1);
    return snap ?? null;
  }),

  disconnect: creatorWriteProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(({ ctx, input }) => disconnectPlatform(ctx.db, ctx.user, ctx.creator, input.connectionId)),

  syncInstagram: creatorWriteProcedure
    .input(z.object({ connectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ id: creatorPlatforms.id })
        .from(creatorPlatforms)
        .where(
          and(
            eq(creatorPlatforms.id, input.connectionId),
            eq(creatorPlatforms.creatorId, ctx.creator.id),
            eq(creatorPlatforms.platform, "instagram")
          )
        )
        .limit(1);
      if (!row) {
        throw new Error("Instagram connection not found for this creator");
      }
      return syncInstagramMetrics(ctx.db, input.connectionId);
    })
});
