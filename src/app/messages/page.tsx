import Link from "next/link";
import { ArrowRight, Inbox, MessageCircle, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildSeedThreadPreviews, mapThreadPreviews, type InboxThreadPreview } from "@/lib/messages/inbox";
import { createTRPCServerCaller } from "@/lib/trpc/server";

export default async function MessagesPage() {
  const threads = await getThreads();
  const firstThread = threads[0];

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_2%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] items-center gap-4 px-5 py-4">
          <Link
            className="logoMark miniLogo shrink-0 bg-white/5 ring-1 ring-white/10"
            href="/feed"
            aria-label="CreatorLink feed"
          >
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">Messages</p>
            <p className="hidden text-sm text-white/60 sm:block">Brand and creator conversations</p>
          </div>
          <Link
            className="ml-auto rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/feed"
          >
            Back to feed
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#D85A30]/12 text-[#ffb49c] ring-1 ring-[#D85A30]/20">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Inbox</p>
              <h1 className="text-2xl font-black tracking-[-0.04em]">{threads.length} threads</h1>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {threads.map((thread) => (
              <ThreadPreviewCard key={thread.id} thread={thread} />
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/10">
          <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
            <Radio className="mr-2 h-3.5 w-3.5" />
            Messaging MVP
          </Badge>
          <h2 className="mt-5 text-[clamp(34px,6vw,68px)] leading-[0.96] font-black tracking-[-0.06em]">
            Keep every creator deal in one clean thread.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            This is the LinkedIn-style inbox layer for CreatorLink. Job applications and direct brand outreach can now
            live in threaded conversations with read states and message sends.
          </p>

          {firstThread ? (
            <Link
              className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#D85A30] px-5 text-sm font-black text-white transition hover:bg-[#c54f29]"
              href={`/messages/${firstThread.id}`}
            >
              Open latest thread
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-lg font-black">No messages yet</p>
              <p className="mt-2 text-sm leading-6 text-white/50">Apply to a job or start a creator conversation.</p>
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
      className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-[#D85A30]/35 hover:bg-white/[0.055]"
      href={`/messages/${thread.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black tracking-[-0.025em]">{thread.title}</p>
          <p className="mt-1 text-xs font-bold text-white/35">{thread.subtitle}</p>
        </div>
        {thread.unreadCount > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#D85A30] px-2 text-xs font-black">
            {thread.unreadCount}
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/52">{thread.lastMessage}</p>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-white/32">
        <span>{thread.type}</span>
        <MessageCircle className="h-4 w-4" />
      </div>
    </Link>
  );
}
