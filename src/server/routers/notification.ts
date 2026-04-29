import { z } from "zod";
import { createTRPCRouter, protectedProcedure, protectedWriteProcedure } from "@/server/trpc";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/server/services/notification-service";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        unreadOnly: z.boolean().optional()
      })
    )
    .query(({ ctx, input }) => listNotifications(ctx.db, ctx.user, input)),

  unreadCount: protectedProcedure.query(({ ctx }) => getUnreadNotificationCount(ctx.db, ctx.user)),

  markRead: protectedWriteProcedure
    .input(
      z.object({
        notificationId: z.string().uuid()
      })
    )
    .mutation(({ ctx, input }) => markNotificationRead(ctx.db, ctx.user, input.notificationId)),

  markAllRead: protectedWriteProcedure.mutation(({ ctx }) => markAllNotificationsRead(ctx.db, ctx.user))
});
