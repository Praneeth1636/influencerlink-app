import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc";
import { commentOnPost, createPost, likePost, listPosts, sharePost, unlikePost } from "@/server/services/post-service";

const mediaItemInput = z.record(z.string(), z.unknown());
const postTypeInput = z.enum(["update", "milestone", "content_drop", "open_to_work", "job_share"]);
const visibilityInput = z.enum(["public", "connections"]);

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        authorType: z.enum(["creator", "brand"]).default("creator"),
        brandId: z.string().uuid().optional(),
        body: z.string().trim().min(1).max(3_000),
        mediaJson: z.array(mediaItemInput).max(10).default([]),
        type: postTypeInput.default("update"),
        visibility: visibilityInput.default("public")
      })
    )
    .mutation(({ ctx, input }) => createPost(ctx.db, ctx.user, input)),

  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
        authorType: z.enum(["creator", "brand"]).optional(),
        authorId: z.string().uuid().optional()
      })
    )
    .query(({ ctx, input }) => listPosts(ctx.db, input)),

  like: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(({ ctx, input }) => likePost(ctx.db, ctx.user, input.postId)),

  unlike: protectedProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(({ ctx, input }) => unlikePost(ctx.db, ctx.user, input.postId)),

  comment: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        body: z.string().trim().min(1).max(1_000),
        parentId: z.string().uuid().optional()
      })
    )
    .mutation(({ ctx, input }) => commentOnPost(ctx.db, ctx.user, input)),

  share: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        body: z.string().trim().max(1_000).optional()
      })
    )
    .mutation(({ ctx, input }) => sharePost(ctx.db, ctx.user, input))
});
