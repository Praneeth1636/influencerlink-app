import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  DollarSign,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { resolveAppRole } from "@/lib/auth/role";
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

const nicheOptions = ["Beauty", "Fashion", "Fitness", "Food", "Lifestyle", "Skincare", "Tech", "Travel"];
const reachOptions = [
  { label: "Any reach", value: "" },
  { label: "100K+", value: "100000" },
  { label: "500K+", value: "500000" },
  { label: "1M+", value: "1000000" }
];

export default async function CreatorSearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const role = await resolveAppRole();
  const brandView = role === "brand";
  const filters = parseFilters(params);
  const creators = prioritizeDefaultScoutResults(await getSearchResults(filters), filters);
  const topCreator = creators[0];

  return (
    <main className="terrace-app-bg min-h-screen font-sans">
      <header className="terrace-topbar sticky top-0 z-40 hidden border-b md:block">
        <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
          <div className="hidden min-w-[220px] lg:block">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9a8b83] uppercase">
              {brandView ? "Brand scout" : "Explore"}
            </p>
            <p className="text-sm font-medium text-[#5f6672]">
              {brandView ? "Creator discovery and audience fit" : "Find creators to follow and message"}
            </p>
          </div>
          <form action="/search" className="relative mx-auto w-full max-w-[580px]">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8a94a5]" />
            <input
              autoComplete="off"
              className="h-10 w-full rounded-full border border-[#dedfe3] bg-[#fbfbfc] pr-4 pl-10 text-[13px] text-[#1d1d1f] shadow-[0_1px_1px_rgba(17,24,39,0.04)] outline-none placeholder:text-[#9b9a97] focus:border-[#9dcfe5] sm:h-11 sm:pl-11 sm:text-sm"
              defaultValue={filters.query ?? ""}
              name="q"
              placeholder="Search creators, audiences, niches, platforms..."
            />
            {filters.niche ? <input name="niche" type="hidden" value={filters.niche} /> : null}
            {filters.minReach ? <input name="minReach" type="hidden" value={String(filters.minReach)} /> : null}
            {filters.openToCollabs ? <input name="open" type="hidden" value="1" /> : null}
          </form>
          {brandView ? (
            <Link
              className="hidden rounded-[14px] border border-[#dedfe3] bg-[#fbfbfc] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition hover:bg-white md:inline-flex"
              href="/jobs/new"
            >
              New brief
            </Link>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-[1040px] px-0 py-0 sm:px-5 sm:py-5">
        <section className="min-w-0">
          <section className="terrace-shell-card rounded-none border-x-0 border-t-0 p-3.5 sm:rounded-[24px] sm:border sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d06b3f] uppercase">
                  {brandView ? "Brand search" : "Creator search"}
                </p>
                <h1 className="mt-1 font-serif text-xl leading-tight font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-2xl">
                  {brandView ? "Scout creators by audience fit." : "Find creators you want in your feed."}
                </h1>
                <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-[#667085] sm:mt-2 sm:text-sm sm:leading-6">
                  {brandView
                    ? "Built for brands, search by niche, audience, location, platform, or campaign idea."
                    : "Search by name, niche, location, or platform, then follow or start a conversation."}
                </p>
              </div>
              <form className="grid gap-2.5 sm:gap-3 lg:grid-cols-[minmax(0,1fr)_160px_150px_auto]" action="/search">
                <label className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8a94a5]" />
                  <input
                    className="h-10 w-full rounded-[13px] border border-[#dedfe3] bg-white px-3 pl-10 text-[13px] text-[#1d1d1f] outline-none placeholder:text-[#9b9a97] focus:border-[#9dcfe5] sm:h-12 sm:rounded-[16px] sm:px-4 sm:pl-11 sm:text-sm"
                    defaultValue={filters.query ?? ""}
                    name="q"
                    placeholder="fashion women 25-30, skincare reels..."
                  />
                </label>
                <select
                  className="h-10 rounded-[13px] border border-[#dedfe3] bg-white px-3 text-[13px] text-[#1d1d1f] outline-none focus:border-[#9fc9e4] sm:h-12 sm:rounded-[16px] sm:text-sm"
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
                <select
                  className="h-10 rounded-[13px] border border-[#dedfe3] bg-white px-3 text-[13px] text-[#1d1d1f] outline-none focus:border-[#9fc9e4] sm:h-12 sm:rounded-[16px] sm:text-sm"
                  defaultValue={filters.minReach ? String(filters.minReach) : ""}
                  name="minReach"
                >
                  {reachOptions.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button className="terrace-primary-action h-10 px-4 text-[13px] sm:h-12 sm:px-5 sm:text-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Search
                </button>
                <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#667085] sm:text-sm lg:col-span-4">
                  <input
                    className="h-4 w-4 accent-[#D86B3D]"
                    defaultChecked={filters.openToCollabs}
                    name="open"
                    type="checkbox"
                    value="1"
                  />
                  Open to collabs only
                </label>
              </form>
            </div>
          </section>

          <nav className="mt-3 flex gap-1.5 overflow-x-auto px-3 pb-1 sm:mt-4 sm:gap-2 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <NichePill href={hrefForNiche(filters, null)} active={!filters.niche} label="For you" />
            {nicheOptions.map((niche) => (
              <NichePill
                href={hrefForNiche(filters, niche)}
                active={filters.niche === niche}
                key={niche}
                label={niche}
              />
            ))}
          </nav>

          {topCreator ? (
            <article className="terrace-shell-card mt-3 overflow-hidden rounded-[18px] sm:mt-4 sm:rounded-[24px]">
              <div className="grid md:grid-cols-[minmax(0,1fr)_260px]">
                <div className="p-3.5 sm:p-5">
                  <span className="inline-flex items-center rounded-full border border-[#f3d5c4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#D86B3D] sm:px-3 sm:text-xs">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {brandView ? `Top match · ${topCreator.matchScore}%` : "Creator spotlight"}
                  </span>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.045em] sm:mt-4 sm:text-2xl">
                    {topCreator.displayName}
                  </h2>
                  <p className="mt-1 text-xs text-[#787774] sm:text-sm">
                    @{topCreator.handle} · {topCreator.location}
                  </p>
                  <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#4d5564] sm:mt-3 sm:text-sm sm:leading-6">
                    {topCreator.headline}
                  </p>
                  <p className="mt-2 rounded-[14px] border border-[#dceff8] bg-[#f1faff] px-3 py-2.5 text-[13px] leading-5 font-medium text-[#2b5870] sm:mt-3 sm:rounded-[16px] sm:px-4 sm:py-3 sm:text-sm sm:leading-6">
                    {audienceInsight(topCreator)}
                  </p>
                  <div className="mt-3 grid gap-1.5 sm:mt-4 sm:grid-cols-3 sm:gap-2">
                    <MiniStat label="Reach" value={formatNumber(topCreator.totalReach)} icon={Users} />
                    <MiniStat label="Eng" value={`${topCreator.weightedEngagement.toFixed(1)}%`} icon={TrendingUp} />
                    {brandView ? (
                      <MiniStat
                        label="Rate"
                        value={
                          topCreator.baseRateCents ? `$${formatNumber(topCreator.baseRateCents / 100)}` : "Private"
                        }
                        icon={DollarSign}
                      />
                    ) : (
                      <MiniStat label="Open" value={topCreator.openToCollabs ? "Collabs" : "Follow"} icon={Sparkles} />
                    )}
                  </div>
                </div>
                <div className="hidden min-h-56 bg-[linear-gradient(135deg,rgba(159,201,228,0.34),rgba(226,138,119,0.24))] md:block">
                  <div className="grid h-full place-items-center">
                    <span className="grid h-24 w-24 place-items-center rounded-full bg-white text-2xl font-semibold text-[#37352f] shadow-[0_18px_40px_rgba(17,24,39,0.12)]">
                      {initials(topCreator.displayName)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          {creators.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#e1e1de] bg-white p-10 text-center">
              <p className="text-sm font-semibold">No creators found</p>
              <p className="mt-1 text-xs text-[#787774]">Try a broader keyword or niche.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {creators.map((creator) => (
                <CreatorResultCard creator={creator} key={creator.id} role={role} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function hrefForNiche(filters: CreatorSearchFilters, niche: string | null): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (niche) params.set("niche", niche);
  if (filters.minReach) params.set("minReach", String(filters.minReach));
  if (filters.openToCollabs) params.set("open", "1");
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

function NichePill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      className={
        active
          ? "shrink-0 rounded-[14px] bg-[#1d1d1f] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(17,24,39,0.12)]"
          : "shrink-0 rounded-[14px] px-4 py-2 text-sm font-semibold text-[#667085] transition hover:bg-white hover:text-[#1d1d1f]"
      }
      href={href}
    >
      {label}
    </Link>
  );
}

function CreatorResultCard({ creator, role }: { creator: CreatorSearchResult; role: "creator" | "brand" }) {
  const brandView = role === "brand";

  return (
    <article className="terrace-panel rounded-[22px] p-4 transition hover:border-[#cfd5dc] hover:bg-white">
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#cad7de,#edbda6)] text-xs font-semibold text-[#1d1d1f] ring-2 ring-white sm:h-14 sm:w-14 sm:text-sm sm:ring-4">
            {initials(creator.displayName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-base">
                {creator.displayName}
              </h3>
              {creator.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-[#8CC9E8]" /> : null}
            </div>
            <p className="mt-1 truncate text-xs text-[#787774]">@{creator.handle}</p>
            <p className="mt-2 line-clamp-1 text-[13px] text-[#303847] sm:mt-3 sm:text-sm">{creator.headline}</p>
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-[11px] leading-4 font-medium text-[#2b5870] sm:mt-2 sm:text-xs sm:leading-5">
              {audienceInsight(creator)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              {creator.niches.slice(0, 3).map((niche) => (
                <span
                  className="rounded-full border border-[#e9e9e7] bg-white px-2.5 py-1 text-[11px] font-medium text-[#787774] sm:px-3 sm:text-xs"
                  key={niche}
                >
                  {niche}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-3">
          <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
            <CompactStat label="Reach" value={formatNumber(creator.totalReach)} />
            <CompactStat label="Eng" value={`${creator.weightedEngagement.toFixed(1)}%`} />
            <CompactStat
              label={brandView ? "Fit" : "Open"}
              value={brandView ? `${creator.matchScore}%` : creator.openToCollabs ? "Yes" : "Follow"}
              highlight={brandView}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-[#787774]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {creator.location}
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Link
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] border border-[#dedfe3] bg-white text-[#667085] transition hover:border-[#dceff8] hover:text-[#1d1d1f] sm:h-9 sm:w-9 sm:rounded-[13px]"
                href="/saved"
                aria-label={`Save ${creator.displayName}`}
              >
                <Bookmark className="h-4 w-4" />
              </Link>
              <Link
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] border border-[#dedfe3] bg-white text-[#667085] transition hover:border-[#dceff8] hover:text-[#1d1d1f] sm:h-9 sm:w-9 sm:rounded-[13px]"
                href="/messages"
                aria-label={`Message ${creator.displayName}`}
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-[11px] bg-[#1d1d1f] px-3 text-[13px] font-semibold text-white transition hover:bg-[#333336] sm:h-9 sm:rounded-[13px] sm:px-4 sm:text-sm"
                href={`/profile/${creator.handle}`}
              >
                Open
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`min-w-0 rounded-[14px] border px-2.5 py-2 ${highlight ? "border-[#f3d5c4] bg-[#fff3ec] text-[#D86B3D]" : "border-[#dedfe3] bg-white/72 text-[#1d1d1f]"}`}
    >
      <span className="block truncate text-[9px] font-semibold tracking-[0.13em] text-[#98a2b3] uppercase">
        {label}
      </span>
      <strong className="mt-0.5 block truncate text-sm font-semibold tracking-[-0.03em]">{value}</strong>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Users }) {
  return (
    <div className="rounded-[14px] border border-[#dedfe3] bg-white/72 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="block text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</span>
        {Icon ? <Icon className="h-3.5 w-3.5 text-[#9b9a97]" /> : null}
      </div>
      <strong className="mt-1 block text-base font-semibold tracking-[-0.04em] text-[#37352f]">{value}</strong>
    </div>
  );
}

function primaryNiche(creator: CreatorSearchResult) {
  return creator.niches[0] ?? "Creator";
}

function audienceInsight(creator: CreatorSearchResult) {
  const niche = primaryNiche(creator).toLowerCase();
  if (niche.includes("fashion")) return "Strong influence over 25-30 year old women in fashion and outfit discovery.";
  if (niche.includes("food")) return "Strong with food buyers who save recipe demos and short-form product tests.";
  if (niche.includes("fitness"))
    return "Strong with wellness audiences looking for routines, gear, and practical results.";
  if (niche.includes("beauty") || niche.includes("skincare")) {
    return "Strong with beauty shoppers who respond to routine-led product demos and honest reviews.";
  }
  return `Strong fit for ${primaryNiche(creator).toLowerCase()} campaigns with verified reach and engagement.`;
}

async function getSearchResults(filters: CreatorSearchFilters) {
  try {
    const caller = await createTRPCServerCaller();
    if (filters.query) {
      const results = mapCreatorRows(await caller.creator.search({ query: filters.query, limit: 24 }));
      return shouldUseDemoCreators(results) ? buildSeedCreatorSearchResults(filters) : results;
    }

    const result = await caller.creator.list({
      limit: 24,
      niche: filters.niche,
      minReach: filters.minReach,
      openToCollabs: filters.openToCollabs
    });

    const results = mapCreatorRows(result.items);
    return shouldUseDemoCreators(results) ? buildSeedCreatorSearchResults(filters) : results;
  } catch {
    return buildSeedCreatorSearchResults(filters);
  }
}

function shouldUseDemoCreators(results: CreatorSearchResult[]) {
  if (results.length === 0) return true;

  return results.every((creator) => creator.totalReach === 0 && creator.weightedEngagement === 0);
}

function prioritizeDefaultScoutResults(creators: CreatorSearchResult[], filters: CreatorSearchFilters) {
  if (filters.query || filters.niche || filters.minReach || filters.openToCollabs) return creators;

  return [...creators].sort((a, b) => commercePriority(b) - commercePriority(a) || b.matchScore - a.matchScore);
}

function commercePriority(creator: CreatorSearchResult) {
  const searchable = `${creator.headline} ${creator.bio} ${creator.niches.join(" ")}`.toLowerCase();
  if (searchable.includes("fashion") || searchable.includes("beauty") || searchable.includes("skincare")) return 4;
  if (searchable.includes("food") || searchable.includes("fitness") || searchable.includes("wellness")) return 3;
  if (searchable.includes("lifestyle") || searchable.includes("travel")) return 2;
  return 1;
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
    .slice(0, 2)
    .toUpperCase();
}

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString();
}
