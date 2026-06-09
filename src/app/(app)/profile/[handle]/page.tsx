import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { resolveAppRole } from "@/lib/auth/role";
import { buildSeedData } from "@/lib/db/seed";
import { createTRPCServerCaller } from "@/lib/trpc/server";

type ProfilePageProps = {
  params: Promise<{
    handle: string;
  }>;
};

type CreatorProfileData = Awaited<ReturnType<Awaited<ReturnType<typeof createTRPCServerCaller>>["creator"]["profile"]>>;

export default async function CreatorPublicProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const role = await resolveAppRole();
  const brandView = role === "brand";
  const profile = await getCreatorProfile(handle);

  if (!profile) {
    notFound();
  }

  const totalReach = profile.aggregate?.totalReach ?? 0;
  const engagement = Number(profile.aggregate?.weightedEngagement ?? 0);
  const baseRate = profile.creator.baseRateCents ? profile.creator.baseRateCents / 100 : null;
  const following = Math.max(128, Math.round(totalReach / 42000));
  const contentSlots = Array.from({ length: Math.max(6, profile.posts.length) }, (_, index) => ({
    post: profile.posts[index] ?? null,
    index
  })).slice(0, 9);

  return (
    <main className="terrace-app-bg min-h-screen font-sans">
      <header className="terrace-topbar sticky top-0 z-40 border-b">
        <div className="mx-auto flex max-w-[935px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
          <h1 className="min-w-0 truncate text-base font-semibold tracking-[-0.04em] text-[#1d1d1f] sm:text-lg">
            @{profile.creator.handle}
          </h1>
          {profile.creator.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-[#78bde8]" /> : null}
          <nav className="ml-auto flex items-center gap-2">
            <Link
              className="rounded-[11px] border border-[#dedfe3] bg-[#fbfbfc] px-2.5 py-1.5 text-xs font-semibold text-[#1d1d1f] transition hover:bg-white sm:rounded-[14px] sm:px-4 sm:py-2 sm:text-sm"
              href="/saved"
            >
              {brandView ? "Save" : "Follow"}
            </Link>
            <Link
              className="rounded-[11px] bg-[#1d1d1f] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#333336] sm:rounded-[14px] sm:px-4 sm:py-2 sm:text-sm"
              href="/messages"
            >
              Message
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[935px] px-0 py-0 sm:px-5 sm:py-7">
        <article className="terrace-shell-card border-x-0 border-t-0 px-3.5 py-4 sm:rounded-[28px] sm:border sm:px-7 sm:py-7">
          <div className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-8">
            <CreatorAvatar
              name={profile.creator.displayName}
              openToCollabs={profile.creator.openToCollabs}
              className="h-[68px] w-[68px] self-start border-[3px] border-[#fbfbfc] text-base shadow-[0_10px_24px_rgba(17,24,39,0.08)] sm:h-32 sm:w-32 sm:text-3xl"
            />

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-lg font-semibold tracking-[-0.045em] sm:text-2xl">
                  {profile.creator.displayName}
                </h2>
                {profile.creator.verified ? (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[#78bde8] sm:h-5 sm:w-5" />
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-[#6b7280] sm:mt-1 sm:text-sm">@{profile.creator.handle}</p>

              <div className="mt-4 hidden grid-cols-3 gap-7 sm:grid">
                <SocialStat label="posts" value={formatNumber(profile.posts.length)} />
                <SocialStat label="followers" value={formatNumber(totalReach)} />
                <SocialStat label="following" value={formatNumber(following)} />
              </div>

              <div className="mt-4 hidden max-w-[520px] text-sm leading-6 text-[#4b5563] sm:block">
                <p className="font-semibold text-[#1d1d1f]">
                  {profile.creator.headline ?? "Creator building measurable brand partnerships"}
                </p>
                <p className="mt-1">{profileAudienceInsight(profile.creator.niches, profile.creator.location)}</p>
              </div>
            </div>

            <div className="col-span-2 mt-0.5 grid grid-cols-3 border-y border-[#e4e5e8] py-2.5 text-center sm:hidden">
              <SocialStat label="posts" value={formatNumber(profile.posts.length)} />
              <SocialStat label="followers" value={formatNumber(totalReach)} />
              <SocialStat label="following" value={formatNumber(following)} />
            </div>

            <div className="col-span-2 text-[13px] leading-[1.45] text-[#4b5563] sm:hidden">
              <p className="font-semibold text-[#1d1d1f]">
                {profile.creator.headline ?? "Creator building measurable brand partnerships"}
              </p>
              <p className="mt-1">{profileAudienceInsight(profile.creator.niches, profile.creator.location)}</p>
            </div>

            <div className="col-span-2 flex flex-wrap gap-1.5 sm:gap-2">
              {profile.creator.openToCollabs ? <ProfilePill>Open to collabs</ProfilePill> : null}
              {profile.creator.location ? <ProfilePill>{profile.creator.location}</ProfilePill> : null}
              {profile.creator.niches.map((niche) => (
                <ProfilePill key={niche}>{niche}</ProfilePill>
              ))}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link
                className="terrace-primary-action h-9 px-4 text-[13px] sm:h-10 sm:min-w-36 sm:px-5 sm:text-sm"
                href="/messages"
              >
                Message
              </Link>
              <Link
                className="terrace-secondary-action h-9 px-4 text-[13px] sm:h-10 sm:min-w-36 sm:px-5 sm:text-sm"
                href="/saved"
              >
                {brandView ? "Save" : "Follow"}
              </Link>
            </div>
          </div>

          {profile.platforms.length > 0 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 sm:mt-6 sm:gap-4">
              {profile.platforms.map(({ platform }) => (
                <a
                  className="grid shrink-0 justify-items-center gap-1.5 text-[11px] font-semibold text-[#37352f] sm:gap-2 sm:text-xs"
                  href={platform.externalHandle ? `https://${platform.platform}.com/${platform.externalHandle}` : "#"}
                  key={platform.id}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-[#dedfe3] bg-[linear-gradient(135deg,#f1faff,#fff3ec)] text-[10px] text-[#D86B3D] uppercase shadow-[inset_0_0_0_3px_#fbfbfc] sm:h-14 sm:w-14 sm:text-[11px]">
                    {platform.platform.slice(0, 2)}
                  </span>
                  <span>{platform.platform}</span>
                </a>
              ))}
            </div>
          ) : null}
        </article>

        <div className="sticky top-[52px] z-30 grid grid-cols-3 border-b border-[#dedfe3] bg-[#f5f5f7]/92 text-center text-[10px] font-semibold tracking-[0.16em] text-[#8b9098] uppercase backdrop-blur-xl sm:top-[61px] sm:mt-5 sm:text-[11px]">
          <span className="border-b border-[#1d1d1f] py-2.5 text-[#1d1d1f] sm:py-3">Posts</span>
          <span className="py-2.5 sm:py-3">Reels</span>
          <span className="py-2.5 sm:py-3">Tagged</span>
        </div>

        <section className="grid grid-cols-3 gap-0.5 bg-[#dedfe3] sm:gap-1.5 sm:bg-transparent sm:pt-1">
          {contentSlots.map(({ post, index }) => (
            <CreatorPostTile key={post?.id ?? `slot-${index}`} post={post} index={index} />
          ))}
        </section>

        <section className="terrace-panel mx-4 my-5 grid gap-3 rounded-[22px] p-4 sm:mx-0 sm:my-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#9b9a97] uppercase">
              {brandView ? "Brand snapshot" : "Creator snapshot"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4b5563]">
              {brandView
                ? profileAudienceInsight(profile.creator.niches, profile.creator.location)
                : "Follow their posts, check connected socials, and start a conversation when their work resonates."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[320px]">
            <CompactBrandMetric label="Eng" value={`${engagement.toFixed(1)}%`} />
            <CompactBrandMetric
              label={brandView ? "Rate" : "Posts"}
              value={
                brandView ? (baseRate ? `$${formatNumber(baseRate)}` : "Private") : formatNumber(profile.posts.length)
              }
            />
            <CompactBrandMetric label="Views" value={formatNumber(profile.creator.profileViews)} />
          </div>
          <div className="sm:col-span-2">
            <Link
              className="terrace-secondary-action h-10 w-full px-5 text-sm sm:w-auto"
              href={brandView ? "/jobs/new" : "/messages"}
            >
              {brandView ? "Add to campaign" : "Message creator"}
            </Link>
          </div>
        </section>

        {profile.platforms.length > 0 ? (
          <section className="mx-4 mb-6 grid gap-3 sm:mx-0 sm:grid-cols-3">
            {profile.platforms.slice(0, 3).map(({ platform, latestMetrics }) => (
              <PlatformAnalyticsCard
                key={platform.id}
                platform={platform.platform}
                handle={platform.externalHandle}
                followers={latestMetrics?.followers ?? 0}
                avgViews={latestMetrics?.avgViews ?? 0}
                avgLikes={latestMetrics?.avgLikes ?? 0}
                avgComments={latestMetrics?.avgComments ?? 0}
                engagementRate={Number(latestMetrics?.engagementRate ?? 0)}
                syncedAt={platform.lastSyncedAt}
              />
            ))}
          </section>
        ) : null}
      </section>
    </main>
  );
}

async function getCreatorProfile(handle: string) {
  try {
    const caller = await createTRPCServerCaller();
    return (await caller.creator.profile({ handle })) ?? getSeedCreatorProfile(handle);
  } catch {
    return getSeedCreatorProfile(handle);
  }
}

function getSeedCreatorProfile(handle: string): CreatorProfileData {
  const seed = buildSeedData();
  const creator = seed.creators.find((row) => row.handle === handle.toLowerCase());
  if (!creator) return null;

  const aggregate = seed.creatorAggregates.find((row) => row.creatorId === creator.id) ?? null;
  const platforms = seed.creatorPlatforms
    .filter((platform) => platform.creatorId === creator.id)
    .map((platform) => {
      const latestMetrics = seed.platformMetrics.find((metric) => metric.creatorPlatformId === platform.id);

      return {
        platform: {
          id: platform.id!,
          creatorId: platform.creatorId,
          platform: platform.platform,
          externalId: platform.externalId,
          externalHandle: platform.externalHandle,
          accessToken: platform.accessToken,
          refreshToken: platform.refreshToken ?? null,
          connectedAt: platform.connectedAt ?? new Date("2026-04-01T00:00:00.000Z"),
          lastSyncedAt: platform.lastSyncedAt ?? null
        },
        latestMetrics: latestMetrics
          ? {
              id: latestMetrics.id!,
              creatorPlatformId: latestMetrics.creatorPlatformId,
              snapshotDate: latestMetrics.snapshotDate,
              followers: latestMetrics.followers ?? 0,
              avgViews: latestMetrics.avgViews ?? 0,
              avgLikes: latestMetrics.avgLikes ?? 0,
              avgComments: latestMetrics.avgComments ?? 0,
              engagementRate: latestMetrics.engagementRate ?? "0",
              audienceAgeJson: latestMetrics.audienceAgeJson ?? {},
              audienceGenderJson: latestMetrics.audienceGenderJson ?? {},
              audienceGeoJson: latestMetrics.audienceGeoJson ?? {}
            }
          : null
      };
    });
  const creatorPosts = seed.posts
    .filter((post) => post.authorType === "creator" && post.authorId === creator.id)
    .slice(0, 12)
    .map((post) => ({
      id: post.id!,
      authorType: post.authorType!,
      authorId: post.authorId,
      body: post.body,
      mediaJson: post.mediaJson ?? [],
      type: post.type ?? "update",
      visibility: post.visibility ?? "public",
      source: post.source ?? "terrace",
      externalUrl: post.externalUrl ?? null,
      externalId: post.externalId ?? null,
      createdAt: post.createdAt ?? new Date("2026-04-28T00:00:00.000Z"),
      updatedAt: post.updatedAt ?? new Date("2026-04-28T00:00:00.000Z")
    }));

  return {
    creator: {
      id: creator.id!,
      userId: creator.userId,
      handle: creator.handle,
      displayName: creator.displayName,
      bio: creator.bio ?? null,
      headline: creator.headline ?? null,
      location: creator.location ?? null,
      niches: creator.niches ?? [],
      avatarUrl: creator.avatarUrl ?? null,
      coverUrl: creator.coverUrl ?? null,
      verified: creator.verified ?? false,
      profileViews: creator.profileViews ?? 0,
      openToCollabs: creator.openToCollabs ?? false,
      ratesPublic: creator.ratesPublic ?? false,
      baseRateCents: creator.baseRateCents ?? null,
      currency: creator.currency ?? "USD",
      createdAt: creator.createdAt ?? new Date("2026-04-01T00:00:00.000Z"),
      updatedAt: creator.updatedAt ?? new Date("2026-04-01T00:00:00.000Z")
    },
    aggregate: aggregate
      ? {
          creatorId: aggregate.creatorId,
          totalReach: aggregate.totalReach ?? 0,
          weightedEngagement: aggregate.weightedEngagement ?? "0",
          primaryNiche: aggregate.primaryNiche ?? null,
          computedAt: aggregate.computedAt ?? new Date("2026-04-28T00:00:00.000Z")
        }
      : null,
    platforms,
    posts: creatorPosts,
    collabs: [] as CreatorProfileData extends null ? never : NonNullable<CreatorProfileData>["collabs"]
  };
}

function CreatorAvatar({
  name,
  openToCollabs,
  className
}: {
  name: string;
  openToCollabs: boolean;
  className?: string;
}) {
  return (
    <Avatar className={`bg-[linear-gradient(135deg,#9fc9e4,#e28a77)] font-semibold text-[#37352f] ${className ?? ""}`}>
      <AvatarFallback className="bg-transparent text-[#37352f]">{initials(name)}</AvatarFallback>
      {openToCollabs && <AvatarBadge className="bg-emerald-400" />}
    </Avatar>
  );
}

function SocialStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold tracking-[-0.04em] text-[#1d1d1f] sm:text-lg">{value}</p>
      <p className="text-[11px] text-[#6b7280] sm:text-sm">{label}</p>
    </div>
  );
}

function ProfilePill({ children }: { children: React.ReactNode }) {
  return <span className="terrace-pill !px-2.5 !py-1 !text-[11px] sm:!px-3 sm:!text-xs">{children}</span>;
}

function CreatorPostTile({
  post,
  index
}: {
  post: NonNullable<CreatorProfileData>["posts"][number] | null;
  index: number;
}) {
  return (
    <Link
      aria-label={post ? post.body : "Creator post placeholder"}
      className="terrace-media-tile group relative block aspect-square"
      href={post?.externalUrl ?? "#"}
    >
      <span
        className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${contentImage(index)})` }}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/28 via-black/0 to-black/0 opacity-0 transition duration-200 group-hover:opacity-100" />
      {post ? (
        <span className="absolute right-2 bottom-2 rounded-full bg-white/92 px-2 py-1 text-[10px] font-semibold text-[#1d1d1f] shadow-[0_6px_18px_rgba(17,24,39,0.16)]">
          {post.type.replace("_", " ")}
        </span>
      ) : null}
    </Link>
  );
}

function CompactBrandMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#e4e5e8] bg-white px-2 py-3">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tracking-[-0.035em] text-[#1d1d1f]">{value}</p>
    </div>
  );
}

const PLATFORM_META: Record<string, { label: string; tag: string; bg: string; text: string; followerLabel: string }> = {
  instagram: {
    label: "Instagram",
    tag: "IG",
    bg: "bg-[#fff0e8]",
    text: "text-[#D86B3D]",
    followerLabel: "Followers"
  },
  tiktok: {
    label: "TikTok",
    tag: "TT",
    bg: "bg-[#eaf7fd]",
    text: "text-[#2f83b7]",
    followerLabel: "Followers"
  },
  youtube: {
    label: "YouTube",
    tag: "YT",
    bg: "bg-[#fde8eb]",
    text: "text-[#c43c4a]",
    followerLabel: "Subscribers"
  },
  twitter: {
    label: "Twitter / X",
    tag: "X",
    bg: "bg-[#eef1f5]",
    text: "text-[#1f2937]",
    followerLabel: "Followers"
  },
  linkedin: {
    label: "LinkedIn",
    tag: "LI",
    bg: "bg-[#e7f0fb]",
    text: "text-[#1d4f8b]",
    followerLabel: "Followers"
  }
};

function PlatformAnalyticsCard({
  platform,
  handle,
  followers,
  avgViews,
  avgLikes,
  avgComments,
  engagementRate,
  syncedAt
}: {
  platform: string;
  handle: string;
  followers: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  syncedAt: Date | null;
}) {
  const meta = PLATFORM_META[platform] ?? {
    label: platform,
    tag: platform.slice(0, 2).toUpperCase(),
    bg: "bg-[#fbfbfa]",
    text: "text-[#787774]",
    followerLabel: "Followers"
  };
  return (
    <article className="rounded-[18px] border border-[#dedfe3] bg-[#fbfbfc] p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_28px_rgba(17,24,39,0.03)] sm:rounded-[20px] sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-[9px] text-[10px] font-semibold sm:h-8 sm:w-8 sm:rounded-[10px] ${meta.bg} ${meta.text}`}
          >
            {meta.tag}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{meta.label}</p>
            <p className="truncate text-xs text-[#9b9a97]">@{handle}</p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-medium text-[#9b9a97]">
          {syncedAt ? formatDate(syncedAt) : "Pending sync"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[14px] bg-white/72 p-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{meta.followerLabel}</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.04em]">{formatNumber(followers)}</p>
        </div>
        <div className="rounded-[14px] bg-white/72 p-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">Avg views</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.04em]">{formatNumber(avgViews)}</p>
        </div>
        <div className="rounded-[14px] bg-white/72 p-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">Engagement</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.04em]">{engagementRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-[14px] bg-white/72 p-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">1 mo growth</p>
          <p className="mt-1 text-lg font-semibold tracking-[-0.04em]">
            +{estimateGrowth(avgViews, avgLikes, avgComments)}%
          </p>
        </div>
      </div>
    </article>
  );
}

function estimateGrowth(avgViews: number, avgLikes: number, avgComments: number) {
  const signal = avgViews / 10000 + avgLikes / 2000 + avgComments / 300;
  return Math.max(8, Math.min(48, Math.round(signal)));
}

function contentImage(index: number) {
  const images = [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556228724-4c6c1b305c35?auto=format&fit=crop&w=1200&q=80"
  ];
  return images[index % images.length];
}

function profileAudienceInsight(niches: string[], location: string | null) {
  const searchable = niches.join(" ").toLowerCase();
  const place = location ? ` in ${location.split(",")[0]}` : "";
  if (searchable.includes("fashion"))
    return `Influences style-conscious women 25-30${place}, with strong outfit discovery and save behavior.`;
  if (searchable.includes("food"))
    return `Influences food buyers${place}, especially audiences that save recipes and product-led demos.`;
  if (searchable.includes("fitness"))
    return `Influences wellness audiences${place}, with routine-led content and practical product interest.`;
  if (searchable.includes("beauty") || searchable.includes("skincare")) {
    return `Influences beauty shoppers${place}, strongest around routines, honest reviews, and product demos.`;
  }
  return `Influences a verified audience${place}, with measurable reach and engagement across connected platforms.`;
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}
