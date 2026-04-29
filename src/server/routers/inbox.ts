import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedWriteProcedure } from "@/server/trpc";
import {
  getThreadById,
  listThreads,
  markThreadRead,
  sendMessage,
  startDirectThread
} from "@/server/services/inbox-service";

const attachmentInput = z.record(z.string(), z.unknown());

export const inboxRouter = createTRPCRouter({
  listThreads: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20)
      })
    )
    .query(({ ctx, input }) => listThreads(ctx.db, ctx.user, input)),

  threadById: protectedProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .query(({ ctx, input }) => getThreadById(ctx.db, ctx.user, input.threadId)),

  markRead: protectedWriteProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .mutation(({ ctx, input }) => markThreadRead(ctx.db, ctx.user, input.threadId)),

  sendMessage: protectedWriteProcedure
    .input(
      z.object({
        threadId: z.string().uuid(),
        body: z.string().trim().min(1).max(4_000),
        attachments: z.array(attachmentInput).max(10).default([]),
        replyToId: z.string().uuid().optional()
      })
    )
    .mutation(({ ctx, input }) => sendMessage(ctx.db, ctx.user, input)),

  startDirectThread: protectedWriteProcedure
    .input(
      z.object({
        participantUserId: z.string().uuid(),
        body: z.string().trim().min(1).max(4_000)
      })
    )
    .mutation(({ ctx, input }) => startDirectThread(ctx.db, ctx.user, input))
});
