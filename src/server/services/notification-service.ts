import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { notifications, users, type NewNotification, type User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type NotificationListInput = {
  limit: number;
  unreadOnly?: boolean;
};

export type NotificationCreateInput = Pick<NewNotification, "userId" | "type" | "actorId" | "entityType" | "entityId">;

export async function createNotification(db: Database, input: NotificationCreateInput) {
  const [created] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      actorId: input.actorId,
      entityType: input.entityType,
      entityId: input.entityId
    })
    .returning();

  return created ?? null;
}

export async function listNotifications(db: Database, user: User, input: NotificationListInput) {
  const filters = [
    eq(notifications.userId, user.id),
    input.unreadOnly ? isNull(notifications.readAt) : undefined
  ].filter(Boolean);

  return db
    .select({
      notification: notifications,
      actor: users
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.actorId))
    .where(and(...filters))
    .orderBy(desc(notifications.createdAt))
    .limit(input.limit);
}

export async function getUnreadNotificationCount(db: Database, user: User) {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`
    })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

  return row?.count ?? 0;
}

export async function markNotificationRead(db: Database, user: User, notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)))
    .returning();

  if (updated) {
    await writeAuditLog(db, {
      user,
      action: "notification.mark_read",
      entityType: "notification",
      entityId: notificationId
    });
  }

  return updated ?? null;
}

export async function markAllNotificationsRead(db: Database, user: User) {
  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)))
    .returning();

  await writeAuditLog(db, {
    user,
    action: "notification.mark_all_read",
    entityType: "notification",
    metadata: { count: updated.length }
  });

  return {
    updatedCount: updated.length
  };
}
