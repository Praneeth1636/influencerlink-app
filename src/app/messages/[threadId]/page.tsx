import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSeedThreadDetail, mapThreadDetail, type InboxMessage, type InboxThreadDetail } from "@/lib/messages/inbox";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import { MessageComposer } from "./message-composer";

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
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_2%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <section className="relative z-10 mx-auto grid max-w-[980px] gap-6 px-5 py-8">
        <header className="flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/messages"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Inbox
          </Link>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold text-white/46">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(thread.lastMessageAt)}
          </div>
        </header>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/10">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                {thread.type}
              </Badge>
              {thread.unreadCount > 0 && (
                <Badge className="rounded-full bg-white/8 text-white/62 hover:bg-white/8">
                  {thread.unreadCount} unread
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-[clamp(30px,5vw,52px)] leading-[0.98] font-black tracking-[-0.055em]">
              {thread.title}
            </h1>
            <p className="mt-2 text-sm font-bold text-white/44">{thread.subtitle}</p>
          </div>

          <div className="grid gap-4 p-5">
            {thread.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <MessageComposer threadId={thread.id} />
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
            ? "border-[#D85A30]/30 bg-[#D85A30]/14 text-white"
            : "border-white/10 bg-black/24 text-white/70"
        }`}
      >
        <p className="text-xs font-black tracking-[0.14em] text-white/34 uppercase">{message.senderLabel}</p>
        <p className="mt-2 text-sm leading-6">{message.body}</p>
        <p className="mt-3 text-[11px] font-bold text-white/32">{formatDate(message.createdAt)}</p>
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
