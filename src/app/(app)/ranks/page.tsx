import React from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { buildSeedCreatorSearchResults, mapCreatorRows, type CreatorSearchResult } from "@/lib/search/creator-search";
import { createTRPCServerCaller } from "@/lib/trpc/server";
import {
  TerraceAnalyticsIcon,
  TerraceRanksIcon,
  TerraceReadyIcon,
  TerraceSearchIcon,
  TerraceSparkIcon
} from "@/components/brand/terrace-icons";

type RankCategory = {
  id: string;
  label: string;
  description: string;
  icon: typeof TerraceRanksIcon;
  tone: string;
  creators: RankedCreator[];
};

type RankedCreator = CreatorSearchResult & {
  rank: number;
  rankLabel: string;
};

export default async function RanksPage() {
  const creators = await getRankCreators();
  const categories = buildRankCategories(creators);
  const overallLeader = categories[0]?.creators[0] ?? null;

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <section className="mx-auto max-w-[1180px] px-5 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[28px] border border-[#e6e8ec] bg-[#fbfcfd] p-6 shadow-[0_18px_50px_rgba(17,24,39,0.04)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#D86B3D] uppercase">Creator ranks</p>
                <h1 className="mt-3 max-w-2xl text-5xl leading-[0.95] font-semibold tracking-[-0.065em] text-[#23272f]">
                  Top creators by industry.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#667085]">
                  See the top 5 creators in fashion, food, beauty, lifestyle, and overall. Rankings use reach,
                  engagement, verification, growth signals, and open-to-collab status.
                </p>
              </div>
              {overallLeader ? (
                <Link
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#15171c] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#282d36]"
                  href={`/profile/${overallLeader.handle}`}
                >
                  Open #1 profile
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <RankStat label="Creators ranked" value={String(creators.length)} icon={TerraceSearchIcon} />
              <RankStat
                label="Top fit"
                value={overallLeader ? `${overallLeader.matchScore}%` : "0%"}
                icon={TerraceSparkIcon}
              />
              <RankStat
                label="Top reach"
                value={overallLeader ? formatNumber(Math.max(...creators.map((creator) => creator.totalReach))) : "0"}
                icon={TerraceAnalyticsIcon}
              />
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#e6e8ec] bg-[#15171c] p-6 text-white shadow-[0_20px_58px_rgba(17,24,39,0.14)]">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#f7a777] uppercase">Overall leader</p>
            {overallLeader ? (
              <>
                <div className="mt-5 flex items-center gap-4">
                  <CreatorAvatar name={overallLeader.displayName} />
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold tracking-[-0.045em]">{overallLeader.displayName}</h2>
                    <p className="truncate text-sm text-[#d5d9df]/68">@{overallLeader.handle}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-2">
                  <DarkMetric label="Overall fit" value={`${overallLeader.matchScore}%`} />
                  <DarkMetric label="Reach" value={formatNumber(overallLeader.totalReach)} />
                  <DarkMetric label="Engagement" value={`${overallLeader.weightedEngagement.toFixed(1)}%`} />
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-[#d5d9df]/68">No creators available yet.</p>
            )}
          </aside>
        </div>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          {categories.map((category) => (
            <RankCategoryCard category={category} key={category.id} />
          ))}
        </section>
      </section>
    </main>
  );
}

function RankCategoryCard({ category }: { category: RankCategory }) {
  const Icon = category.icon;

  return (
    <article className="rounded-[26px] border border-[#e6e8ec] bg-white p-5 shadow-[0_14px_38px_rgba(17,24,39,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-2xl border ${category.tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[#23272f]">{category.label}</h2>
            <p className="mt-1 text-sm text-[#667085]">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {category.creators.map((creator) => (
          <Link
            className="group flex items-center gap-3 rounded-[18px] border border-[#e6e8ec] bg-[#fbfcfd] p-3 transition hover:-translate-y-0.5 hover:border-[#dceff8] hover:bg-white hover:shadow-[0_12px_30px_rgba(17,24,39,0.05)]"
            href={`/profile/${creator.handle}`}
            key={`${category.id}-${creator.id}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#15171c] text-sm font-semibold text-white">
              #{creator.rank}
            </span>
            <CreatorAvatar name={creator.displayName} small />
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-[#23272f]">{creator.displayName}</span>
                {creator.verified ? <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#3e95bd]" /> : null}
              </span>
              <span className="mt-0.5 block truncate text-xs text-[#667085]">{creator.rankLabel}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#D86B3D]" />
          </Link>
        ))}
      </div>
    </article>
  );
}

function buildRankCategories(creators: CreatorSearchResult[]): RankCategory[] {
  return [
    {
      id: "overall",
      label: "Overall",
      description: "Top 5 creators across every industry.",
      icon: TerraceRanksIcon,
      tone: "border-[#f5d5c3] bg-[#fff3ec] text-[#D86B3D]",
      creators: rankCreators(
        creators,
        (creator) => creator.matchScore,
        (creator) => `${creator.matchScore}% match fit`
      )
    },
    {
      id: "fashion",
      label: "Fashion",
      description: "Top 5 fashion influence profiles.",
      icon: TerraceSearchIcon,
      tone: "border-[#dceff8] bg-[#f1faff] text-[#2b8fc4]",
      creators: rankCreators(
        categoryCreators(creators, ["fashion", "style", "beauty", "lifestyle"]),
        categoryScore,
        (creator) => `${audienceFitFor(creator, "fashion")}, ${creator.weightedEngagement.toFixed(1)}% engagement`
      )
    },
    {
      id: "food",
      label: "Food",
      description: "Top 5 food and wellness creators.",
      icon: TerraceAnalyticsIcon,
      tone: "border-[#f5d5c3] bg-[#fff8e8] text-[#886018]",
      creators: rankCreators(
        categoryCreators(creators, ["food", "wellness", "fitness", "lifestyle"]),
        categoryScore,
        (creator) => `${audienceFitFor(creator, "food")}, ${formatNumber(creator.totalReach)} reach`
      )
    },
    {
      id: "beauty",
      label: "Beauty",
      description: "Top 5 beauty and skincare creators.",
      icon: TerraceReadyIcon,
      tone: "border-[#dcebdc] bg-[#f1fbf3] text-[#287944]",
      creators: rankCreators(
        categoryCreators(creators, ["beauty", "skincare", "fashion", "lifestyle"]),
        categoryScore,
        (creator) => `${audienceFitFor(creator, "beauty")}, ${creator.matchScore}% fit`
      )
    }
  ];
}

function inCategory(creator: CreatorSearchResult, terms: string[]) {
  const searchable = `${creator.headline} ${creator.bio} ${creator.niches.join(" ")}`.toLowerCase();
  return terms.some((term) => searchable.includes(term));
}

function categoryCreators(creators: CreatorSearchResult[], terms: string[]) {
  const matched = creators.filter((creator) => inCategory(creator, terms));
  return matched.length >= 5 ? matched : creators;
}

function categoryScore(creator: CreatorSearchResult) {
  return creator.matchScore + Math.min(20, creator.weightedEngagement * 2) + (creator.openToCollabs ? 8 : 0);
}

function audienceFitFor(creator: CreatorSearchResult, category: "fashion" | "food" | "beauty") {
  const locationHint = creator.location ? `${creator.location.split(",")[0]} audience` : "verified audience";
  if (category === "fashion") return `Strong with 25-30 women in ${locationHint}`;
  if (category === "food") return `Strong with recipe buyers in ${locationHint}`;
  return `Strong with beauty shoppers in ${locationHint}`;
}

function rankCreators(
  creators: CreatorSearchResult[],
  score: (creator: CreatorSearchResult) => number,
  rankLabel: (creator: CreatorSearchResult) => string
): RankedCreator[] {
  return [...creators]
    .sort((a, b) => score(b) - score(a) || b.totalReach - a.totalReach || a.displayName.localeCompare(b.displayName))
    .slice(0, 5)
    .map((creator, index) => ({
      ...creator,
      rank: index + 1,
      rankLabel: rankLabel(creator)
    }));
}

function RankStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof TerraceRanksIcon }) {
  return (
    <div className="rounded-2xl border border-[#e6e8ec] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-[#98a2b3] uppercase">{label}</span>
        <Icon accent="#D86B3D" className="h-5 w-5 text-[#D86B3D]" />
      </div>
      <strong className="mt-2 block text-2xl font-semibold tracking-[-0.055em] text-[#23272f]">{value}</strong>
    </div>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-sm">
      <span className="text-[#d5d9df]/68">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CreatorAvatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span
      className={
        small
          ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#9fc9e4,#f5b38e)] text-xs font-semibold text-[#23272f]"
          : "grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#9fc9e4,#f5b38e)] text-sm font-semibold text-[#23272f] ring-4 ring-white/10"
      }
    >
      {initials(name)}
    </span>
  );
}

async function getRankCreators() {
  try {
    const caller = await createTRPCServerCaller();
    const result = await caller.creator.list({ limit: 40 });
    const creators = mapCreatorRows(result.items);
    return shouldUseDemoCreators(creators) ? buildSeedCreatorSearchResults() : creators;
  } catch {
    return buildSeedCreatorSearchResults();
  }
}

function shouldUseDemoCreators(creators: CreatorSearchResult[]) {
  if (creators.length === 0) return true;
  return creators.every((creator) => creator.totalReach === 0 && creator.weightedEngagement === 0);
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
