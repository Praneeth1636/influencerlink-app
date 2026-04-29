import type { inferRouterOutputs } from "@trpc/server";
import { buildSeedData, type SeedData } from "@/lib/db/seed";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type ThreadPreviewRow = RouterOutputs["inbox"]["listThreads"][number];
type ThreadDetailRow = RouterOutputs["inbox"]["threadById"];

export type InboxThreadPreview = {
  id: string;
  type: "direct" | "job" | "group";
  title: string;
  subtitle: string;
  lastMessage: string;
  unreadCount: number;
  lastMessageAt: Date;
};

export type InboxMessage = {
  id: string;
  body: string;
  senderLabel: string;
  sentByViewer: boolean;
  createdAt: Date;
};

export type InboxThreadDetail = InboxThreadPreview & {
  messages: InboxMessage[];
};

export function mapThreadPreviews(rows: ThreadPreviewRow[]): InboxThreadPreview[] {
  return rows.map((row) => ({
    id: row.thread.id,
    type: row.thread.type,
    title: row.thread.type === "job" ? "Job conversation" : "Direct conversation",
    subtitle: row.thread.jobId ? `Brief ${row.thread.jobId.slice(-6)}` : "CreatorLink DM",
    lastMessage: row.lastMessage?.body ?? "No messages yet.",
    unreadCount: row.unreadCount,
    lastMessageAt: row.thread.lastMessageAt
  }));
}

export function mapThreadDetail(row: ThreadDetailRow): InboxThreadDetail {
  return {
    id: row.thread.id,
    type: row.thread.type,
    title: row.thread.type === "job" ? "Job conversation" : "Direct conversation",
    subtitle: row.thread.jobId ? `Brief ${row.thread.jobId.slice(-6)}` : "CreatorLink DM",
    lastMessage: row.messages.at(-1)?.body ?? "No messages yet.",
    unreadCount: 0,
    lastMessageAt: row.thread.lastMessageAt,
    messages: row.messages.map((message) => ({
      id: message.id,
      body: message.body,
      senderLabel: message.senderId === row.participant.userId ? "You" : "Participant",
      sentByViewer: message.senderId === row.participant.userId,
      createdAt: message.createdAt
    }))
  };
}

export function buildSeedThreadPreviews(seed: SeedData = buildSeedData(), viewerUserId = seed.creators[0]?.userId) {
  if (!viewerUserId) return [];

  return seed.threadParticipants
    .filter((participant) => participant.userId === viewerUserId)
    .map((participant) => {
      const thread = seed.messageThreads.find((row) => row.id === participant.threadId);
      if (!thread) return null;

      return toSeedPreview(seed, thread.id!, viewerUserId);
    })
    .filter((thread): thread is InboxThreadPreview => Boolean(thread))
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export function getSeedThreadDetail(
  id: string,
  seed: SeedData = buildSeedData(),
  viewerUserId = seed.creators[0]?.userId
) {
  if (!viewerUserId) return null;

  const preview = toSeedPreview(seed, id, viewerUserId);
  if (!preview) return null;

  const messages = seed.messages
    .filter((message) => message.threadId === id)
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0))
    .map((message) => ({
      id: message.id!,
      body: message.body,
      senderLabel: message.senderId === viewerUserId ? "You" : resolveUserLabel(seed, message.senderId),
      sentByViewer: message.senderId === viewerUserId,
      createdAt: message.createdAt ?? new Date("2026-04-28T00:00:00.000Z")
    }));

  return {
    ...preview,
    messages
  };
}

function toSeedPreview(seed: SeedData, threadId: string, viewerUserId: string): InboxThreadPreview | null {
  const thread = seed.messageThreads.find((row) => row.id === threadId);
  if (!thread) return null;

  const participants = seed.threadParticipants.filter((participant) => participant.threadId === threadId);
  const counterpart = participants.find((participant) => participant.userId !== viewerUserId);
  const threadMessages = seed.messages
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  const lastMessage = threadMessages.at(-1);
  const viewerParticipant = participants.find((participant) => participant.userId === viewerUserId);
  const unreadCount = viewerParticipant?.lastReadAt
    ? threadMessages.filter((message) => (message.createdAt?.getTime() ?? 0) > viewerParticipant.lastReadAt!.getTime())
        .length
    : threadMessages.length;

  return {
    id: thread.id!,
    type: thread.type ?? "direct",
    title: counterpart ? resolveUserLabel(seed, counterpart.userId) : "CreatorLink thread",
    subtitle: thread.type === "job" ? "Job brief conversation" : "Direct message",
    lastMessage: lastMessage?.body ?? "No messages yet.",
    unreadCount,
    lastMessageAt: thread.lastMessageAt ?? new Date("2026-04-28T00:00:00.000Z")
  };
}

function resolveUserLabel(seed: SeedData, userId: string) {
  const creator = seed.creators.find((row) => row.userId === userId);
  if (creator) return creator.displayName;

  const brand = seed.brands.find(
    (row) => row.id === seed.brandMembers.find((member) => member.userId === userId)?.brandId
  );
  if (brand) return brand.name;

  return "Participant";
}
