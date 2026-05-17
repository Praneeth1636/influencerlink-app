// Admin moderation surface. Everything here is gated by adminProcedure;
// no public callers. Audit log writes happen on every mutation so we have
// a paper trail of who suspended whom and why.

import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { auditLogs, reports, users, type User } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

const log = logger.child({ module: "admin-service" });

export async function listOpenReports(db: Database, limit = 50) {
  return db
    .select({
      report: reports,
      reporter: users
    })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reporterId))
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt))
    .limit(limit);
}

export async function resolveReport(
  db: Database,
  user: User,
  input: { reportId: string; outcome: "resolved" | "dismissed" }
) {
  const [updated] = await db
    .update(reports)
    .set({
      status: input.outcome,
      updatedAt: new Date()
    })
    .where(eq(reports.id, input.reportId))
    .returning();

  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
  }

  await writeAuditLog(db, {
    user,
    action: "admin.report_resolve",
    entityType: "report",
    entityId: input.reportId,
    metadata: { outcome: input.outcome }
  });

  return updated;
}

export async function suspendUser(db: Database, admin: User, input: { userId: string; reason: string }) {
  if (input.userId === admin.id) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot suspend yourself" });
  }

  const [updated] = await db
    .update(users)
    .set({
      suspendedAt: new Date(),
      suspendedReason: input.reason
    })
    .where(eq(users.id, input.userId))
    .returning();

  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  await writeAuditLog(db, {
    user: admin,
    action: "admin.user_suspend",
    entityType: "user",
    entityId: input.userId,
    metadata: { reason: input.reason }
  });

  log.warn({ adminId: admin.id, targetId: input.userId, reason: input.reason }, "user suspended");
  return updated;
}

export async function unsuspendUser(db: Database, admin: User, userId: string) {
  const [updated] = await db
    .update(users)
    .set({
      suspendedAt: null,
      suspendedReason: null
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  await writeAuditLog(db, {
    user: admin,
    action: "admin.user_unsuspend",
    entityType: "user",
    entityId: userId
  });

  return updated;
}

export async function listRecentAudit(db: Database, limit = 50) {
  return db
    .select({
      audit: auditLogs,
      actor: users
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

/**
 * Quick stats for the admin dashboard header — total users, suspended,
 * creators, brand members. One round-trip.
 */
export async function adminStats(db: Database) {
  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      suspended: sql<number>`count(*) filter (where ${users.suspendedAt} is not null)::int`,
      creators: sql<number>`count(*) filter (where ${users.type} = 'creator')::int`,
      brands: sql<number>`count(*) filter (where ${users.type} = 'brand_member')::int`,
      admins: sql<number>`count(*) filter (where ${users.type} = 'admin')::int`
    })
    .from(users);

  const [openReports] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(eq(reports.status, "open"));

  return {
    users: counts ?? { total: 0, suspended: 0, creators: 0, brands: 0, admins: 0 },
    openReports: openReports?.count ?? 0
  };
}

export async function searchUsers(db: Database, query: string, limit = 20) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return db
      .select()
      .from(users)
      .where(and(ne(users.type, "admin"), isNull(users.suspendedAt)))
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }
  return db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) like ${`%${trimmed}%`}`)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}
