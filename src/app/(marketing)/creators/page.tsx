import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, Search, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buildSeedCreatorSearchResults, mapCreatorRows, type CreatorSearchResult } from "@/lib/search/creator-search";
import { createTRPCServerCaller } from "@/lib/trpc/server";

export default async function CreatorsPage() {
  const creators = await getCreators();
  const featured = creators.slice(0, 6);

  return (
    <main className="terrace-app-bg min-h-screen font-sans text-[#37352f]">
      <section className="mx-auto max-w-[1280px] px-4 pt-8 pb-5 sm:px-6 sm:pt-14 sm:pb-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)] lg:items-end">
          <div className="min-w-0">
            <Badge className="rounded-full border border-[#e9e9e7] bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-[#e08550] uppercase hover:bg-white">
              Creator preview
            </Badge>
            <h1 className="mt-5 max-w-[12ch] text-[clamp(44px,7vw,88px)] leading-[0.96] font-semibold tracking-[-0.06em]">
              The network before the search.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#787774] sm:text-lg sm:leading-8">
              Browse a small public slice of Terrace creators. Sign in to follow, message, save, compare audience
              signals, and run the deeper brand search.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="terrace-primary-action h-11 px-5 text-sm" href="/signup?intent=creator">
                Join as creator
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="terrace-secondary-action h-11 px-5 text-sm" href="/signup?intent=brand">
                Search as brand
              </Link>
            </div>
          </div>

          <div className="min-w-0 rounded-[28px] border border-[#e9e9e7] bg-white p-4 shadow-[0_28px_80px_rgba(17,24,39,0.08)] sm:p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] px-4 py-3 text-sm text-[#787774]">
              <Search className="h-4 w-4 text-[#e08550]" />
              <span className="min-w-0 truncate">Skincare creators with fast audience growth</span>
            </div>
            <div className="mt-4 grid min-w-0 gap-2 overflow-hidden">
              {creators.slice(0, 3).map((creator, index) => (
                <CreatorRow creator={creator} index={index} key={creator.id} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((creator) => (
            <CreatorCard creator={creator} key={creator.id} />
          ))}
        </div>
      </section>
    </main>
  );
}

async function getCreators() {
  try {
    const caller = await createTRPCServerCaller();
    const result = await caller.creator.list({ limit: 12 });
    const liveCreators = mapCreatorRows(result.items);

    return liveCreators.length > 0 ? liveCreators : buildSeedCreatorSearchResults().slice(0, 12);
  } catch {
    return buildSeedCreatorSearchResults().slice(0, 12);
  }
}

function CreatorRow({ creator, index }: { creator: CreatorSearchResult; index: number }) {
  return (
    <div className="flex w-full max-w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-[#f1f1ef] bg-white px-4 py-3">
      <Initials creator={creator} />
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-[#37352f]">{creator.displayName}</p>
          {creator.verified ? <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#7bc6ee]" /> : null}
        </div>
        <p className="truncate text-xs text-[#9b9a97]">{creator.headline}</p>
      </div>
      <span className="rounded-full bg-[#fff3ec] px-2.5 py-1 text-xs font-semibold text-[#e08550]">#{index + 1}</span>
    </div>
  );
}

function CreatorCard({ creator }: { creator: CreatorSearchResult }) {
  return (
    <article className="min-w-0 rounded-[24px] border border-[#e9e9e7] bg-white p-5 shadow-[0_18px_60px_rgba(17,24,39,0.05)] transition hover:-translate-y-0.5 hover:border-[#dce3ea]">
      <div className="flex items-start gap-4">
        <Initials className="h-14 w-14 text-sm" creator={creator} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-lg font-semibold tracking-[-0.04em] text-[#37352f]">{creator.displayName}</h2>
            {creator.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-[#7bc6ee]" /> : null}
          </div>
          <p className="truncate text-sm text-[#787774]">@{creator.handle}</p>
        </div>
        {creator.openToCollabs ? (
          <span className="rounded-full bg-[#eaf7fd] px-3 py-1 text-xs font-semibold text-[#2b8fc4]">Open</span>
        ) : null}
      </div>

      <p className="mt-5 min-h-12 text-sm leading-6 text-[#4b5563]">{creator.headline}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {creator.niches.slice(0, 3).map((niche) => (
          <span
            className="rounded-full border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-1 text-xs font-semibold text-[#787774]"
            key={niche}
          >
            {niche}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniSignal
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="Reach"
          value={formatNumber(creator.totalReach)}
        />
        <MiniSignal
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Engagement"
          value={`${creator.weightedEngagement.toFixed(1)}%`}
        />
      </div>

      <div className="mt-5 border-t border-[#f1f1ef] pt-4">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d222b]"
          href="/signup?intent=brand"
        >
          Connect on Terrace
        </Link>
      </div>
    </article>
  );
}

function MiniSignal({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-[#fbfbfa] p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#37352f]">{value}</p>
    </div>
  );
}

function Initials({ creator, className }: { creator: CreatorSearchResult; className?: string }) {
  const initials = creator.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <span
      className={[
        "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff3ec] text-xs font-bold text-[#37352f] ring-4 ring-white",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {initials}
    </span>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
