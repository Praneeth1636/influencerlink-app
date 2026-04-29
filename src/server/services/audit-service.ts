import { auditLogs, type User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";

export async function writeAuditLog(
  db: Database,
  input: {
    user: User;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  await db.insert(auditLogs).values({
    userId: input.user.id,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {}
  });
}
