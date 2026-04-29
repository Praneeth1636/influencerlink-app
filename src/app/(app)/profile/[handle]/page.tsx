import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  DollarSign,
  MapPin,
  MessageCircle,
  Radio,
  TrendingUp,
  Users
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const profile = await getCreatorProfile(handle);

  if (!profile) {
    notFound();
  }

  const totalReach = profile.aggregate?.totalReach ?? 0;
  const engagement = Number(profile.aggregate?.weightedEngagement ?? 0);
  const baseRate = profile.creator.baseRateCents ? profile.creator.baseRateCents / 100 : null;

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(216,90,48,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(168,85,247,0.13),transparent_26%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:56px_56px] opacity-35" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-4">
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
            <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">CreatorLink</p>
            <p className="hidden text-sm text-white/60 sm:block">Verified creator profile</p>
          </div>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              className="rounded-xl px-3 py-2 text-sm font-bold text-white/58 transition hover:bg-white/[0.06] hover:text-white"
              href="/feed"
            >
              Feed
            </Link>
            <Link
              className="rounded-xl bg-[#D85A30] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c54f29]"
              href="/messages"
            >
              Message
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1180px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-6">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/10">
            <div className="h-56 bg-[linear-gradient(135deg,rgba(216,90,48,0.44),rgba(168,85,247,0.22)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="p-6 pt-0">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex items-end gap-5">
                  <CreatorAvatar
                    name={profile.creator.displayName}
                    openToCollabs={profile.creator.openToCollabs}
                    className="-mt-12 h-28 w-28 border-4 border-[#101013] text-3xl"
                  />
                  <div className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-4xl font-black tracking-[-0.05em]">{profile.creator.displayName}</h1>
                      {profile.creator.verified && <BadgeCheck className="h-6 w-6 text-[#ffb49c]" />}
                    </div>
                    <p className="mt-2 text-sm text-white/50">@{profile.creator.handle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.creator.openToCollabs && (
                    <Badge className="rounded-full bg-emerald-300/12 px-3 py-1 text-emerald-100 hover:bg-emerald-300/12">
                      <Radio className="mr-2 h-3.5 w-3.5" />
                      Open to collabs
                    </Badge>
                  )}
                  {profile.creator.verified && (
                    <Badge className="rounded-full bg-[#D85A30]/12 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/12">
                      Verified metrics
                    </Badge>
                  )}
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-lg leading-8 font-bold text-white/82">
                {profile.creator.headline ?? "Creator building measurable brand partnerships"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/48">
                {profile.creator.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.creator.location}
                  </span>
                )}
                {profile.creator.niches.map((niche) => (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1" key={niche}>
                    {niche}
                  </span>
                ))}
              </div>
              {profile.creator.bio && (
                <p className="mt-6 max-w-4xl text-sm leading-7 text-white/58">{profile.creator.bio}</p>
              )}

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <ProfileMetric icon={Users} label="Total reach" value={formatNumber(totalReach)} />
                <ProfileMetric icon={TrendingUp} label="Engagement" value={`${engagement.toFixed(1)}%`} />
                <ProfileMetric
                  icon={BriefcaseBusiness}
                  label="Profile views"
                  value={String(profile.creator.profileViews)}
                />
                <ProfileMetric
                  icon={DollarSign}
                  label="Base rate"
                  value={baseRate ? `$${formatNumber(baseRate)}` : "Private"}
                  highlighted
                />
              </div>
            </div>
          </article>

          <section className="grid gap-4">
            <SectionHeader eyebrow="Creator Posts" title="Recent proof and creator updates." />
            <div className="grid gap-3">
              {profile.posts.length === 0 && (
                <EmptyPanel title="No posts yet" body="This creator has not published public proof posts yet." />
              )}
              {profile.posts.map((post) => (
                <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5" key={post.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
                      {post.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs font-bold text-white/35">{formatDate(post.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{post.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <SectionHeader eyebrow="Platforms" title="Connected accounts" />
            <div className="mt-5 grid gap-3">
              {profile.platforms.length === 0 && (
                <EmptyPanel
                  title="No platforms connected"
                  body="Verified platform metrics will appear here after OAuth sync."
                />
              )}
              {profile.platforms.map(({ platform, latestMetrics }) => (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4" key={platform.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black capitalize">{platform.platform}</span>
                    <span className="text-xs text-white/38">
                      {platform.lastSyncedAt ? formatDate(platform.lastSyncedAt) : "Pending"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/42">@{platform.externalHandle}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniMetric label="Followers" value={formatNumber(latestMetrics?.followers ?? 0)} />
                    <MiniMetric label="Eng" value={`${Number(latestMetrics?.engagementRate ?? 0).toFixed(1)}%`} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#D85A30]/18 bg-[#D85A30]/8 p-5">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-[#ffb49c]" />
              <SectionHeader eyebrow="Brand action" title="Start outreach" />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/58">
              Use this profile as the source of truth for reach, niche fit, rate expectations, and public proof posts.
            </p>
            <Link
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#D85A30] text-sm font-black text-white transition hover:bg-[#c54f29]"
              href="/messages"
            >
              Draft message
            </Link>
          </article>
        </aside>
      </section>
    </main>
  );
}

async function getCreatorProfile(handle: string) {
  try {
    const caller = await createTRPCServerCaller();
    return await caller.creator.profile({ handle });
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
    posts: creatorPosts
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
    <Avatar
      className={`bg-gradient-to-br from-[#D85A30] via-[#f1a06d] to-purple-300 font-black text-black ${className ?? ""}`}
    >
      <AvatarFallback className="bg-transparent text-black">{initials(name)}</AvatarFallback>
      {openToCollabs && <AvatarBadge className="bg-emerald-400" />}
    </Avatar>
  );
}

function ProfileMetric({
  icon: Icon,
  label,
  value,
  highlighted = false
}: {
  icon: typeof Users;
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlighted ? "border-[#D85A30]/45 bg-[#D85A30]/10" : "border-white/10 bg-white/[0.04]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black tracking-[0.16em] text-white/35 uppercase">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-[#ffb49c]" : "text-white/34"}`} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.045] p-3">
      <span className="block text-[10px] font-black tracking-[0.14em] text-white/34 uppercase">{label}</span>
      <strong className="mt-1 block text-sm font-black text-white">{value}</strong>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/48">{body}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] leading-tight font-black tracking-[-0.04em] text-white">{title}</h2>
    </div>
  );
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
