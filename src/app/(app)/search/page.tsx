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
    <main className="bg-background text-foreground min-h-screen">
      <header className="border-border bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">
              Creator Discovery
            </p>
            <p className="text-muted-foreground hidden text-sm sm:block">Find creators by proof, niche, and fit</p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-6 px-5 py-7 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <form action="/search" className="border-border bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/12 text-primary ring-primary/20 grid h-10 w-10 place-items-center rounded-xl ring-1">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Filters</p>
                <h1 className="text-2xl font-black tracking-[-0.04em]">Discovery filters</h1>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-muted-foreground text-xs font-black tracking-[0.14em] uppercase">Keyword</span>
              <span className="relative mt-2 block">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary/60 h-11 w-full rounded-xl border pr-4 pl-11 text-sm outline-none"
                  defaultValue={filters.query}
                  name="q"
                  placeholder="beauty, skincare, SaaS..."
                />
              </span>
            </label>

            <label className="mt-4 block">
              <span className="text-muted-foreground text-xs font-black tracking-[0.14em] uppercase">Niche</span>
              <select
                className="border-border bg-input text-foreground focus:border-primary/60 mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none"
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
              <span className="text-muted-foreground text-xs font-black tracking-[0.14em] uppercase">Reach</span>
              <select
                className="border-border bg-input text-foreground focus:border-primary/60 mt-2 h-11 w-full rounded-xl border px-3 text-sm outline-none"
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

            <label className="border-border bg-muted/30 mt-4 flex items-center gap-3 rounded-xl border p-3">
              <input
                className="accent-primary h-4 w-4"
                defaultChecked={filters.openToCollabs}
                name="open"
                type="checkbox"
                value="1"
              />
              <span className="text-foreground/68 text-sm font-bold">Open to collabs only</span>
            </label>

            <button className="bg-primary text-foreground hover:bg-primary/90 mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-black transition">
              <Filter className="mr-2 h-4 w-4" />
              Search creators
            </button>
          </form>

          <article className="border-border bg-card rounded-xl border p-5">
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">Result quality</p>
            <div className="mt-4 grid gap-3">
              <MiniStat label="Matches" value={String(creators.length)} />
              <MiniStat label="Top score" value={topCreator ? `${topCreator.matchScore}%` : "0%"} />
              <MiniStat label="Top reach" value={topCreator ? formatNumber(topCreator.totalReach) : "0"} />
            </div>
          </article>
        </aside>

        <section className="grid min-w-0 content-start gap-5">
          <article className="border-border bg-card/90 rounded-lg border p-6 shadow-sm">
            <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
              <Radio className="mr-2 h-3.5 w-3.5" />
              Studio Slate
            </Badge>
            <h2 className="mt-5 max-w-3xl text-[clamp(30px,4vw,50px)] leading-[1.02] font-black tracking-[-0.045em]">
              Browse creators like a premium talent catalog.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-7">
              Cinematic discovery, compact filters, and proof-first cards for creators and brand teams in the same
              workspace.
            </p>
          </article>

          {topCreator && (
            <article className="border-primary/25 bg-card/90 overflow-hidden rounded-lg border shadow-sm">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="p-6">
                  <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full px-3 py-1">
                    Best match · {topCreator.matchScore}%
                  </Badge>
                  <h3 className="mt-5 text-3xl font-black tracking-[-0.045em]">{topCreator.displayName}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    @{topCreator.handle} · {topCreator.location}
                  </p>
                  <p className="text-foreground/70 mt-4 max-w-2xl text-sm leading-7">{topCreator.headline}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <MiniStat label="Reach" value={formatNumber(topCreator.totalReach)} icon={Users} />
                    <MiniStat label="Eng" value={`${topCreator.weightedEngagement.toFixed(1)}%`} icon={TrendingUp} />
                    <MiniStat
                      label="Rate"
                      value={topCreator.baseRateCents ? `$${formatNumber(topCreator.baseRateCents / 100)}` : "Private"}
                      icon={DollarSign}
                    />
                  </div>
                </div>
                <div className="min-h-64 bg-[linear-gradient(135deg,rgba(216,90,48,0.22),rgba(31,28,26,0.76)),url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center" />
              </div>
            </article>
          )}

          {creators.length === 0 && (
            <div className="border-border bg-card rounded-xl border p-6">
              <p className="text-lg font-black">No creators found</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
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
    <article className="border-border bg-card/90 hover:border-primary/35 hover:bg-muted/25 rounded-lg border p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="ring-border h-14 w-14 bg-[linear-gradient(135deg,#D85A30,#B9856B)] font-black text-[#171514] ring-4">
            <AvatarFallback className="bg-transparent text-[#171514]">{initials(creator.displayName)}</AvatarFallback>
            {creator.openToCollabs && <AvatarBadge className="bg-emerald-400" />}
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-black tracking-[-0.035em]">{creator.displayName}</h3>
              {creator.verified && (
                <Badge className="bg-primary/12 text-primary hover:bg-primary/12 rounded-full">
                  <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-foreground/45 mt-1 text-[13px]">
              @{creator.handle} · {creator.location}
            </p>
          </div>
        </div>
        <div className="border-primary/35 bg-primary/14 text-primary grid h-14 w-16 shrink-0 place-items-center rounded-xl border text-center">
          <strong className="text-lg font-black tracking-[-0.04em]">{creator.matchScore}%</strong>
          <span className="-mt-2 text-[10px] font-black tracking-[0.12em] uppercase opacity-70">match</span>
        </div>
      </div>

      <p className="text-foreground/80 mt-4 text-sm leading-6 font-bold">{creator.headline}</p>
      <p className="text-foreground/50 mt-2 line-clamp-2 text-[13px] leading-5">{creator.bio}</p>

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
          <span
            className="bg-muted/40 text-muted-foreground rounded-full px-3 py-1.5 text-[11px] font-black"
            key={niche}
          >
            {niche}
          </span>
        ))}
      </div>

      <div className="border-border mt-5 flex items-center justify-between gap-3 border-t pt-4">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-bold">
          <MapPin className="h-3.5 w-3.5" />
          {creator.location}
        </span>
        <Link
          className="bg-primary text-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black transition"
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
    <div className="border-border bg-muted/30 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground block text-[10px] font-black tracking-[0.14em] uppercase">{label}</span>
        {Icon && <Icon className="text-foreground/28 h-3.5 w-3.5" />}
      </div>
      <strong className="text-foreground mt-1 block text-lg font-black tracking-[-0.04em]">{value}</strong>
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
