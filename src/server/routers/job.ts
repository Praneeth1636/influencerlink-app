import { z } from "zod";
import {
  brandProcedure,
  brandWriteProcedure,
  createTRPCRouter,
  creatorWriteProcedure,
  creatorProcedure,
  publicProcedure
} from "@/server/trpc";
import {
  applyToJob,
  createJob,
  getJobById,
  listCreatorJobWorkspace,
  listJobApplicants,
  listJobs,
  saveJob,
  unsaveJob,
  updateJobApplicationStatus
} from "@/server/services/job-service";

const deliverableInput = z.record(z.string(), z.unknown());

export const jobRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        niche: z.string().min(1).max(40).optional(),
        minBudgetCents: z.number().int().min(0).optional(),
        remote: z.boolean().optional()
      })
    )
    .query(({ ctx, input }) => listJobs(ctx.db, input)),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => getJobById(ctx.db, input.id)),

  create: brandWriteProcedure
    .input(
      z.object({
        title: z.string().trim().min(8).max(140),
        description: z.string().trim().min(30).max(6_000),
        deliverables: z.array(deliverableInput).min(1).max(12),
        niches: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
        minFollowers: z.number().int().min(0).optional(),
        minEngagement: z
          .string()
          .regex(/^\d{1,3}(\.\d{1,3})?$/)
          .optional(),
        budgetMinCents: z.number().int().min(0).optional(),
        budgetMaxCents: z.number().int().min(0).optional(),
        deadline: z.coerce.date().optional(),
        location: z.string().trim().min(1).max(120).optional(),
        remote: z.boolean().default(true),
        status: z.enum(["draft", "open"]).default("draft")
      })
    )
    .mutation(({ ctx, input }) =>
      createJob(ctx.db, ctx.user, ctx.brandMember, {
        ...input,
        brandId: ctx.brandId
      })
    ),

  applicants: brandProcedure
    .input(
      z.object({
        jobId: z.string().uuid()
      })
    )
    .query(({ ctx, input }) =>
      listJobApplicants(ctx.db, ctx.user, ctx.brandMember, {
        ...input,
        brandId: ctx.brandId
      })
    ),

  updateApplicationStatus: brandWriteProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
        status: z.enum(["submitted", "shortlisted", "rejected", "hired"])
      })
    )
    .mutation(({ ctx, input }) =>
      updateJobApplicationStatus(ctx.db, ctx.user, ctx.brandMember, {
        ...input,
        brandId: ctx.brandId
      })
    ),

  creatorWorkspace: creatorProcedure.query(({ ctx }) => listCreatorJobWorkspace(ctx.db, ctx.user, ctx.creator)),

  save: creatorWriteProcedure
    .input(
      z.object({
        jobId: z.string().uuid()
      })
    )
    .mutation(({ ctx, input }) => saveJob(ctx.db, ctx.user, ctx.creator, input)),

  unsave: creatorWriteProcedure
    .input(
      z.object({
        jobId: z.string().uuid()
      })
    )
    .mutation(({ ctx, input }) => unsaveJob(ctx.db, ctx.user, ctx.creator, input)),

  applyToJob: creatorWriteProcedure
    .input(
      z.object({
        jobId: z.string().uuid(),
        pitch: z.string().trim().min(20).max(300),
        proposedRateCents: z.number().int().min(0).optional(),
        attachments: z.array(deliverableInput).max(5).default([])
      })
    )
    .mutation(({ ctx, input }) => applyToJob(ctx.db, ctx.user, ctx.creator, input))
});
