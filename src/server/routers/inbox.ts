import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedWriteProcedure } from "@/server/trpc";
import { listThreads, markThreadRead } from "@/server/services/inbox-service";

export const inboxRouter = createTRPCRouter({
  listThreads: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20)
      })
    )
    .query(({ ctx, input }) => listThreads(ctx.db, ctx.user, input)),

  markRead: protectedWriteProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .mutation(({ ctx, input }) => markThreadRead(ctx.db, ctx.user, input.threadId))
});
