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
    <main className="bg-background text-foreground min-h-screen">
      <section className="relative z-10 mx-auto grid max-w-[980px] gap-6 px-5 py-8">
        <header className="flex flex-wrap items-center gap-3">
          <Link
            className="border-border text-muted-foreground hover:border-primary/35 hover:text-primary inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition"
            href="/messages"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Inbox
          </Link>
          <div className="border-border bg-muted/30 text-foreground/46 ml-auto flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(thread.lastMessageAt)}
          </div>
        </header>

        <article className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
          <div className="border-border border-b p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full">
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                {thread.type}
              </Badge>
              {thread.unreadCount > 0 && (
                <Badge className="bg-muted/40 text-muted-foreground hover:bg-muted/40 rounded-full">
                  {thread.unreadCount} unread
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-[clamp(30px,5vw,52px)] leading-[0.98] font-black tracking-[-0.055em]">
              {thread.title}
            </h1>
            <p className="text-foreground/44 mt-2 text-sm font-bold">{thread.subtitle}</p>
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
            ? "border-primary/30 bg-primary/14 text-foreground"
            : "border-border bg-muted/30 text-foreground/70"
        }`}
      >
        <p className="text-muted-foreground text-xs font-black tracking-[0.14em] uppercase">{message.senderLabel}</p>
        <p className="mt-2 text-sm leading-6">{message.body}</p>
        <p className="text-muted-foreground mt-3 text-[11px] font-bold">{formatDate(message.createdAt)}</p>
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
