"use client";

import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Gift,
  Image as ImageIcon,
  DollarSign,
  Eye,
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
    { id: "all", label: "For you", icon: Radio },
    { id: "following", label: "Following", icon: Users },
    { id: "collabs", label: "Collabs", icon: BriefcaseBusiness },
    { id: "videos", label: "YouTube", icon: Video },
    { id: "reels", label: "Reels", icon: ImageIcon },
    { id: "open", label: "Open to collab", icon: Eye }
  ];

  return (
    <section className="min-h-screen bg-[#fbfbfa]">
      <div className="mx-auto grid max-w-[1200px] items-start gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_336px]">
        <main className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.03em]">
                <Greeting />
              </h1>
              <p className="mt-0.5 text-sm text-[#787774]">
                {role === "brand" ? "Creator proof, as it happens." : "Here's what the terrace is making."}
              </p>
            </div>
            <TerraceActionSearchBar className="w-full sm:w-[280px]" onQueryChange={setQuery} query={query} />
          </div>

          <StoryRail creators={creators} onOpenCreator={onOpenCreator} />

          <div className="creatorlink-animate-in mt-3">
            <FeedComposer isPosting={isPosting} onSubmit={onPostSubmit} status={status} />
          </div>

          <nav
            className="mt-3 flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg border border-[#e9e9e7] bg-white p-0.5 [&::-webkit-scrollbar]:hidden"
            aria-label="Feed filters"
          >
            {streams.map((stream) => {
              const active = activeStream === stream.id;
              return (
                <button
                  className={`relative shrink-0 rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                    active ? "text-[#1d1d1f]" : "text-[#787774] hover:text-[#37352f]"
                  }`}
                  key={stream.id}
                  onClick={() => onStreamSelect(stream.id)}
                  type="button"
                >
                  {active && (
                    <motion.span
                      className="absolute inset-0 rounded-[6px] bg-[#f1f1ef]"
                      layoutId="feed-stream-segment"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10">{stream.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-3 grid gap-3">
            {posts.length === 0 && (
              <div className="rounded-lg border border-[#e9e9e7] bg-white py-14 text-center">
                <p className="text-sm font-semibold">No posts match this section.</p>
                <p className="mt-1 text-xs text-[#9b9a97]">Try another section or search term.</p>
              </div>
            )}
            {posts.map((post, index) => (
              <div
                className="creatorlink-animate-in rounded-lg border border-[#e9e9e7] bg-white p-4 transition-colors duration-200 hover:border-[#dcdfe5] sm:p-5"
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

        <aside className="hidden min-w-0 xl:block">
          <div className="sticky top-[104px] grid content-start gap-3">
            <section className="rounded-lg border border-[#e9e9e7] bg-white p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">
                  {role === "brand" ? "Suggested creators" : "Suggested for you"}
                </h2>
                <Link className="text-xs font-medium text-[#787774] hover:text-[#37352f]" href="/search">
                  See all
                </Link>
              </div>
              <div className="mt-1 divide-y divide-[#f1f1ef]">
                {creators
                  .filter((creator) => creator.handle.replace(/^@/, "") !== "you" && creator.name !== "You")
                  .slice(0, 4)
                  .map((creator) => (
                    <SuggestedCreatorRow key={creator.id} creator={creator} onOpenCreator={onOpenCreator} />
                  ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#e9e9e7] bg-white p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">{role === "brand" ? "Active briefs" : "Gigs for you"}</h2>
                <Link className="text-xs font-medium text-[#787774] hover:text-[#37352f]" href="/jobs">
                  See all
                </Link>
              </div>
              <div className="mt-2 divide-y divide-[#f1f1ef]">
                {seedCampaigns.slice(0, 3).map((campaign, index) => (
                  <Link className="group block py-2.5 text-left" href={`/jobs/${campaign.id}`} key={campaign.id}>
                    <p className="text-[13px] font-semibold text-[#37352f] group-hover:underline">
                      {index === 0 ? "Autumn skincare launch — 6 creators" : campaign.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9b9a97]">
                      {campaign.brand} · {campaign.budgetRange}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#e9e9e7] bg-white p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">Niche leaders</h2>
                <Link className="text-xs font-medium text-[#787774] hover:text-[#37352f]" href="/ranks">
                  Ranks
                </Link>
              </div>
              <div className="mt-1 divide-y divide-[#f1f1ef]">
                {[...creators]
                  .filter((creator) => creator.handle.replace(/^@/, "") !== "you" && creator.name !== "You")
                  .sort((a, b) => b.totalReach - a.totalReach)
                  .slice(0, 3)
                  .map((creator, index) => (
                    <button
                      className="flex w-full items-center gap-3 py-2.5 text-left"
                      key={creator.id}
                      onClick={() => onOpenCreator(creator)}
                      type="button"
                    >
                      <span className="w-4 text-center text-[13px] font-semibold text-[#9b9a97]">{index + 1}</span>
                      <CreatorAvatar creator={creator} className="h-8 w-8 text-[10px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[#37352f]">{creator.name}</span>
                        <span className="block truncate text-xs text-[#9b9a97]">{creator.niche}</span>
                      </span>
                      <span className="text-xs font-semibold text-[#37352f] tabular-nums">
                        {formatNumber(creator.totalReach)}
                      </span>
                    </button>
                  ))}
              </div>
            </section>

            <p className="px-1 text-xs leading-6 text-[#c9c8c5]">Privacy · Terms · Trust · About · © Terrace</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Greeting() {
  // Resolved on the client so the server render can't mismatch the local hour.
  const [text, setText] = useState("Welcome back.");

  useEffect(() => {
    const hour = new Date().getHours();
    setText(hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.");
  }, []);

  return <>{text}</>;
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
    <div className="flex w-full items-center gap-3 py-2">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => onOpenCreator(creator)}
        type="button"
      >
        <CreatorAvatar creator={creator} className="h-9 w-9 text-[10px]" showBadge />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-[#37352f]">
            {creator.name}
            {creator.verified ? <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-[#8CC9E8]" /> : null}
          </span>
          <span className="block truncate text-xs text-[#9b9a97]">{creator.niche}</span>
        </span>
      </button>
      <button
        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150 active:scale-95 ${
          following
            ? "border-[#e9e9e7] bg-[#f7f7f5] text-[#787774]"
            : "border-[#e9e9e7] bg-white text-[#37352f] hover:border-[#37352f]"
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
    <section className="mt-4 rounded-lg border border-[#e9e9e7] bg-white px-3 py-2.5">
      <div className="flex gap-2.5 overflow-x-auto pb-0.5 sm:gap-3 [&::-webkit-scrollbar]:hidden">
        {visibleCreators.map((creator, index) => (
          <motion.button
            animate={{ opacity: 1, y: 0 }}
            className="grid w-[58px] shrink-0 justify-items-center gap-1.5 text-center sm:w-[68px] sm:gap-2"
            initial={{ opacity: 0, y: 14 }}
            key={creator.id}
            onClick={() => onOpenCreator(creator)}
            transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="terrace-story-ring grid h-12 w-12 place-items-center rounded-full p-[3px] sm:h-13 sm:w-13">
              <span className="grid h-full w-full place-items-center rounded-full bg-[linear-gradient(135deg,#edf8ff,#fff3ec)] text-[11px] font-semibold text-[#1d1d1f]">
                {initials(creator.name)}
              </span>
            </span>
            <span className="w-full truncate text-[11px] font-medium text-[#787774]">{creator.handle}</span>
          </motion.button>
        ))}
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
    <div className="rounded-lg border border-[#e9e9e7] bg-white p-4">
      <button
        className={`flex w-full items-center gap-3 text-left sm:hidden ${expanded ? "hidden" : ""}`}
        onClick={() => setExpanded(true)}
        type="button"
      >
        <CreatorAvatar creator={initialCreator} className="h-9 w-9 text-xs" showBadge />
        <span className="min-w-0 flex-1 py-2.5 text-[15px] text-[#9b9a97]">Share an update...</span>
      </button>

      <form className={`${expanded ? "grid" : "hidden"} gap-2 sm:grid`} onSubmit={submitComposer}>
        <div className="flex items-start gap-3">
          <CreatorAvatar creator={initialCreator} className="h-10 w-10 text-xs sm:h-11 sm:w-11 sm:text-sm" showBadge />
          <div className="min-w-0 flex-1">
            <textarea
              className="min-h-12 w-full resize-none border-0 bg-transparent pt-2.5 text-[15px] leading-6 text-[#1d1d1f] outline-none placeholder:text-[#9b9a97] sm:min-h-14"
              onChange={(event) => {
                setLocalMessage(null);
                setDraft((current) => ({ ...current, body: event.target.value }));
              }}
              placeholder="Share a collab, reel, video, or update..."
              value={draft.body}
            />
            {draft.type === "content_drop" && (
              <input
                className="mt-1 h-10 w-full rounded-full border border-[#f1f1ef] bg-[#fbfbfa] px-4 text-sm text-[#37352f] outline-none placeholder:text-[#9b9a97] focus:border-[#8CC9E8] focus:bg-white"
                onChange={(event) => setDraft((current) => ({ ...current, sourceUrl: event.target.value }))}
                placeholder="Paste content URL"
                value={draft.sourceUrl}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pl-[52px] sm:gap-3 sm:pl-[56px]">
          <div className="flex flex-wrap items-center gap-1 text-[13px] font-medium text-[#787774] sm:text-sm">
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
            className="h-9 rounded-full border-0 bg-[#1d1d1f] px-5 text-sm font-semibold text-white shadow-none transition-transform hover:scale-[1.04] hover:bg-[#333336] active:scale-[0.97] disabled:opacity-40"
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
    </div>
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
