import { z } from "zod";
import { adminProcedure, adminWriteProcedure, createTRPCRouter } from "@/server/trpc";
import {
  adminStats,
  listOpenReports,
  listRecentAudit,
  resolveReport,
  searchUsers,
  suspendUser,
  unsuspendUser
} from "@/server/services/admin-service";

export const adminRouter = createTRPCRouter({
  stats: adminProcedure.query(({ ctx }) => adminStats(ctx.db)),

  openReports: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(({ ctx, input }) => listOpenReports(ctx.db, input?.limit ?? 50)),

  recentAudit: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(({ ctx, input }) => listRecentAudit(ctx.db, input?.limit ?? 50)),

  searchUsers: adminProcedure
    .input(z.object({ query: z.string().max(200).default("") }))
    .query(({ ctx, input }) => searchUsers(ctx.db, input.query)),

  resolveReport: adminWriteProcedure
    .input(z.object({ reportId: z.string().uuid(), outcome: z.enum(["resolved", "dismissed"]) }))
    .mutation(({ ctx, input }) => resolveReport(ctx.db, ctx.user, input)),

  suspendUser: adminWriteProcedure
    .input(z.object({ userId: z.string().uuid(), reason: z.string().trim().min(3).max(500) }))
    .mutation(({ ctx, input }) => suspendUser(ctx.db, ctx.user, input)),

  unsuspendUser: adminWriteProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(({ ctx, input }) => unsuspendUser(ctx.db, ctx.user, input.userId))
});
