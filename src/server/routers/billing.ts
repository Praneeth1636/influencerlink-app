import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getBillingSummary
} from "@/server/services/billing-service";

function requestOrigin(headers: Headers) {
  return headers.get("origin") ?? "http://localhost:3000";
}

export const billingRouter = createTRPCRouter({
  summary: protectedProcedure
    .input(
      z
        .object({
          brandId: z.string().uuid().optional()
        })
        .optional()
    )
    .query(({ ctx, input }) => getBillingSummary(ctx.db, ctx.user, input ?? {})),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.string().min(1),
        audience: z.enum(["creator", "brand"]),
        brandId: z.string().uuid().optional()
      })
    )
    .mutation(({ ctx, input }) =>
      createCheckoutSession(ctx.db, ctx.user, {
        ...input,
        origin: requestOrigin(ctx.headers)
      })
    ),

  createPortalSession: protectedProcedure
    .input(
      z
        .object({
          brandId: z.string().uuid().optional()
        })
        .optional()
    )
    .mutation(({ ctx, input }) =>
      createCustomerPortalSession(ctx.db, ctx.user, {
        brandId: input?.brandId,
        origin: requestOrigin(ctx.headers)
      })
    )
});
