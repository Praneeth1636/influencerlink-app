import Link from "next/link";
import {
  BadgeCheck,
  DollarSign,
  Filter,
  MapPin,
  Radio,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  buildSeedCreatorSearchResults,
  mapCreatorRows,
  type CreatorSearchFilters,
  type CreatorSearchResult
} from "@/lib/search/creator-search";
import { createTRPCServerCaller } from "@/lib/trpc/server";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    niche?: string;
    minReach?: string;
    open?: string;
  }>;
};

const nicheOptions = ["Beauty", "Fitness", "Food", "Fashion", "Tech", "Travel", "Skincare", "Lifestyle"];
const reachOptions = [
  { label: "Any reach", value: "" },
  { label: "100K+", value: "100000" },
  { label: "500K+", value: "500000" },
  { label: "1M+", value: "1000000" }
];

export default async function CreatorSearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const creators = await getSearchResults(filters);
  const topCreator = creators[0];

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(168,85,247,0.12),transparent_26%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-4">
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
            <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">Creator Discovery</p>
            <p className="hidden text-sm text-white/60 sm:block">Find creators by proof, niche, and fit</p>
          </div>
          <Link
            className="ml-auto rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c]"
            href="/feed"
          >
            Back to feed
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-7 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <form action="/search" className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#D85A30]/12 text-[#ffb49c] ring-1 ring-[#D85A30]/20">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Filters</p>
                <h1 className="text-2xl font-black tracking-[-0.04em]">Creator search</h1>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-black tracking-[0.14em] text-white/35 uppercase">Keyword</span>
              <span className="relative mt-2 block">
                <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/38" />
                <input
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#D85A30]/60"
                  defaultValue={filters.query}
                  name="q"
                  placeholder="beauty, skincare, SaaS..."
                />
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-black tracking-[0.14em] text-white/35 uppercase">Niche</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#151518] px-3 text-sm text-white outline-none focus:border-[#D85A30]/60"
                defaultValue={filters.niche ?? ""}
                name="niche"
              >
                <option value="">All niches</option>
                {nicheOptions.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-black tracking-[0.14em] text-white/35 uppercase">Reach</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#151518] px-3 text-sm text-white outline-none focus:border-[#D85A30]/60"
                defaultValue={filters.minReach ? String(filters.minReach) : ""}
                name="minReach"
              >
                {reachOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <input
                className="h-4 w-4 accent-[#D85A30]"
                defaultChecked={filters.openToCollabs}
                name="open"
                type="checkbox"
                value="1"
              />
              <span className="text-sm font-bold text-white/68">Open to collabs only</span>
            </label>

            <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#D85A30] text-sm font-black text-white transition hover:bg-[#c54f29]">
              <Filter className="mr-2 h-4 w-4" />
              Search creators
            </button>
          </form>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Result quality</p>
            <div className="mt-4 grid gap-3">
              <MiniStat label="Matches" value={String(creators.length)} />
              <MiniStat label="Top score" value={topCreator ? `${topCreator.matchScore}%` : "0%"} />
              <MiniStat label="Top reach" value={topCreator ? formatNumber(topCreator.totalReach) : "0"} />
            </div>
          </article>
        </aside>

        <section className="grid min-w-0 content-start gap-5">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/10">
            <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
              <Radio className="mr-2 h-3.5 w-3.5" />
              Live discovery
            </Badge>
            <h2 className="mt-5 text-[clamp(32px,5vw,58px)] leading-[0.98] font-black tracking-[-0.055em]">
              Search creators by the numbers that brands actually buy.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Filter by niche, reach, availability, and keyword. This is the brand-side discovery surface that will
              later plug into Algolia and AI brief matching.
            </p>
          </article>

          {creators.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
              <p className="text-lg font-black">No creators found</p>
              <p className="mt-2 text-sm leading-6 text-white/52">
                Try a broader niche, lower reach threshold, or remove the keyword filter.
              </p>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            {creators.map((creator) => (
              <CreatorResultCard creator={creator} key={creator.id} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

async function getSearchResults(filters: CreatorSearchFilters) {
  try {
    const caller = await createTRPCServerCaller();
    if (filters.query) {
      return mapCreatorRows(await caller.creator.search({ query: filters.query, limit: 24 }));
    }

    const result = await caller.creator.list({
      limit: 24,
      niche: filters.niche,
      minReach: filters.minReach,
      openToCollabs: filters.openToCollabs
    });

    return mapCreatorRows(result.items);
  } catch {
    return buildSeedCreatorSearchResults(filters);
  }
}

function CreatorResultCard({ creator }: { creator: CreatorSearchResult }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-[#D85A30]/35 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="h-14 w-14 bg-gradient-to-br from-[#D85A30] via-[#f1a06d] to-purple-300 font-black text-black ring-4 ring-white/8">
            <AvatarFallback className="bg-transparent text-black">{initials(creator.displayName)}</AvatarFallback>
            {creator.openToCollabs && <AvatarBadge className="bg-emerald-400" />}
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-black tracking-[-0.035em]">{creator.displayName}</h3>
              {creator.verified && (
                <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
                  <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[13px] text-white/45">
              @{creator.handle} · {creator.location}
            </p>
          </div>
        </div>
        <div className="grid h-14 w-16 shrink-0 place-items-center rounded-xl border border-[#D85A30]/35 bg-[#D85A30]/14 text-center text-[#ffb49c]">
          <strong className="text-lg font-black tracking-[-0.04em]">{creator.matchScore}%</strong>
          <span className="-mt-2 text-[10px] font-black tracking-[0.12em] uppercase opacity-70">match</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 font-bold text-white/72">{creator.headline}</p>
      <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/50">{creator.bio}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniStat label="Reach" value={formatNumber(creator.totalReach)} icon={Users} />
        <MiniStat label="Eng" value={`${creator.weightedEngagement.toFixed(1)}%`} icon={TrendingUp} />
        <MiniStat
          label="Rate"
          value={creator.baseRateCents ? `$${formatNumber(creator.baseRateCents / 100)}` : "Private"}
          icon={DollarSign}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {creator.niches.map((niche) => (
          <span className="rounded-full bg-white/8 px-3 py-1.5 text-[11px] font-black text-white/58" key={niche}>
            {niche}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/38">
          <MapPin className="h-3.5 w-3.5" />
          {creator.location}
        </span>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#D85A30] px-4 text-sm font-black text-white transition hover:bg-[#c54f29]"
          href={`/profile/${creator.handle}`}
        >
          Open profile
        </Link>
      </div>
    </article>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="block text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5 text-white/28" />}
      </div>
      <strong className="mt-1 block text-lg font-black tracking-[-0.04em] text-white">{value}</strong>
    </div>
  );
}

function parseFilters(params: Awaited<SearchPageProps["searchParams"]>): CreatorSearchFilters {
  const minReach = params.minReach ? Number(params.minReach) : undefined;

  return {
    query: params.q?.trim() || undefined,
    niche: params.niche?.trim() || undefined,
    minReach: Number.isFinite(minReach) ? minReach : undefined,
    openToCollabs: params.open === "1"
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString();
}
