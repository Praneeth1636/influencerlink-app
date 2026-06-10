import Link from "next/link";
import { ArrowRight, Inbox, MessageCircle, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildSeedThreadPreviews, mapThreadPreviews, type InboxThreadPreview } from "@/lib/messages/inbox";
import { createTRPCServerCaller } from "@/lib/trpc/server";

export default async function MessagesPage() {
  const threads = await getThreads();
  const firstThread = threads[0];

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="sticky top-0 z-40 border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9b9a97] uppercase">Messages</p>
            <p className="hidden text-sm text-[#787774] sm:block">Brand and creator conversations</p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#faf0ea] text-[#D86B3D] ring-1 ring-[#f3d5c4]">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Inbox</p>
              <h1 className="font-serif text-2xl font-semibold tracking-[-0.03em]">
                {threads.length} {threads.length === 1 ? "thread" : "threads"}
              </h1>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {threads.map((thread) => (
              <ThreadPreviewCard key={thread.id} thread={thread} />
            ))}
          </div>
        </aside>

        <section className="rounded-[28px] border border-[#e9e9e7] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.05)]">
          <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-1 text-[#D86B3D] hover:bg-[#faf0ea]">
            <Radio className="mr-2 h-3.5 w-3.5" />
            Messaging MVP
          </Badge>
          <h2 className="mt-5 max-w-2xl text-[clamp(30px,5vw,52px)] leading-[1.04] font-semibold tracking-[-0.055em]">
            Keep every creator deal in one clean thread.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#787774]">
            This is the LinkedIn-style inbox layer for Terrace. Job applications and direct brand outreach can now live
            in threaded conversations with read states and message sends.
          </p>

          {firstThread ? (
            <Link
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#37352f] px-5 text-sm font-semibold text-white transition hover:bg-[#262420]"
              href={`/messages/${firstThread.id}`}
            >
              Open latest thread
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div className="mt-7 rounded-xl border border-[#e9e9e7] bg-white p-5">
              <p className="text-lg font-semibold">No messages yet</p>
              <p className="mt-2 text-sm leading-6 text-[#787774]">Apply to a job or start a creator conversation.</p>
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
      className="block rounded-lg border border-[#e9e9e7] bg-white p-4 transition hover:border-[#f3d5c4] hover:bg-[#fbfbfa]"
      href={`/messages/${thread.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold tracking-[-0.025em]">{thread.title}</p>
          <p className="mt-1 text-xs font-medium text-[#787774]">{thread.subtitle}</p>
        </div>
        {thread.unreadCount > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#D86B3D] px-2 text-xs font-semibold text-white">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#787774]">{thread.lastMessage}</p>
      <div className="mt-4 flex items-center justify-between border-t border-[#e9e9e7] pt-3 text-xs font-semibold text-[#9b9a97]">
        <span>{thread.type}</span>
        <MessageCircle className="h-4 w-4" />
      </div>
    </Link>
  );
}
