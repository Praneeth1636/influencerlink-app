import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedWriteProcedure, publicProcedure } from "@/server/trpc";
import { followTarget, listFollowers, listFollowing, unfollowTarget } from "@/server/services/follow-service";

const followTargetInput = z.object({
  followedType: z.enum(["creator", "brand"]),
  followedId: z.string().uuid()
});

export const followRouter = createTRPCRouter({
  follow: protectedWriteProcedure
    .input(followTargetInput)
    .mutation(({ ctx, input }) => followTarget(ctx.db, ctx.user, input)),

  unfollow: protectedWriteProcedure
    .input(followTargetInput)
    .mutation(({ ctx, input }) => unfollowTarget(ctx.db, ctx.user, input)),

  listFollowers: publicProcedure
    .input(
      followTargetInput.extend({
        limit: z.number().int().min(1).max(100).default(50)
      })
    )
    .query(({ ctx, input }) => listFollowers(ctx.db, input)),

  listFollowing: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).default(50)
      })
    )
    .query(({ ctx, input }) => listFollowing(ctx.db, { userId: input.userId ?? ctx.user.id, limit: input.limit }))
});
