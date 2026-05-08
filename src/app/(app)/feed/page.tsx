"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  DollarSign,
  Eye,
  Heart,
  MoreHorizontal,
  Radio,
  Search,
  Send,
  TrendingUp,
  Users
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
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
import {
  buildComposerPayload,
  feedPostTypes,
  validateComposerDraft,
  type ComposerDraft,
  type FeedPostType
} from "@/lib/feed/composer";
import { buildFeedDashboardData } from "@/lib/feed/dashboard-data";
import { trpc } from "@/lib/trpc/client";

const initialCreator = seedInfluencers.find((creator) => creator.id === "sara") ?? seedInfluencers[0];
const initialCampaign = seedCampaigns.find((campaign) => campaign.id === "glossier-summer") ?? seedCampaigns[0];

const platformTone: Record<Platform, string> = {
  Instagram: "border-primary/20 bg-primary/10 text-primary",
  TikTok: "border-accent/20 bg-accent/10 text-[#d7b9c5]",
  YouTube: "border-[#b58a72]/20 bg-[#b58a72]/10 text-[#d8b5a0]",
  LinkedIn: "border-border bg-muted/40 text-muted-foreground"
};

const seededPosts = seedInfluencers.slice(0, 4).map((creator, index) => ({
  id: `seed-social-${creator.id}`,
  creator,
  authorType: index === 3 ? "brand" : "creator",
  brandName: index === 3 ? "Glossier" : null,
  type: ["milestone", "content_drop", "open_to_work", "update"][index] ?? "update",
  body:
    index === 0
      ? "Just wrapped a launch sprint with 2.1M verified reach. The best comments were all asking for real routines, not polished ad reads."
      : index === 1
        ? "New content drop is live. Short-form product demos are still winning when the first three seconds show the actual result."
        : index === 2
          ? "Opening two May slots for beauty and wellness brands. Strong fit: routine-led launches, honest review formats, and usage rights that make sense."
          : "Brands keep asking for follower count. The better question is whether the audience already behaves like buyers.",
  metric:
    index === 0 ? "2.1M reach" : index === 1 ? "8.4% engagement" : index === 2 ? "$1.8K avg rate" : "24 campaigns",
  visual:
    index === 0
      ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
      : index === 1
        ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
        : index === 2
          ? "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1556228724-4c6c1b305c35?auto=format&fit=crop&w=1200&q=80",
  accent: index === 1 ? "#8CC9E8" : index === 2 ? "#F5B38E" : "#D86B3D",
  mediaLabel: index === 3 ? "Brief" : index === 1 ? "Drop" : index === 2 ? "Open" : "Proof"
}));

type SeededPost = (typeof seededPosts)[number];

