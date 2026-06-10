"use client";

import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Gift,
  Image as ImageIcon,
  DollarSign,
  Eye,
  MessageSquare,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Video
} from "lucide-react";
import { TerraceFeedCard } from "@/components/features/feed/terrace-feed-card";
import { TerraceActionSearchBar } from "@/components/features/search/action-search-bar";
import { useAppRole } from "@/components/layouts/app-shell";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { AttractButton } from "@/components/ui/attract-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  campaigns as seedCampaigns,
  influencers as seedInfluencers,
  type Campaign,
  type Influencer,
  type Platform
} from "@/data/marketplace";
import { formatNumber, scoreInfluencer, suggestRate } from "@/lib/agents";
import { buildComposerPayload, validateComposerDraft, type ComposerDraft } from "@/lib/feed/composer";
import { buildFeedDashboardData } from "@/lib/feed/dashboard-data";
import { trpc } from "@/lib/trpc/client";

const initialCreator = seedInfluencers.find((creator) => creator.id === "sara") ?? seedInfluencers[0];
const initialCampaign = seedCampaigns.find((campaign) => campaign.id === "glossier-summer") ?? seedCampaigns[0];

const platformTone: Record<Platform, string> = {
  Instagram: "border-[#f3d5c4] bg-[#faf0ea] text-[#e08550]",
  TikTok: "border-[#d6eaf8] bg-[#edf8ff] text-[#2f83b7]",
  YouTube: "border-[#e9e9e7] bg-[#ffffff] text-[#787774]",
  LinkedIn: "border-[#e9e9e7] bg-[#ffffff] text-[#787774]"
};

const seededPosts: VisualPost[] = [
  {
    id: "seed-youtube-house-tour",
    creator: seedInfluencers[0],
    authorType: "creator",
    brandName: null,
    type: "content_drop",
    body: "Heyy, just posted a new YouTube video showing my apartment setup and daily routine. Check it out, brands kept asking how my audience uses home content.",
    metric: "248K views",
    visual: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    accent: "#8CC9E8",
    mediaLabel: "YouTube",
    social: {
      source: "youtube",
      externalUrl: "https://youtube.com",
      mediaType: "video",
      title: "House tour, morning routine, and creator setup",
      thumbnailUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      stats: { views: 248000, likes: 18400, comments: 921 }
    }
  },
  {
    id: "seed-instagram-collab",
    creator: seedInfluencers[1],
    authorType: "creator",
    brandName: null,
    type: "collab",
    body: "Heyy, just dropped a collab with Glossier on Instagram. The reel is live now, please check it out and tell me what you think.",
    metric: "8.4% engagement",
    visual: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    accent: "#e08550",
    mediaLabel: "Instagram",
    social: {
      source: "instagram",
      externalUrl: "https://instagram.com",
      mediaType: "reel",
      title: "Glossier summer routine collab",
      thumbnailUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      stats: { views: 910000, likes: 73500, comments: 2100 }
    }
  },
  {
    id: "seed-tiktok-reel",
    creator: seedInfluencers[2],
    authorType: "creator",
    brandName: null,
    type: "content_drop",
    body: "Posted a quick TikTok reel testing three airport outfits. Fashion brands, this one is already getting saves from women 25-30.",
    metric: "42K saves",
    visual: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    accent: "#F5B38E",
    mediaLabel: "TikTok",
    social: {
      source: "tiktok",
      externalUrl: "https://tiktok.com",
      mediaType: "short",
      title: "Three airport outfits people actually save",
      thumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      stats: { views: 620000, likes: 88400, comments: 3200 }
    }
  },
  {
    id: "seed-open-collab",
    creator: seedInfluencers[3],
    authorType: "creator",
    brandName: null,
    type: "open_to_work",
    body: "Opening two May slots for food and wellness brands. Strongest audience: young professionals who buy after seeing simple recipe demos.",
    metric: "$1.8K avg rate",
    visual: "https://images.unsplash.com/photo-1556228724-4c6c1b305c35?auto=format&fit=crop&w=1200&q=80",
    accent: "#e08550",
    mediaLabel: "Open"
  }
];

type SocialEmbed = {
  source: "instagram" | "tiktok" | "youtube";
  externalUrl: string;
  mediaType: string;
  title: string | null;
  thumbnailUrl?: string;
  stats: { views?: number; likes?: number; comments?: number };
};

type VisualPost = {
  id: string;
  creator: Influencer;
  authorType: "creator" | "brand" | string;
  brandName: string | null;
  type: string;
  body: string;
  metric: string;
  visual?: string;
  accent: string;
  mediaLabel: string;
  social?: SocialEmbed;
};

