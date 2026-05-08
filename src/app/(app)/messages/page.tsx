import Link from "next/link";
import { ArrowRight, Inbox, MessageCircle, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildSeedThreadPreviews, mapThreadPreviews, type InboxThreadPreview } from "@/lib/messages/inbox";
import { createTRPCServerCaller } from "@/lib/trpc/server";

export default async function MessagesPage() {
  const threads = await getThreads();
  const firstThread = threads[0];

  return (
    <main className="bg-background text-foreground min-h-screen">
      <header className="border-border bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">Messages</p>
            <p className="text-muted-foreground hidden text-sm sm:block">Brand and creator conversations</p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-border bg-card rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/12 text-primary ring-primary/20 grid h-10 w-10 place-items-center rounded-xl ring-1">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Inbox</p>
              <h1 className="text-2xl font-black tracking-[-0.04em]">{threads.length} threads</h1>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {threads.map((thread) => (
              <ThreadPreviewCard key={thread.id} thread={thread} />
            ))}
          </div>
        </aside>

        <section className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
            <Radio className="mr-2 h-3.5 w-3.5" />
            Messaging MVP
          </Badge>
          <h2 className="mt-5 text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            Keep every creator deal in one clean thread.
          </h2>
          <p className="text-foreground/55 mt-4 max-w-2xl text-sm leading-7">
            This is the LinkedIn-style inbox layer for Terrace. Job applications and direct brand outreach can now live
            in threaded conversations with read states and message sends.
          </p>

          {firstThread ? (
            <Link
              className="bg-primary text-foreground hover:bg-primary/90 mt-7 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-black transition"
              href={`/messages/${firstThread.id}`}
            >
              Open latest thread
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div className="border-border bg-card mt-7 rounded-xl border p-5">
              <p className="text-lg font-black">No messages yet</p>
              <p className="text-foreground/50 mt-2 text-sm leading-6">
                Apply to a job or start a creator conversation.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

async function getThreads() {
  try {
    const caller = await createTRPCServerCaller();
    return mapThreadPreviews(await caller.inbox.listThreads({ limit: 24 }));
  } catch {
    return buildSeedThreadPreviews();
  }
}

function ThreadPreviewCard({ thread }: { thread: InboxThreadPreview }) {
  return (
    <Link
      className="border-border bg-card hover:border-primary/35 hover:bg-muted/30 block rounded-xl border p-4 transition"
      href={`/messages/${thread.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black tracking-[-0.025em]">{thread.title}</p>
          <p className="text-muted-foreground mt-1 text-xs font-bold">{thread.subtitle}</p>
        </div>
        {thread.unreadCount > 0 && (
          <span className="bg-primary grid h-6 min-w-6 place-items-center rounded-full px-2 text-xs font-black">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-5">{thread.lastMessage}</p>
      <div className="border-border text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs font-bold">
        <span>{thread.type}</span>
        <MessageCircle className="h-4 w-4" />
      </div>
    </Link>
  );
}
