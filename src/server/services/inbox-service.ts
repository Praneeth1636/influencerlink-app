import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { messages, messageThreads, threadParticipants, type User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";
import { assertQuotaAvailable } from "./billing-service";

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

export async function getThreadById(db: Database, user: User, threadId: string) {
  const [participant] = await db
    .select()
    .from(threadParticipants)
    .where(and(eq(threadParticipants.threadId, threadId), eq(threadParticipants.userId, user.id)))
    .limit(1);

  if (!participant) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Message thread not found"
    });
  }

  const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

  if (!thread) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Message thread not found"
    });
  }

  const [participantRows, messageRows] = await Promise.all([
    db.select().from(threadParticipants).where(eq(threadParticipants.threadId, threadId)),
    db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt).limit(100)
  ]);

  return {
    thread,
    participant,
    participants: participantRows,
    messages: messageRows
  };
}

export async function sendMessage(
  db: Database,
  user: User,
  input: {
    threadId: string;
    body: string;
    attachments: Array<Record<string, unknown>>;
    replyToId?: string;
  }
) {
  await assertQuotaAvailable(db, { user }, "dmsSent");

  const [participant] = await db
    .select()
    .from(threadParticipants)
    .where(and(eq(threadParticipants.threadId, input.threadId), eq(threadParticipants.userId, user.id)))
    .limit(1);

  if (!participant) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a participant in this thread"
    });
  }

  const [message] = await db
    .insert(messages)
    .values({
      threadId: input.threadId,
      senderId: user.id,
      body: input.body,
      attachments: input.attachments,
      replyToId: input.replyToId
    })
    .returning();

  await db
    .update(messageThreads)
    .set({ lastMessageAt: message.createdAt })
    .where(eq(messageThreads.id, input.threadId));

  await writeAuditLog(db, {
    user,
    action: "inbox.send_message",
    entityType: "message_thread",
    entityId: input.threadId,
    metadata: { messageId: message.id }
  });

  return message;
}

export async function startDirectThread(db: Database, user: User, input: { participantUserId: string; body: string }) {
  await assertQuotaAvailable(db, { user }, "dmsSent");

  if (input.participantUserId === user.id) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot start a direct thread with yourself"
    });
  }

  const [thread] = await db.insert(messageThreads).values({ type: "direct" }).returning();

  await db.insert(threadParticipants).values([
    {
      threadId: thread.id,
      userId: user.id,
      role: "member"
    },
    {
      threadId: thread.id,
      userId: input.participantUserId,
      role: "member"
    }
  ]);

  const message = await sendMessage(db, user, {
    threadId: thread.id,
    body: input.body,
    attachments: []
  });

  await writeAuditLog(db, {
    user,
    action: "inbox.start_direct_thread",
    entityType: "message_thread",
    entityId: thread.id,
    metadata: { participantUserId: input.participantUserId, messageId: message.id }
  });

  return {
    thread,
    message
  };
}
