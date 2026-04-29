import { z } from "zod";
import { createTRPCRouter, creatorWriteProcedure, protectedProcedure, publicProcedure } from "@/server/trpc";
import {
  getCreatorByHandle,
  getCreatorById,
  getCreatorProfileByHandle,
  listCreators,
  searchCreators,
  updateCreatorProfile
} from "@/server/services/creator-service";

const creatorUpdateInput = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(2_000).nullable().optional(),
  headline: z.string().max(160).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  niches: z.array(z.string().min(1).max(40)).max(12).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  openToCollabs: z.boolean().optional(),
  ratesPublic: z.boolean().optional(),
  baseRateCents: z.number().int().min(0).nullable().optional(),
  currency: z.string().length(3).optional()
});

export const creatorRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
        niche: z.string().min(1).max(40).optional(),
        minReach: z.number().int().min(0).optional(),
        openToCollabs: z.boolean().optional()
      })
    )
    .query(({ ctx, input }) => listCreators(ctx.db, input)),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => getCreatorById(ctx.db, input.id)),

  byHandle: publicProcedure
    .input(z.object({ handle: z.string().min(3).max(30).toLowerCase() }))
    .query(({ ctx, input }) => getCreatorByHandle(ctx.db, input.handle)),

  profile: publicProcedure
    .input(z.object({ handle: z.string().min(3).max(30).toLowerCase() }))
    .query(({ ctx, input }) => getCreatorProfileByHandle(ctx.db, input.handle)),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().trim().min(1).max(120),
        limit: z.number().int().min(1).max(50).default(20)
      })
    )
    .query(({ ctx, input }) => searchCreators(ctx.db, ctx.user, input)),

  update: creatorWriteProcedure.input(creatorUpdateInput).mutation(({ ctx, input }) => {
    return updateCreatorProfile(ctx.db, ctx.user, ctx.creator, input);
  })
});
