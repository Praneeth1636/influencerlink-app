import { and, desc, eq, gt } from "drizzle-orm";
import { messages, messageThreads, threadParticipants, type User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export async function listThreads(db: Database, user: User, input: { limit: number }) {
  const rows = await db
    .select({
      thread: messageThreads,
      participant: threadParticipants
    })
    .from(threadParticipants)
    .innerJoin(messageThreads, eq(messageThreads.id, threadParticipants.threadId))
    .where(eq(threadParticipants.userId, user.id))
    .orderBy(desc(messageThreads.lastMessageAt))
    .limit(input.limit);

  return Promise.all(
    rows.map(async (row) => {
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.threadId, row.thread.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const unreadMessages = row.participant.lastReadAt
        ? await db
            .select()
            .from(messages)
            .where(and(eq(messages.threadId, row.thread.id), gt(messages.createdAt, row.participant.lastReadAt)))
            .limit(100)
        : [];

      return {
        ...row,
        lastMessage: lastMessage ?? null,
        unreadCount: unreadMessages.length
      };
    })
  );
}

export async function markThreadRead(db: Database, user: User, threadId: string) {
  const [participant] = await db
    .update(threadParticipants)
    .set({ lastReadAt: new Date() })
    .where(and(eq(threadParticipants.threadId, threadId), eq(threadParticipants.userId, user.id)))
    .returning();

  await writeAuditLog(db, {
    user,
    action: "inbox.mark_read",
    entityType: "message_thread",
    entityId: threadId
  });

  return participant ?? null;
}
