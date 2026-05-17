import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSeedThreadDetail, mapThreadDetail, type InboxMessage, type InboxThreadDetail } from "@/lib/messages/inbox";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import { MessageComposer } from "./message-composer";
import { MessageStream } from "./message-stream";

type MessageThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { threadId } = await params;
  const thread = await getThread(threadId);

  if (!thread) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white font-sans text-[#111318]">
      <section className="relative z-10 mx-auto grid max-w-[980px] gap-6 px-5 py-8">
        <header className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#ececec] px-3 text-sm font-medium text-[#687386] transition hover:border-[#f3d5c4] hover:text-[#D86B3D]"
            href="/messages"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Inbox
          </Link>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-[#ececec] bg-[#fbfcfd] px-3 py-2 text-xs font-medium text-[#687386]">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(thread.lastMessageAt)}
          </div>
        </header>

        <article className="overflow-hidden rounded-[28px] border border-[#ececec] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.05)]">
          <div className="border-b border-[#ececec] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-[#f3d5c4] bg-[#fff7f2] text-[#D86B3D] hover:bg-[#fff7f2]">
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                {thread.type}
              </Badge>
              {thread.unreadCount > 0 && (
                <Badge className="rounded-full border border-[#ececec] bg-[#fbfcfd] text-[#687386] hover:bg-[#fbfcfd]">
                  {thread.unreadCount} unread
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-[clamp(30px,5vw,52px)] leading-[1.04] font-semibold tracking-[-0.055em]">
              {thread.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#687386]">{thread.subtitle}</p>
          </div>

          <div className="grid gap-4 p-5">
            {thread.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <MessageComposer threadId={thread.id} />
          <MessageStream />
        </article>
      </section>
    </main>
  );
}

async function getThread(threadId: string): Promise<InboxThreadDetail | null> {
  try {
    const caller = await createTRPCServerCaller();
    return mapThreadDetail(await caller.inbox.threadById({ threadId }));
  } catch {
    return getSeedThreadDetail(threadId);
  }
}

function MessageBubble({ message }: { message: InboxMessage }) {
  return (
    <div className={`flex ${message.sentByViewer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl border p-4 ${
          message.sentByViewer
            ? "border-[#f3d5c4] bg-[#fff7f2] text-[#111318]"
            : "border-[#ececec] bg-[#fbfcfd] text-[#5f6673]"
        }`}
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-[#9aa3b2] uppercase">{message.senderLabel}</p>
        <p className="mt-2 text-sm leading-6">{message.body}</p>
        <p className="mt-3 text-[11px] font-medium text-[#9aa3b2]">{formatDate(message.createdAt)}</p>
      </div>
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}