export default function FeedPage() {
  const role = useAppRole();
  const [clientHost, setClientHost] = useState<string | null>(null);

  useEffect(() => {
    setClientHost(window.location.hostname);
  }, []);

  // Writes still require a real (non-localhost) auth context. Reads are public
  // procedures, so we run them as soon as the client hydrates — including on
  // localhost — so the feed shows live DB content (synced social posts, etc.)
  // instead of the static demo fallback.
  const remoteQueriesEnabled = clientHost !== null && !["127.0.0.1", "localhost"].includes(clientHost);
  const liveReadsEnabled = clientHost !== null;
  const creatorQuery = trpc.creator.list.useQuery({ limit: 20 }, { enabled: liveReadsEnabled, retry: false });
  const postQuery = trpc.post.list.useQuery({ limit: 12 }, { enabled: liveReadsEnabled, retry: false });
  const trpcUtils = trpc.useUtils();
  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: async () => {
      await Promise.all([trpcUtils.post.list.invalidate(), trpcUtils.creator.list.invalidate()]);
    }
  });

  const feedData = buildFeedDashboardData({
    creatorData: creatorQuery.data,
    postData: postQuery.data,
    creatorsLoading: creatorQuery.isLoading,
    postsLoading: postQuery.isLoading,
    creatorsError: creatorQuery.isError,
    postsError: postQuery.isError,
    fallbackCreators: seedInfluencers
  });

  const creators = feedData.creators;
  const [query, setQuery] = useState("");
  const [activeStream, setActiveStream] = useState("all");
  const [localPosts, setLocalPosts] = useState<VisualPost[]>([]);
  const [localPostStatus, setLocalPostStatus] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Influencer>(initialCreator);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const filteredCreators = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return creators
      .filter((creator) => {
        if (!normalized) return true;
        return `${creator.name} ${creator.handle} ${creator.niche} ${creator.city} ${creator.audience}`
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => getMatchScore(b, initialCampaign) - getMatchScore(a, initialCampaign));
  }, [creators, query]);

  const livePosts = useMemo<VisualPost[]>(() => {
    return feedData.posts.map((post, index) => {
      const matchedCreator = creators.find((creator) => creator.id === post.authorId) ?? initialCreator;
      const firstMedia = Array.isArray(post.mediaJson) ? post.mediaJson[0] : null;
      const externalUrl =
        firstMedia && typeof firstMedia === "object" && "url" in firstMedia && typeof firstMedia.url === "string"
          ? firstMedia.url
          : null;

      // Synced social post — build the embed from source + mediaJson payload.
      const isSocial = post.source === "instagram" || post.source === "tiktok" || post.source === "youtube";
      const social: SocialEmbed | undefined =
        isSocial && post.externalUrl
          ? {
              source: post.source as SocialEmbed["source"],
              externalUrl: post.externalUrl,
              mediaType:
                firstMedia && typeof firstMedia === "object" && typeof firstMedia.mediaType === "string"
                  ? firstMedia.mediaType
                  : "post",
              title:
                firstMedia && typeof firstMedia === "object" && typeof firstMedia.title === "string"
                  ? firstMedia.title
                  : null,
              thumbnailUrl: externalUrl ?? undefined,
              stats:
                firstMedia && typeof firstMedia === "object" && firstMedia.stats && typeof firstMedia.stats === "object"
                  ? (firstMedia.stats as SocialEmbed["stats"])
                  : {}
            }
          : undefined;

      return {
        id: post.id,
        creator: matchedCreator,
        authorType: post.authorType,
        brandName: post.authorType === "brand" ? "Brand team" : null,
        type: post.type,
        body: post.body,
        metric: social ? metricForSocial(social) : metricForPost(post.type, matchedCreator),
        visual: externalUrl ?? undefined,
        accent: index % 3 === 1 ? "#8CC9E8" : index % 3 === 2 ? "#F5B38E" : "#e08550",
        mediaLabel: social ? sourceLabel(social.source) : labelForPost(post.type),
        social
      };
    });
  }, [creators, feedData.posts]);

  const visiblePosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sourcePosts = [...localPosts, ...(livePosts.length > 0 ? livePosts : seededPosts)];

    return sourcePosts.filter((post) => {
      const matchesStream =
        activeStream === "all" ||
        activeStream === "following" ||
        (activeStream === "collabs" && post.type === "collab") ||
        (activeStream === "videos" && post.social?.source === "youtube") ||
        (activeStream === "reels" && (post.social?.source === "instagram" || post.social?.source === "tiktok")) ||
        (activeStream === "drops" && (post.type === "content_drop" || Boolean(post.social))) ||
        (activeStream === "briefs" && post.authorType === "brand") ||
        (activeStream === "open" && post.type === "open_to_work");
      if (!matchesStream) return false;
      if (!normalized) return true;
      return `${post.creator.name} ${post.creator.handle} ${post.brandName ?? ""} ${post.type} ${post.body}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [activeStream, livePosts, localPosts, query]);

  function openCreatorProfile(creator: Influencer) {
    setSelectedCreator(creator);
    setIsProfileOpen(true);
  }

  return (
    <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <main className="min-h-screen bg-white font-sans text-[#37352f]">
        <VisualFeed
          activeStream={activeStream}
          creators={filteredCreators}
          isPosting={remoteQueriesEnabled && createPostMutation.isPending}
          onOpenCreator={openCreatorProfile}
          onPostSubmit={async (draft) => {
            setLocalPostStatus(null);
            if (!remoteQueriesEnabled) {
              const now = Date.now();
              setLocalPosts((current) => [
                {
                  accent:
                    draft.type === "content_drop" ? "#8CC9E8" : draft.type === "open_to_work" ? "#F5B38E" : "#e08550",
                  authorType: "creator",
                  body: draft.body,
                  brandName: null,
                  creator: initialCreator,
                  id: `local-${now}`,
                  mediaLabel: labelForPost(draft.type),
                  metric: metricForPost(draft.type, initialCreator),
                  type: draft.type,
                  visual:
                    draft.type === "content_drop" && draft.sourceUrl?.startsWith("http")
                      ? draft.sourceUrl
                      : draft.type === "content_drop"
                        ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                        : undefined
                },
                ...current
              ]);
              setLocalPostStatus("Post published in the local demo feed.");
              return;
            }
            await createPostMutation.mutateAsync(buildComposerPayload(draft));
          }}
          onStreamSelect={setActiveStream}
          posts={visiblePosts}
          query={query}
          role={role}
          setQuery={setQuery}
          status={
            localPostStatus ??
            (createPostMutation.isError
              ? createPostMutation.error.message
              : createPostMutation.isSuccess
                ? "Post published."
                : null)
          }
        />
        <CreatorProfileSheet creator={selectedCreator} campaign={initialCampaign} role={role} />
      </main>
    </Sheet>
  );
}

function VisualFeed({
  activeStream,
  creators,
  isPosting,
  onOpenCreator,
  onPostSubmit,
  onStreamSelect,
  posts,
  query,
  role,
  setQuery,
  status
}: {
  activeStream: string;
  creators: Influencer[];
  isPosting: boolean;
  onOpenCreator: (creator: Influencer) => void;
  onPostSubmit: (draft: ComposerDraft) => Promise<void>;
  onStreamSelect: (stream: string) => void;
  posts: VisualPost[];
  query: string;
  role: "creator" | "brand";
  setQuery: (query: string) => void;
  status: string | null;
}) {
  const streams = [
    { id: "all", label: "For you", count: 128, icon: Radio },
    { id: "following", label: "Following", count: 38, icon: Users },
    { id: "collabs", label: "Collabs", count: 14, icon: BriefcaseBusiness },
    { id: "videos", label: "YouTube", count: 22, icon: Video },
    { id: "reels", label: "Reels", count: 31, icon: ImageIcon },
    { id: "open", label: "Open to collab", count: 9, icon: Eye }
  ];

  return (
    <section className="terrace-app-bg min-h-screen">
      <header className="terrace-topbar sticky top-0 z-40 hidden border-b md:block">
        <div className="mx-auto flex max-w-[1220px] items-center gap-4 px-5 py-3">
          <div className="hidden min-w-[220px] lg:block">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9a8b83] uppercase">Home</p>
            <p className="mt-0.5 text-sm font-medium text-[#5f6672]">
              {role === "brand" ? "Creator proof and market signal" : "Following, posts, and creator drops"}
            </p>
          </div>
          <TerraceActionSearchBar
            className="mx-auto hidden max-w-[560px] md:block"
            onQueryChange={setQuery}
            query={query}
          />
          <div className="ml-auto flex items-center gap-2 text-[#787774]">
            <Link
              className="grid h-10 w-10 place-items-center rounded-[13px] border border-[#dedfe3] bg-[#fbfbfc] shadow-[0_1px_1px_rgba(17,24,39,0.04)] transition hover:bg-white"
              aria-label="Notifications"
              href="/notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              className="grid h-10 w-10 place-items-center rounded-[13px] border border-[#dedfe3] bg-[#fbfbfc] shadow-[0_1px_1px_rgba(17,24,39,0.04)] transition hover:bg-white"
              aria-label="Messages"
              href="/messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
            <span
              className="grid h-10 w-10 place-items-center rounded-[13px] bg-[linear-gradient(135deg,#cad7de,#edbda6)] shadow-[inset_0_0_0_1px_rgba(17,24,39,0.08)]"
              aria-hidden
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1220px] gap-5 px-0 py-0 sm:px-5 sm:py-5 xl:grid-cols-[minmax(0,680px)_320px]">
        <main className="min-w-0">
          <StoryRail creators={creators} onOpenCreator={onOpenCreator} />

          <div className="creatorlink-animate-in">
            <FeedComposer isPosting={isPosting} onSubmit={onPostSubmit} status={status} />
          </div>

          <nav
            className="terrace-panel mt-3 flex gap-1.5 overflow-x-auto rounded-none border-x-0 p-1.5 sm:rounded-[18px] sm:border-x"
            aria-label="Feed filters"
          >
            {streams.map((stream) => {
              const active = activeStream === stream.id;
              const Icon = stream.icon;
              return (
                <button
                  className={`inline-flex shrink-0 items-center gap-2 rounded-[13px] px-3 py-2 text-sm font-semibold transition duration-150 active:scale-[0.98] ${
                    active ? "bg-[#1d1d1f] text-[#fbfbfc]" : "text-[#667085] hover:bg-white hover:text-[#1d1d1f]"
                  }`}
                  key={stream.id}
                  onClick={() => onStreamSelect(stream.id)}
                  type="button"
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[#f7a777]" : "text-[#98a2b3]"}`} />
                  {stream.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/10 text-[#fbfcfd]" : "bg-[#f1f4f7] text-[#98a2b3]"}`}
                  >
                    {stream.count}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-3 grid gap-3.5 sm:mt-4">
            {posts.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#e1e1de] bg-white p-10 text-center">
                <p className="text-sm font-semibold">No posts match this section.</p>
                <p className="mt-1 text-xs text-[#787774]">Try another feed section or search term.</p>
              </div>
            )}
            {posts.map((post, index) => (
              <div
                className="creatorlink-animate-in"
                key={post.id}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
              >
                <TerraceFeedCard
                  accent={post.accent}
                  authorHandle={
                    post.authorType === "brand"
                      ? cleanHandle(post.brandName ?? "brand")
                      : cleanHandle(post.creator.handle)
                  }
                  authorMeta={
                    post.authorType === "brand" ? "Brand team" : `${post.creator.niche} creator · ${post.creator.city}`
                  }
                  authorName={post.authorType === "brand" ? (post.brandName ?? "Brand") : post.creator.name}
                  avatarFallback={
                    post.authorType === "brand" ? initials(post.brandName ?? "Brand") : initials(post.creator.name)
                  }
                  brief={
                    post.authorType === "brand"
                      ? {
                          description: initialCampaign.goal,
                          meta: [initialCampaign.budgetRange, initialCampaign.timeline],
                          title: initialCampaign.title
                        }
                      : undefined
                  }
                  content={[post.body]}
                  imageUrl={post.authorType === "brand" ? undefined : post.visual}
                  label={post.mediaLabel}
                  metric={post.metric}
                  social={post.social}
                  onAuthorClick={() => onOpenCreator(post.creator)}
                  reply={
                    post.type === "milestone"
                      ? {
                          authorHandle: "glossier",
                          authorName: "Glossier",
                          avatarFallback: "G",
                          content: "This is the exact proof we look for before starting a launch conversation.",
                          timestamp: "1h",
                          verified: true
                        }
                      : undefined
                  }
                  timestamp="2h"
                  verified={post.creator.verified}
                />
              </div>
            ))}
          </div>
        </main>

        <aside className="hidden content-start gap-4 xl:sticky xl:top-24 xl:grid">
          {role === "brand" ? <BrandFeedInspector /> : <CreatorFeedPulse />}

          <section className="rounded-[24px] border border-[#dedfe3] bg-[#fbfbfc]/92 p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-[-0.03em]">
                {role === "brand" ? "Suggested creators" : "People to follow"}
              </h2>
              <Link className="text-sm text-[#787774] hover:text-[#37352f]" href="/search">
                See all
              </Link>
            </div>
            <div className="mt-4 divide-y divide-[#e9e9e7]">
              {creators.slice(1, 4).map((creator) => (
                <SuggestedCreatorRow key={creator.id} creator={creator} onOpenCreator={onOpenCreator} />
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#dedfe3] bg-[#fbfbfc]/92 p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04)] backdrop-blur-xl">
            <h2 className="text-base font-semibold tracking-[-0.03em]">
              {role === "brand" ? "Active briefs" : "Gigs for you"}
            </h2>
            <div className="mt-4 grid gap-5">
              {seedCampaigns.slice(0, 2).map((campaign, index) => (
                <Link className="block text-left" href={`/jobs/${campaign.id}`} key={campaign.id}>
                  <p className="text-sm font-semibold">
                    {index === 0 ? "Autumn skincare launch — 6 creators" : campaign.title}
                  </p>
                  <p className="mt-1 text-xs text-[#787774]">
                    {campaign.brand} · {campaign.budgetRange}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {(index === 0 ? ["Beauty", "Reel"] : ["Travel", "Video"]).map((tag) => (
                      <span
                        className="rounded-full border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-1 text-xs font-medium text-[#37352f]"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <p className="px-1 text-xs text-[#787774]">Privacy · Terms · Trust · About · © Terrace</p>
        </aside>
      </div>
    </section>
  );
}

function SuggestedCreatorRow({
  creator,
  onOpenCreator
}: {
  creator: Influencer;
  onOpenCreator: (creator: Influencer) => void;
}) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="flex w-full items-center gap-3 py-3">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => onOpenCreator(creator)}
        type="button"
      >
        <CreatorAvatar creator={creator} className="h-11 w-11 text-xs" showBadge />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {creator.name}
            {creator.verified ? <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-[#8CC9E8]" /> : null}
          </span>
          <span className="block truncate text-xs text-[#787774]">{creator.niche} · Lifestyle</span>
        </span>
      </button>
      <button
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150 active:scale-95 ${
          following
            ? "border-[#d6eaf8] bg-[#edf8ff] text-[#2f83b7]"
            : "border-[#e9e9e7] bg-white text-[#37352f] hover:border-[#f3d5c4] hover:text-[#e08550]"
        }`}
        onClick={() => setFollowing((current) => !current)}
        type="button"
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}

function StoryRail({
  creators,
  onOpenCreator
}: {
  creators: Influencer[];
  onOpenCreator: (creator: Influencer) => void;
}) {
  const visibleCreators = creators.slice(0, 8);

  return (
    <section className="terrace-panel overflow-hidden rounded-none border-x-0 border-t-0 px-3 py-2.5 sm:rounded-[22px] sm:border sm:px-4 sm:py-3">
      <div className="flex gap-3 overflow-x-auto pb-1 sm:gap-4 [&::-webkit-scrollbar]:hidden">
        {visibleCreators.map((creator) => (
          <button
            className="grid w-[58px] shrink-0 justify-items-center gap-1.5 text-center sm:w-[68px] sm:gap-2"
            key={creator.id}
            onClick={() => onOpenCreator(creator)}
            type="button"
          >
            <span className="terrace-story-ring grid h-14 w-14 place-items-center rounded-full p-1 sm:h-16 sm:w-16">
              <span className="grid h-full w-full place-items-center rounded-full bg-[linear-gradient(135deg,#edf8ff,#fff3ec)] text-xs font-semibold text-[#1d1d1f] sm:text-sm">
                {initials(creator.name)}
              </span>
            </span>
            <span className="w-full truncate text-[11px] font-medium text-[#5f6672] sm:text-xs">{creator.handle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DarkRailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#dedfe3] bg-white/72 px-3 py-2 text-sm">
      <span className="text-[#667085]">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BrandFeedInspector() {
  return (
    <section className="rounded-[24px] border border-[#dedfe3] bg-[#fbfbfc]/92 p-4 text-[#1d1d1f] shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.045)] backdrop-blur-xl">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d06b3f] uppercase">Inspector</p>
      <h2 className="mt-2 text-xl leading-tight font-semibold tracking-[-0.045em]">Beauty reels are moving fastest.</h2>
      <div className="mt-4 grid gap-2">
        <DarkRailMetric label="Views this month" value="4.3M" />
        <DarkRailMetric label="Avg engagement" value="8.4%" />
        <DarkRailMetric label="Fastest growth" value="+32%" />
      </div>
    </section>
  );
}

function CreatorFeedPulse() {
  return (
    <section className="rounded-[24px] border border-[#dedfe3] bg-[#fbfbfc]/92 p-4 text-[#1d1d1f] shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.045)] backdrop-blur-xl">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d06b3f] uppercase">Your feed</p>
      <h2 className="mt-2 text-xl leading-tight font-semibold tracking-[-0.045em]">Share what you posted today.</h2>
      <p className="mt-2 text-sm leading-6 text-[#667085]">
        Creator home is for posts, follows, replies, and gigs. Brand pricing and fit scores stay out of this view.
      </p>
      <div className="mt-4 grid gap-2">
        <DarkRailMetric label="New posts seen" value="18" />
        <DarkRailMetric label="Replies waiting" value="4" />
        <DarkRailMetric label="Gigs saved" value="3" />
      </div>
    </section>
  );
}

function FeedComposer({
  isPosting,
  onSubmit,
  status
}: {
  isPosting: boolean;
  onSubmit: (draft: ComposerDraft) => Promise<void>;
  status: string | null;
}) {
  const [draft, setDraft] = useState<ComposerDraft>({
    body: "",
    type: "update",
    visibility: "public",
    sourceUrl: ""
  });
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const validation = validateComposerDraft(draft);
  const visibleMessage = localMessage ?? status;

  async function submitComposer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextValidation = validateComposerDraft(draft);
    if (!nextValidation.ok) {
      setLocalMessage(nextValidation.message);
      return;
    }

    setLocalMessage(null);
    await onSubmit(draft);
    setDraft({ body: "", type: "update", visibility: "public", sourceUrl: "" });
    setExpanded(false);
  }

  return (
    <Panel className="p-3 sm:p-4">
      <button
        className={`flex w-full items-center gap-3 text-left sm:hidden ${expanded ? "hidden" : ""}`}
        onClick={() => setExpanded(true)}
        type="button"
      >
        <CreatorAvatar creator={initialCreator} className="h-9 w-9 text-xs ring-2 ring-white" showBadge />
        <span className="min-w-0 flex-1 rounded-full border border-[#dedfe3] bg-[#f8f8fa] px-4 py-2.5 text-sm text-[#98a2b3]">
          Share an update...
        </span>
      </button>

      <form className={`${expanded ? "grid" : "hidden"} gap-3 sm:grid sm:gap-4`} onSubmit={submitComposer}>
        <div className="flex items-start gap-3 sm:gap-3.5">
          <CreatorAvatar
            creator={initialCreator}
            className="h-9 w-9 text-xs ring-2 ring-white sm:h-11 sm:w-11 sm:text-sm sm:ring-4"
            showBadge
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
              <span className="text-[13px] font-semibold text-[#1d1d1f] sm:text-sm">Create post</span>
              <span className="rounded-full border border-[#dceff8] bg-[#f1faff] px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[#2b8fc4] uppercase">
                Public
              </span>
            </div>
            <textarea
              className="min-h-16 w-full resize-none rounded-[14px] border border-[#dedfe3] bg-[#f8f8fa] px-3 py-2.5 text-sm leading-5 text-[#1d1d1f] transition outline-none placeholder:text-[#98a2b3] focus:border-[#b9def0] focus:bg-white focus:shadow-[0_0_0_4px_rgba(140,201,232,0.14)] sm:min-h-20 sm:rounded-[16px] sm:px-4 sm:py-3 sm:text-[15px] sm:leading-6"
              onChange={(event) => {
                setLocalMessage(null);
                setDraft((current) => ({ ...current, body: event.target.value }));
              }}
              placeholder="Share a collab, reel, video, or update..."
              value={draft.body}
            />
            {draft.type === "content_drop" && (
              <input
                className="mt-3 h-11 w-full rounded-[16px] border border-[#e6e8ec] bg-white px-4 text-sm text-[#37352f] outline-none placeholder:text-[#9b9a97] focus:border-[#8CC9E8]"
                onChange={(event) => setDraft((current) => ({ ...current, sourceUrl: event.target.value }))}
                placeholder="Paste content URL"
                value={draft.sourceUrl}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-[#787774] sm:gap-2 sm:text-sm">
            <ComposerTypeButton
              active={draft.type === "update"}
              icon={ImageIcon}
              label="Post"
              onClick={() => setDraft((current) => ({ ...current, type: "update" }))}
            />
            <ComposerTypeButton
              active={draft.type === "content_drop"}
              icon={Video}
              label="Video/Reel"
              onClick={() => setDraft((current) => ({ ...current, type: "content_drop" }))}
            />
            <ComposerTypeButton
              active={draft.type === "job_share"}
              icon={Gift}
              label="Collab"
              onClick={() => setDraft((current) => ({ ...current, type: "job_share" }))}
            />
            <ComposerTypeButton
              active={draft.type === "open_to_work"}
              icon={Sparkles}
              label="Open to collab"
              onClick={() => setDraft((current) => ({ ...current, type: "open_to_work" }))}
            />
          </div>
          <AttractButton
            className="h-9 rounded-[12px] bg-[#1d1d1f] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(17,24,39,0.1)] hover:bg-[#333336] sm:h-10 sm:rounded-[14px] sm:px-5"
            disabled={isPosting || !validation.ok}
            particleCount={0}
            type="submit"
          >
            {isPosting ? "Posting..." : "Post"}
          </AttractButton>
          <button
            className="h-9 rounded-[12px] px-3 text-sm font-semibold text-[#787774] sm:hidden"
            onClick={() => setExpanded(false)}
            type="button"
          >
            Cancel
          </button>
        </div>
        {visibleMessage && <p className="text-xs font-medium text-[#787774]">{visibleMessage}</p>}
      </form>
    </Panel>
  );
}

function ComposerTypeButton({
  active,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-[11px] border px-2 py-1.5 transition sm:gap-2 sm:rounded-[12px] sm:px-2.5 ${
        active
          ? "border-[#f5d5c3] bg-[#fff3ec] text-[#e08550]"
          : "border-transparent hover:border-[#e6e8ec] hover:bg-[#f6f8fa] hover:text-[#37352f]"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      {label}
    </button>
  );
}

function CreatorProfileSheet({
  creator,
  campaign,
  role
}: {
  creator: Influencer;
  campaign: Campaign;
  role: "creator" | "brand";
}) {
  const rate = suggestRate(creator);
  const matchScore = getMatchScore(creator, campaign);
  const brandView = role === "brand";

  return (
    <SheetContent className="w-full overflow-y-auto border-[#e9e9e7] bg-white p-0 text-[#37352f] sm:max-w-xl">
      <div className="h-44 bg-[linear-gradient(135deg,rgba(159,201,228,0.55),rgba(226,138,119,0.28)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
      <div className="grid gap-5 px-6 pb-7">
        <SheetHeader className="-mt-12 text-left">
          <div className="flex items-end justify-between gap-4">
            <CreatorAvatar creator={creator} className="h-24 w-24 border-4 border-white text-2xl" showBadge />
            {brandView ? <MatchPill score={matchScore} /> : <FollowPill />}
          </div>
          <div className="pt-4">
            <SheetTitle className="font-sans text-3xl font-semibold tracking-[-0.045em] text-[#37352f]">
              {creator.name}
            </SheetTitle>
            <SheetDescription className="mt-2 text-sm text-[#787774]">
              {creator.niche} · {creator.city} · {creator.audience}
            </SheetDescription>
          </div>
        </SheetHeader>

        <p className="text-sm leading-7 text-[#787774]">{creator.bio}</p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ProfileStat
            icon={Users}
            label={brandView ? "Reach" : "Followers"}
            value={formatNumber(creator.totalReach)}
          />
          <ProfileStat icon={TrendingUp} label="Eng" value={`${creator.engagementRate}%`} />
          <ProfileStat
            icon={brandView ? DollarSign : ImageIcon}
            label={brandView ? "Rate" : "Posts"}
            value={brandView ? `$${shortCurrency(creator.rate)}` : String(Math.max(12, creator.campaignsCompleted * 4))}
          />
          <ProfileStat icon={BriefcaseBusiness} label="Deals" value={String(creator.campaignsCompleted)} />
        </div>

        <section className="grid gap-2">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9b9a97] uppercase">Platforms</p>
          {creator.socialAccounts.map((account) => (
            <div className="rounded-lg border border-[#e9e9e7] bg-[#ffffff] p-3" key={account.platform}>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${platformTone[account.platform]}`}
                >
                  {account.platform}
                </span>
                <span className="text-xs text-[#787774]">{account.engagementRate}% engagement</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{formatNumber(account.followers)} followers</p>
            </div>
          ))}
        </section>

        {brandView ? (
          <section className="rounded-xl border border-[#f3d5c4] bg-[#faf0ea] p-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#e08550] uppercase">Suggested range</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{rate.range}</p>
            <p className="mt-2 text-sm leading-6 text-[#7a513f]">{rate.reason}</p>
          </section>
        ) : (
          <section className="rounded-xl border border-[#dceff8] bg-[#f1faff] p-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#2b8fc4] uppercase">Creator activity</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.035em]">Recent posts, collabs, and social links.</p>
            <p className="mt-2 text-sm leading-6 text-[#315f76]">
              Creator accounts see public profile context here. Campaign fit, private rates, and buyer scores are only
              shown to brand workspaces.
            </p>
          </section>
        )}

        <SheetFooter className="gap-3 sm:flex-col">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button asChild className="h-11 rounded-full bg-[#37352f] text-white hover:bg-[#262420]">
              <Link href="/messages">{brandView ? "Message creator" : "Message"}</Link>
            </Button>
            <SheetClose asChild>
              <Button className="h-11 rounded-full border-[#e9e9e7]" variant="outline">
                Close
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <article
      className={`border-y border-[#dedfe3] bg-[#fbfbfc]/92 shadow-[0_1px_2px_rgba(17,24,39,0.035)] backdrop-blur-xl sm:rounded-[24px] sm:border sm:shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.045)] ${className}`}
    >
      {children}
    </article>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e9e9e7] bg-[#ffffff] p-3">
      <Icon className="h-4 w-4 text-[#e08550]" />
      <span className="mt-3 block text-[10px] font-semibold tracking-[0.14em] text-[#9b9a97] uppercase">{label}</span>
      <strong className="mt-1 block text-lg font-semibold tracking-[-0.04em]">{value}</strong>
    </div>
  );
}

function MatchPill({ score }: { score: number }) {
  return (
    <div className="grid h-12 w-14 shrink-0 place-items-center rounded-lg border border-[#e9e9e7] bg-white text-center text-[#e08550]">
      <strong className="text-base font-semibold tracking-[-0.04em]">{score}%</strong>
      <span className="-mt-2 text-[9px] font-bold tracking-[0.12em] uppercase opacity-70">match</span>
    </div>
  );
}

function FollowPill() {
  return (
    <div className="grid h-12 shrink-0 place-items-center rounded-full border border-[#dceff8] bg-[#f1faff] px-4 text-center text-[#2b8fc4]">
      <strong className="text-sm font-semibold tracking-[-0.02em]">Follow</strong>
    </div>
  );
}

function CreatorAvatar({
  creator,
  className,
  showBadge = false
}: {
  creator: Influencer;
  className?: string;
  showBadge?: boolean;
}) {
  return (
    <Avatar className={`bg-[linear-gradient(135deg,#9fc9e4,#e28a77)] font-semibold text-[#37352f] ${className ?? ""}`}>
      <AvatarFallback className="bg-transparent text-[#37352f]">{initials(creator.name)}</AvatarFallback>
      {showBadge && (
        <AvatarBadge className={creator.availability === "Available" ? "bg-emerald-400" : "bg-amber-400"} />
      )}
    </Avatar>
  );
}

function getMatchScore(creator: Influencer, campaign: Campaign) {
  return Math.min(100, scoreInfluencer(creator, campaign));
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function cleanHandle(value: string) {
  return value.replace(/^@+/, "").toLowerCase().replace(/\s+/g, "");
}

function labelForPost(type: string) {
  if (type === "content_drop") return "Drop";
  if (type === "open_to_work") return "Open";
  if (type === "job_share") return "Brief";
  if (type === "milestone") return "Proof";
  return "Update";
}

function sourceLabel(source: "instagram" | "tiktok" | "youtube") {
  if (source === "instagram") return "Instagram";
  if (source === "tiktok") return "TikTok";
  return "YouTube";
}

// Honest proof-signal chip for a synced social post: the platform's real
// view/like/comment count (never a fabricated engagement rate). Falls back to
// the platform name when no stats are present.
function metricForSocial(social: SocialEmbed) {
  const { views, likes, comments } = social.stats;
  if (views) return `${formatNumber(views)} views`;
  if (likes) return `${formatNumber(likes)} likes`;
  if (comments) return `${formatNumber(comments)} comments`;
  return sourceLabel(social.source);
}

function metricForPost(type: string, creator: Influencer) {
  if (type === "content_drop") return `${creator.engagementRate}% engagement`;
  if (type === "open_to_work") return `$${shortCurrency(creator.rate)} avg rate`;
  if (type === "milestone") return `${formatNumber(creator.totalReach)} reach`;
  if (type === "job_share") return "Hiring gig";
  return `${creator.campaignsCompleted} campaigns`;
}

function shortCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return String(value);
}