export default function FeedPage() {
  const creatorQuery = trpc.creator.list.useQuery({ limit: 20 }, { retry: false });
  const postQuery = trpc.post.list.useQuery({ limit: 12 }, { retry: false });
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
  const [selectedPost, setSelectedPost] = useState<(typeof seededPosts)[number]>(seededPosts[0]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(initialCampaign);
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
      .sort((a, b) => getMatchScore(b, selectedCampaign) - getMatchScore(a, selectedCampaign));
  }, [creators, query, selectedCampaign]);

  const topCreators = filteredCreators.slice(0, 4);
  const visiblePosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return seededPosts.filter((post) => {
      const matchesStream =
        activeStream === "all" ||
        (activeStream === "proof" && ["milestone", "update"].includes(post.type)) ||
        (activeStream === "drops" && post.type === "content_drop") ||
        (activeStream === "briefs" && post.authorType === "brand") ||
        (activeStream === "open" && post.type === "open_to_work");
      if (!matchesStream) return false;
      if (!normalized) return true;
      return `${post.creator.name} ${post.creator.handle} ${post.brandName ?? ""} ${post.type} ${post.body}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [activeStream, query]);

  function openCreatorProfile(creator: Influencer) {
    setSelectedCreator(creator);
    setIsProfileOpen(true);
  }

  return (
    <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <main className="min-h-screen bg-[#f7f5f1] font-sans text-[#111318]">
        <header className="sticky top-0 z-40 border-b border-[#e6e1da] bg-[#fbfaf8]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1460px] items-center gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8a94a5] uppercase">Terrace network</p>
              <h1 className="font-sans text-lg font-semibold tracking-[-0.035em]">Proof feed</h1>
            </div>
            <label className="relative ml-auto hidden w-full max-w-md md:block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8a94a5]" />
              <input
                className="h-11 w-full rounded-2xl border border-[#e3e7ee] bg-[#f8fafc] pr-4 pl-11 text-sm text-[#111318] outline-none placeholder:text-[#8a94a5] focus:border-[#8CC9E8]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search creators, brands, niches..."
                value={query}
              />
            </label>
            <span className="hidden items-center gap-2 rounded-full border border-[#f3d5c4] bg-[#fff5ef] px-3 py-1.5 text-xs font-bold text-[#D86B3D] lg:flex">
              <span className="h-2 w-2 rounded-full bg-[#D86B3D]" />
              {feedData.label}
            </span>
          </div>
        </header>

        <section className="mx-auto grid max-w-[1240px] gap-0 px-4 py-4 xl:grid-cols-[minmax(420px,540px)_minmax(0,1fr)]">
          <FeedInboxList
            activeStream={activeStream}
            isPosting={createPostMutation.isPending}
            onOpenCreator={openCreatorProfile}
            onPostSubmit={async (draft) => {
              await createPostMutation.mutateAsync(buildComposerPayload(draft));
            }}
            onSelectPost={setSelectedPost}
            onStreamSelect={setActiveStream}
            posts={visiblePosts}
            selectedPostId={selectedPost.id}
            status={
              createPostMutation.isError
                ? createPostMutation.error.message
                : createPostMutation.isSuccess
                  ? "Post published."
                  : null
            }
          />

          <FeedDetail
            campaign={selectedCampaign}
            onCampaignSelect={setSelectedCampaign}
            onOpenCreator={openCreatorProfile}
            post={selectedPost}
            topCreators={topCreators}
          />
        </section>

        <CreatorProfileSheet creator={selectedCreator} campaign={selectedCampaign} />
      </main>
    </Sheet>
  );
}

function FeedInboxList({
  activeStream,
  isPosting,
  onOpenCreator,
  onPostSubmit,
  onSelectPost,
  onStreamSelect,
  posts,
  selectedPostId,
  status
}: {
  activeStream: string;
  isPosting: boolean;
  onOpenCreator: (creator: Influencer) => void;
  onPostSubmit: (draft: ComposerDraft) => Promise<void>;
  onSelectPost: (post: SeededPost) => void;
  onStreamSelect: (stream: string) => void;
  posts: SeededPost[];
  selectedPostId: string;
  status: string | null;
}) {
  const streams = [
    { id: "all", label: "All", count: 128, icon: Radio },
    { id: "proof", label: "Proof", count: 42, icon: BadgeCheck },
    { id: "drops", label: "Drops", count: 18, icon: Clapperboard },
    { id: "briefs", label: "Briefs", count: 12, icon: BriefcaseBusiness },
    { id: "open", label: "Open", count: 9, icon: Heart }
  ];

  return (
    <section className="rounded-[26px] border border-[#e5ded6] bg-white shadow-[0_18px_46px_rgba(17,24,39,0.05)] xl:max-h-[calc(100vh-104px)] xl:min-h-[calc(100vh-104px)] xl:overflow-y-auto xl:rounded-r-none">
      <div className="border-b border-[#eceff3] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-xl font-semibold tracking-[-0.04em]">Feed</h2>
            <p className="mt-1 text-xs text-[#8a94a5]">Proof, briefs, content drops, and collab signals.</p>
          </div>
          <div className="rounded-[14px] border border-[#e8ebef] bg-[#f8fafc] p-1">
            <button className="rounded-[10px] bg-white px-3 py-1.5 text-xs font-semibold shadow-sm" type="button">
              All
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-[#8a94a5]" type="button">
              Saved
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {streams.map((stream) => {
            const Icon = stream.icon;
            const active = activeStream === stream.id;
            return (
              <button
                className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-bold transition ${
                  active
                    ? "border-[#111318] bg-[#111318] text-white shadow-sm"
                    : "border-[#e8ebef] bg-[#f8fafc] text-[#687386] hover:border-[#d9dee8] hover:bg-white hover:text-[#111318]"
                }`}
                key={stream.id}
                onClick={() => onStreamSelect(stream.id)}
                type="button"
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-[#f5b38e]" : "text-[#8a94a5]"}`} />
                <span>{stream.label}</span>
                <span className={active ? "text-white/55" : "text-[#9aa3b2]"}>{stream.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-[#eceff3] p-4">
        <FeedComposer isPosting={isPosting} onSubmit={onPostSubmit} status={status} />
      </div>

      <div className="grid gap-2 p-3">
        {posts.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#d8dee8] bg-[#fbfcfd] p-6 text-center">
            <p className="text-sm font-semibold">No posts match this stream.</p>
            <p className="mt-1 text-xs text-[#8a94a5]">Try another stream or search term.</p>
          </div>
        )}
        {posts.map((post) => (
          <FeedListItem
            key={post.id}
            onOpenCreator={onOpenCreator}
            onSelect={() => onSelectPost(post)}
            post={post}
            selected={selectedPostId === post.id}
          />
        ))}
      </div>
    </section>
  );
}

function FeedListItem({
  onOpenCreator,
  onSelect,
  post,
  selected
}: {
  onOpenCreator: (creator: Influencer) => void;
  onSelect: () => void;
  post: SeededPost;
  selected: boolean;
}) {
  const author = post.authorType === "brand" ? post.brandName : post.creator.name;

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <div
      className={`rounded-[18px] border p-4 text-left transition ${
        selected
          ? "border-[#f3d5c4] bg-[#fff7f1] shadow-[0_14px_30px_rgba(216,107,61,0.10)]"
          : "border-transparent bg-white hover:border-[#e8ebef] hover:bg-[#fbfcfd]"
      }`}
      onClick={onSelect}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex gap-3">
        <CreatorAvatar creator={post.creator} className="h-10 w-10 text-xs" showBadge />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-[#111318]">{author}</span>
                {post.creator.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#D86B3D]" />}
              </div>
              <p className="mt-0.5 truncate text-xs text-[#8a94a5]">
                {post.authorType === "brand" ? "Brand brief" : `${post.creator.niche} creator`} · 2h
              </p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#D86B3D] shadow-sm">
              {post.mediaLabel}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#4b5565]">{post.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#e8ebef] bg-white px-2.5 py-1 text-xs font-semibold text-[#687386]">
              {post.metric}
            </span>
            <button
              className="rounded-full border border-[#e8ebef] bg-white px-2.5 py-1 text-xs font-semibold text-[#687386] hover:text-[#D86B3D]"
              onClick={(event) => {
                event.stopPropagation();
                onOpenCreator(post.creator);
              }}
              type="button"
            >
              View profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedDetail({
  campaign,
  onCampaignSelect,
  onOpenCreator,
  post,
  topCreators
}: {
  campaign: Campaign;
  onCampaignSelect: (campaign: Campaign) => void;
  onOpenCreator: (creator: Influencer) => void;
  post: SeededPost;
  topCreators: Influencer[];
}) {
  const author = post.authorType === "brand" ? post.brandName : post.creator.name;

  return (
    <section className="mt-4 rounded-[26px] border border-[#e5ded6] bg-[#fffdfa] shadow-[0_18px_46px_rgba(17,24,39,0.05)] xl:mt-0 xl:max-h-[calc(100vh-104px)] xl:min-h-[calc(100vh-104px)] xl:overflow-y-auto xl:rounded-l-none xl:border-l-0">
      <div className="flex h-14 items-center justify-between border-b border-[#ece6df] px-5">
        <div className="flex items-center gap-2 text-[#687386]">
          <button className="rounded-full p-2 hover:bg-[#f6f2ee]" type="button">
            <Bookmark className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 hover:bg-[#f6f2ee]" type="button">
            <Send className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 hover:bg-[#f6f2ee]" type="button">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <span className="rounded-full border border-[#f3d5c4] bg-[#fff5ef] px-3 py-1.5 text-xs font-bold text-[#D86B3D]">
          {post.type.replaceAll("_", " ")}
        </span>
      </div>

      <article className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <CreatorAvatar creator={post.creator} className="h-12 w-12 text-sm" showBadge />
            <div className="min-w-0">
              <button
                className="truncate text-base font-semibold hover:text-[#D86B3D]"
                onClick={() => onOpenCreator(post.creator)}
                type="button"
              >
                {author}
              </button>
              <p className="mt-1 text-sm text-[#8a94a5]">
                {post.authorType === "brand" ? "Brand team" : `${post.creator.handle} · ${post.creator.city}`}
              </p>
            </div>
          </div>
          <p className="shrink-0 text-xs font-semibold text-[#8a94a5]">Today, 9:00 AM</p>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-[#e8ebef] bg-white shadow-[0_14px_28px_rgba(17,24,39,0.045)]">
          <div className="h-60 bg-cover bg-center" style={{ backgroundImage: `url(${post.visual})` }} />
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a94a5] uppercase">Verified signal</p>
                <h3 className="mt-1 font-sans text-2xl font-semibold tracking-[-0.055em]">{post.metric}</h3>
              </div>
              <span className="rounded-full bg-[#eff9fd] px-3 py-1.5 text-xs font-bold text-[#3487ad]">
                {post.mediaLabel}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-[#303847]">{post.body}</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat label="Comments" value="18" />
          <MiniStat label="Saves" value="1.2K" />
          <MiniStat label="Replies" value="42" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button className="h-10 rounded-2xl bg-[#111318] px-5 text-white shadow-[0_10px_18px_rgba(17,19,24,0.12)] hover:bg-[#242833]">
            {post.authorType === "brand" ? "Apply to brief" : "Message"}
          </Button>
          <Button
            className="h-10 rounded-2xl border-[#e8ebef] bg-white text-[#111318] hover:bg-[#f8fafc]"
            variant="outline"
          >
            Save
          </Button>
        </div>
      </article>

      <div className="border-t border-[#ece6df] p-5">
        <SectionHeader eyebrow="Best matches" title={`For ${campaign.brand}`} />
        <div className="mt-3 grid gap-2">
          {seedCampaigns.slice(0, 2).map((item) => (
            <button
              className={`rounded-2xl border p-3 text-left transition ${
                campaign.id === item.id
                  ? "border-[#f3d5c4] bg-[#fff5ef]"
                  : "border-[#e8ebef] bg-white hover:bg-[#f8fafc]"
              }`}
              key={item.id}
              onClick={() => onCampaignSelect(item)}
              type="button"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-[#8a94a5]">{item.budgetRange}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          {topCreators.slice(0, 3).map((creator) => (
            <button
              className="flex items-center gap-3 rounded-2xl border border-[#e8ebef] bg-white p-3 text-left transition hover:bg-[#f8fafc]"
              key={creator.id}
              onClick={() => onOpenCreator(creator)}
              type="button"
            >
              <CreatorAvatar creator={creator} className="h-9 w-9 text-xs" showBadge />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{creator.name}</p>
                <p className="truncate text-xs text-[#8a94a5]">{creator.niche}</p>
              </div>
              <MatchPill score={getMatchScore(creator, campaign)} />
            </button>
          ))}
        </div>
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
  }

  return (
    <Panel className="p-4 sm:p-5">
      <form className="grid gap-4" onSubmit={submitComposer}>
        <div className="flex gap-4">
          <CreatorAvatar creator={initialCreator} className="h-11 w-11 text-sm" showBadge />
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#e8ebef] bg-[#f8fafc] px-3 py-1.5 text-xs font-bold text-[#687386]">
                Share to network
              </span>
              <span className="rounded-full border border-[#d8edf7] bg-[#eff9fd] px-3 py-1.5 text-xs font-bold text-[#3487ad]">
                Creator + brand feed
              </span>
            </div>
            <textarea
              className="min-h-20 w-full resize-none border-0 bg-transparent text-[15px] leading-7 text-[#111318] outline-none placeholder:text-[#8a94a5]"
              onChange={(event) => {
                setLocalMessage(null);
                setDraft((current) => ({ ...current, body: event.target.value }));
              }}
              placeholder="Share a creator win, content drop, open-collab signal, or brand brief..."
              value={draft.body}
            />
            {draft.type === "content_drop" && (
              <input
                className="mt-3 h-11 w-full rounded-2xl border border-[#e3e7ee] bg-[#f8fafc] px-4 text-sm text-[#111318] outline-none placeholder:text-[#8a94a5] focus:border-[#8CC9E8]"
                onChange={(event) => setDraft((current) => ({ ...current, sourceUrl: event.target.value }))}
                placeholder="Paste content URL"
                value={draft.sourceUrl}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceff3] pt-4">
          <div className="flex flex-wrap gap-2">
            {feedPostTypes.slice(0, 4).map((type) => {
              const isSelected = draft.type === type.value;
              return (
                <button
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? "border-[#f3d5c4] bg-[#fff5ef] text-[#D86B3D]"
                      : "border-[#e8ebef] bg-[#f8fafc] text-[#687386] hover:text-[#111318]"
                  }`}
                  key={type.value}
                  onClick={() => setDraft((current) => ({ ...current, type: type.value as FeedPostType }))}
                  type="button"
                >
                  {type.label}
                </button>
              );
            })}
          </div>
          <div className="mr-auto hidden items-center gap-2 text-[#8a94a5] sm:flex">
            <Camera className="h-4 w-4" />
            <Clapperboard className="h-4 w-4" />
            <Eye className="h-4 w-4" />
          </div>
          <Button
            className="h-11 rounded-2xl bg-[#111318] px-5 font-semibold text-white hover:bg-[#242833]"
            disabled={isPosting || !validation.ok}
            type="submit"
          >
            {isPosting ? "Posting..." : "Post"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {visibleMessage && <p className="text-xs font-bold text-[#687386]">{visibleMessage}</p>}
      </form>
    </Panel>
  );
}

function CreatorProfileSheet({ creator, campaign }: { creator: Influencer; campaign: Campaign }) {
  const rate = suggestRate(creator);
  const matchScore = getMatchScore(creator, campaign);

  return (
    <SheetContent className="border-border bg-background text-foreground w-full overflow-y-auto p-0 sm:max-w-xl">
      <div className="h-44 bg-[linear-gradient(135deg,rgba(216,90,48,0.22),rgba(31,28,26,0.72)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
      <div className="grid gap-5 px-6 pb-7">
        <SheetHeader className="-mt-12 text-left">
          <div className="flex items-end justify-between gap-4">
            <CreatorAvatar creator={creator} className="border-background h-24 w-24 border-4 text-2xl" showBadge />
            <MatchPill score={matchScore} />
          </div>
          <div className="pt-4">
            <SheetTitle className="text-foreground font-sans text-3xl font-black tracking-[-0.045em]">
              {creator.name}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mt-2 text-sm">
              {creator.niche} · {creator.city} · {creator.audience}
            </SheetDescription>
          </div>
        </SheetHeader>

        <p className="text-foreground/72 text-sm leading-7">{creator.bio}</p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ProfileStat icon={Users} label="Reach" value={formatNumber(creator.totalReach)} />
          <ProfileStat icon={TrendingUp} label="Eng" value={`${creator.engagementRate}%`} />
          <ProfileStat icon={DollarSign} label="Rate" value={`$${shortCurrency(creator.rate)}`} />
          <ProfileStat icon={BriefcaseBusiness} label="Deals" value={String(creator.campaignsCompleted)} />
        </div>

        <section className="grid gap-2">
          <p className="text-muted-foreground text-[11px] font-black tracking-[0.16em] uppercase">Platforms</p>
          {creator.socialAccounts.map((account) => (
            <div className="border-border bg-card/90 rounded-lg border p-3" key={account.platform}>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-black ${platformTone[account.platform]}`}
                >
                  {account.platform}
                </span>
                <span className="text-muted-foreground text-xs">{account.engagementRate}% engagement</span>
              </div>
              <p className="mt-2 text-sm font-black">{formatNumber(account.followers)} followers</p>
            </div>
          ))}
        </section>

        <section className="border-primary/18 bg-primary/8 rounded-lg border p-4">
          <p className="text-primary text-xs font-black tracking-[0.16em] uppercase">Suggested range</p>
          <p className="mt-2 text-2xl font-black tracking-[-0.045em]">{rate.range}</p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">{rate.reason}</p>
        </section>

        <SheetFooter className="gap-3 sm:flex-col">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button className="h-11 rounded-lg">Message creator</Button>
            <SheetClose asChild>
              <Button className="h-11 rounded-lg" variant="outline">
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
      className={`rounded-[24px] border border-[#e8ebef] bg-white shadow-[0_16px_42px_rgba(17,24,39,0.055)] ${className}`}
    >
      {children}
    </article>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#8a94a5] uppercase">{eyebrow}</p>
      <h2 className="mt-1 font-sans text-base font-semibold tracking-[-0.035em] text-[#111318]">{title}</h2>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8ebef] bg-white p-3">
      <span className="block text-[10px] font-semibold tracking-[0.14em] text-[#8a94a5] uppercase">{label}</span>
      <strong className="mt-1 block text-base font-semibold tracking-[-0.035em] text-[#111318]">{value}</strong>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="border-border bg-card/90 rounded-lg border p-3">
      <Icon className="text-primary h-4 w-4" />
      <span className="text-muted-foreground mt-3 block text-[10px] font-black tracking-[0.14em] uppercase">
        {label}
      </span>
      <strong className="mt-1 block text-lg font-black tracking-[-0.04em]">{value}</strong>
    </div>
  );
}

function MatchPill({ score }: { score: number }) {
  return (
    <div className="grid h-12 w-14 shrink-0 place-items-center rounded-2xl border border-[#f3d5c4] bg-[#fff5ef] text-center text-[#D86B3D]">
      <strong className="text-base font-semibold tracking-[-0.04em]">{score}%</strong>
      <span className="-mt-2 text-[9px] font-bold tracking-[0.12em] uppercase opacity-70">match</span>
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
    <Avatar className={`bg-[linear-gradient(135deg,#D85A30,#B9856B)] font-black text-[#171514] ${className ?? ""}`}>
      <AvatarFallback className="bg-transparent text-[#171514]">{initials(creator.name)}</AvatarFallback>
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

function shortCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return String(value);
}
