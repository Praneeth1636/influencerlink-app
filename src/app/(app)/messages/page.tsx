import Link from "next/link";
import { ArrowRight, Inbox, MessageCircle } from "lucide-react";
import { buildSeedThreadPreviews, mapThreadPreviews, type InboxThreadPreview } from "@/lib/messages/inbox";
import { createTRPCServerCaller } from "@/lib/trpc/server";

export default async function MessagesPage() {
  const threads = await getThreads();
  const firstThread = threads[0];

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em]">Messages</p>
            <p className="hidden text-sm text-[#787774] sm:block">Brand and creator conversations</p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#f7f7f5] text-[#787774] ring-1 ring-[#f3d5c4]">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Inbox</p>
              <h1 className="text-2xl font-semibold tracking-[-0.04em]">
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

        <section className="grid content-center rounded-xl border border-[#e9e9e7] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
          {firstThread ? (
            <div className="text-center">
              <p className="text-lg font-semibold tracking-[-0.025em]">Pick a conversation</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#787774]">
                Deals, applications, and replies stay in one thread per conversation.
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#37352f] px-5 text-sm font-semibold text-white transition hover:bg-[#262420]"
                href={`/messages/${firstThread.id}`}
              >
                Open latest thread
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f7f7f5] text-[#787774]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <p className="mt-4 text-lg font-semibold tracking-[-0.025em]">No messages yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#787774]">
                Conversations start when you apply to a gig or when a brand reaches out from your profile.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  className="inline-flex h-10 items-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#262420]"
                  href="/jobs"
                >
                  Browse gigs
                </Link>
                <Link
                  className="inline-flex h-10 items-center rounded-full border border-[#e9e9e7] bg-white px-4 text-sm font-semibold text-[#37352f] transition hover:bg-[#fbfbfa]"
                  href="/search"
                  prefetch={false}
                >
                  Find creators
                </Link>
              </div>
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
      className="block rounded-lg border border-[#e9e9e7] bg-white p-4 transition hover:border-[#d9d9d6] hover:bg-[#fbfbfa]"
      href={`/messages/${thread.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold tracking-[-0.025em]">{thread.title}</p>
          <p className="mt-1 text-xs font-medium text-[#787774]">{thread.subtitle}</p>
        </div>
        {thread.unreadCount > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#e08550] px-2 text-xs font-semibold text-white">
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
