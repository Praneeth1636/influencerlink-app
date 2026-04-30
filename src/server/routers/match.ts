import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { findCreatorsForJob, findJobsForCreator } from "@/server/services/match-service";

export const matchRouter = createTRPCRouter({
  creatorsForJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string().uuid(),
        limit: z.number().int().min(1).max(50).default(20)
      })
    )
    .query(({ ctx, input }) => findCreatorsForJob(ctx.db, input)),

  jobsForCreator: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().uuid(),
        limit: z.number().int().min(1).max(50).default(20)
      })
    )
    .query(({ ctx, input }) => findJobsForCreator(ctx.db, input))
});
