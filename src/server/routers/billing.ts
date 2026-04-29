import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { getBillingSummary } from "@/server/services/billing-service";

export const billingRouter = createTRPCRouter({
  summary: protectedProcedure
    .input(
      z
        .object({
          brandId: z.string().uuid().optional()
        })
        .optional()
    )
    .query(({ ctx, input }) => getBillingSummary(ctx.db, ctx.user, input ?? {}))
});
