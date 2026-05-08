import { eq } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, creatorWriteProcedure } from "@/server/trpc";
import { creatorPayoutAccounts } from "@/lib/db/schema";
import { getDashboardLink, syncAccountStatus } from "@/server/services/payout-service";

export const payoutRouter = createTRPCRouter({
  /**
   * Returns the creator's payout account row, or null if they haven't started
   * onboarding. Also re-syncs from Stripe if the row is stale (>5 minutes
   * since last update) so the UI never shows out-of-date status after the
   * creator returns from the Stripe-hosted onboarding flow.
   */
  status: creatorProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select()
      .from(creatorPayoutAccounts)
      .where(eq(creatorPayoutAccounts.creatorId, ctx.creator.id))
      .limit(1);

    if (!row) return null;

    const ageMs = Date.now() - new Date(row.updatedAt).getTime();
    if (ageMs > 5 * 60 * 1000) {
      try {
        await syncAccountStatus(ctx.db, row.stripeAccountId);
        const [refreshed] = await ctx.db
          .select()
          .from(creatorPayoutAccounts)
          .where(eq(creatorPayoutAccounts.id, row.id))
          .limit(1);
        return refreshed ?? row;
      } catch {
        // Stripe outage / rate-limit — fall back to the cached row.
        return row;
      }
    }
    return row;
  }),

  dashboardLink: creatorWriteProcedure.mutation(({ ctx }) => getDashboardLink(ctx.db, ctx.user, ctx.creator))
});
