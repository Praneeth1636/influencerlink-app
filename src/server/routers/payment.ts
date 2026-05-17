// tRPC surface for brief payments. Reads are exposed to both sides of the
// deal (creator can check status of their hire); mutations are brand-only
// because only the paying brand can confirm/release/refund.

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { brandMembers, briefPayments, creators, jobApplications, jobs } from "@/lib/db/schema";
import {
  brandProcedure,
  brandWriteProcedure,
  createTRPCRouter,
  creatorProcedure,
  protectedProcedure
} from "@/server/trpc";
import {
  confirmBriefPayment,
  getBriefPaymentByApplication,
  refundBriefPayment,
  releaseBriefPayment
} from "@/server/services/payment-service";

async function assertPaymentBelongsToBrand(
  ctx: { db: typeof import("@/lib/db/client").db; brandId: string },
  paymentId: string
) {
  const [row] = await ctx.db
    .select({ brandId: briefPayments.brandId })
    .from(briefPayments)
    .where(eq(briefPayments.id, paymentId))
    .limit(1);
  if (!row || row.brandId !== ctx.brandId) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found for this brand" });
  }
}

export const paymentRouter = createTRPCRouter({
  /**
   * Get the payment state for an application. Visible to both the creator
   * on the application and any brand member of the posting brand — they're
   * the only two sides of the transaction. Returns null for everyone else.
   */
  byApplication: protectedProcedure
    .input(z.object({ applicationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({
          creatorUserId: creators.userId,
          brandId: jobs.brandId
        })
        .from(jobApplications)
        .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
        .innerJoin(creators, eq(creators.id, jobApplications.creatorId))
        .where(eq(jobApplications.id, input.applicationId))
        .limit(1);
      if (!row) return null;

      const isCreator = row.creatorUserId === ctx.user.id;
      const isBrandMember = isCreator
        ? false
        : (
            await ctx.db
              .select({ id: brandMembers.brandId })
              .from(brandMembers)
              .where(and(eq(brandMembers.brandId, row.brandId), eq(brandMembers.userId, ctx.user.id)))
              .limit(1)
          ).length > 0;

      if (!isCreator && !isBrandMember) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a party on this application" });
      }

      return getBriefPaymentByApplication(ctx.db, ctx.user, input.applicationId);
    }),

  /**
   * Brand confirms they want to pay. Creates (or returns existing) Stripe
   * payment intent and hands back the client_secret. UI mounts Stripe
   * Elements with it.
   */
  confirm: brandWriteProcedure.input(z.object({ paymentId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await assertPaymentBelongsToBrand(ctx, input.paymentId);
    return confirmBriefPayment(ctx.db, ctx.user, ctx.brandMember, input.paymentId);
  }),

  /**
   * Brand confirms creator delivered — release platform-held funds to
   * the creator's Stripe Connect account.
   */
  release: brandWriteProcedure.input(z.object({ paymentId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await assertPaymentBelongsToBrand(ctx, input.paymentId);
    return releaseBriefPayment(ctx.db, ctx.user, ctx.brandMember, input.paymentId);
  }),

  /**
   * Brand refund. Valid only before release.
   */
  refund: brandWriteProcedure.input(z.object({ paymentId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await assertPaymentBelongsToBrand(ctx, input.paymentId);
    return refundBriefPayment(ctx.db, ctx.user, ctx.brandMember, input.paymentId);
  }),

  /**
   * Brand's payment history — list of all brief_payments for this brand.
   */
  listForBrand: brandProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(briefPayments)
      .where(eq(briefPayments.brandId, ctx.brandId))
      .orderBy(briefPayments.createdAt);
  }),

  /**
   * Creator's payment history — every brief_payment where this creator is
   * the payee. Used on the creator's jobs workspace to show payment status
   * next to each hired application.
   */
  listForCreator: creatorProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(briefPayments)
      .where(eq(briefPayments.creatorId, ctx.creator.id))
      .orderBy(briefPayments.createdAt);
  })
});
