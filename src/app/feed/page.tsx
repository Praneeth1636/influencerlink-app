"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  DollarSign,
  Heart,
  Layers3,
  MessageCircle,
  Radio,
  Repeat2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImagesBadge } from "@/components/ui/images-badge";
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
  conversations as seedConversations,
  influencers as seedInfluencers,
  type Campaign,
  type Conversation,
  type Influencer,
  type Platform
} from "@/data/marketplace";
import { campaignBrief, draftBrandOutreach, formatNumber, scoreInfluencer, suggestRate } from "@/lib/agents";
import {
  buildComposerPayload,
  feedPostTypes,
  validateComposerDraft,
  type ComposerDraft,
  type FeedPostType
} from "@/lib/feed/composer";
import { buildFeedDashboardData, type PostListOutput } from "@/lib/feed/dashboard-data";
import {
  addCommentState,
  addShareState,
  buildInitialInteractionState,
  toggleLikeState,
  type FeedInteractionState
} from "@/lib/feed/interactions";
import { trpc } from "@/lib/trpc/client";

const initialCreator = seedInfluencers.find((creator) => creator.id === "sara") ?? seedInfluencers[0];
const initialCampaign = seedCampaigns.find((campaign) => campaign.id === "glossier-summer") ?? seedCampaigns[0];

const platformTone: Record<Platform, string> = {
  Instagram: "bg-[#D85A30]/10 text-[#ffb49c] ring-[#D85A30]/25",
  TikTok: "bg-purple-400/10 text-purple-200 ring-purple-300/20",
  YouTube: "bg-rose-400/10 text-rose-200 ring-rose-300/20",
  LinkedIn: "bg-sky-400/10 text-sky-200 ring-sky-300/20"
};

const marketSignals = [
  "Routine-led creator concepts are beating polished product ads.",
  "Verified audience fit is closing briefs faster than follower count alone.",
  "Beauty brands are paying a premium for trusted mid-market creators."
];

export default function FeedPage() {
  const creatorQuery = trpc.creator.list.useQuery({ limit: 20 }, { retry: false });
  const postQuery = trpc.post.list.useQuery({ limit: 12 }, { retry: false });
  const feedData = buildFeedDashboardData({
    creatorData: creatorQuery.data,
    postData: postQuery.data,
    creatorsLoading: creatorQuery.isLoading,
    postsLoading: postQuery.isLoading,
    creatorsError: creatorQuery.isError,
    postsError: postQuery.isError,
    fallbackCreators: seedInfluencers
  });
  const creatorList: Influencer[] = feedData.creators;
  const campaignList: Campaign[] = seedCampaigns;
  const conversationList: Conversation[] = seedConversations;
  const [selectedCreatorId, setSelectedCreatorId] = useState(initialCreator.id);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(initialCampaign);
  const [query, setQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const loadState = feedData.label;
  const trpcUtils = trpc.useUtils();
  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: async () => {
      await Promise.all([trpcUtils.post.list.invalidate(), trpcUtils.creator.list.invalidate()]);
    }
  });

  const selectedCreator =
    creatorList.find((creator) => creator.id === selectedCreatorId) ?? creatorList[0] ?? initialCreator;

  const rankedCreators = useMemo(() => {
    return creatorList
      .filter((creator) =>
        `${creator.name} ${creator.niche} ${creator.city} ${creator.audience}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .sort((a, b) => getMatchScore(b, selectedCampaign) - getMatchScore(a, selectedCampaign));
  }, [creatorList, query, selectedCampaign]);

  const totalReach = creatorList.reduce((sum, creator) => sum + creator.totalReach, 0);
  const activeBudget = campaignList.reduce((sum, campaign) => sum + campaign.budget, 0);
  const avgEngagement = creatorList.length
    ? creatorList.reduce((sum, creator) => sum + creator.engagementRate, 0) / creatorList.length
    : 0;
  const bestMatch = rankedCreators[0] ?? selectedCreator;
  const bestMatchScore = getMatchScore(bestMatch, selectedCampaign);
  const selectedConversation =
    conversationList.find((conversation) => conversation.influencerId === selectedCreator.id) ??
    conversationList[0] ??
    seedConversations[0];
  const suggestedRate = suggestRate(selectedCreator);

  function openCreatorProfile(creator: Influencer) {
    setSelectedCreatorId(creator.id);
    setIsProfileOpen(true);
  }

  return (
    <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <main className="min-h-screen bg-[#080809] text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(216,90,48,0.16),transparent_28%),radial-gradient(circle_at_90%_8%,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_80%)] bg-[size:56px_56px] opacity-35" />

        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-5 py-4">
            <Link
              className="logoMark miniLogo shrink-0 bg-white/5 ring-1 ring-white/10"
              href="/feed"
              aria-label="InfluencerLink feed"
            >
              <span />
              <span />
              <span />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-black tracking-[0.24em] text-white/38 uppercase">InfluencerLink</p>
              <p className="hidden text-sm text-white/60 sm:block">Creator marketplace OS</p>
            </div>
            <label className="relative ml-auto hidden w-full max-w-[420px] md:block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/38" />
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pr-4 pl-11 text-sm text-white transition outline-none placeholder:text-white/35 focus:border-[#D85A30]/60 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#D85A30]/10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search creators, niches, audience..."
              />
            </label>
            <span className="hidden items-center gap-2 rounded-full border border-[#D85A30]/20 bg-[#D85A30]/10 px-3 py-2 text-xs font-bold text-[#ffb49c] lg:flex">
              <span className="h-2 w-2 rounded-full bg-[#D85A30] shadow-[0_0_18px_rgba(216,90,48,0.85)]" />
              {loadState}
            </span>
            <Link
              className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-[#D85A30]/35 hover:text-[#ffb49c] sm:block"
              href="/creator"
            >
              Creator portal
            </Link>
            <Link
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/62 transition hover:border-white/25 hover:text-white"
              href="/login"
            >
              Sign out
            </Link>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-7 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="order-2 grid content-start gap-5 lg:sticky lg:top-24 lg:order-none">
            <CreatorSidebarCard creator={selectedCreator} onOpen={() => openCreatorProfile(selectedCreator)} />

            <Panel className="p-4">
              <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Navigation</p>
              <div className="mt-4 grid gap-1">
                {[
                  ["Creators", "#creators", Users],
                  ["Campaigns", "#campaigns", Target],
                  ["Workspace", "#workspace", Layers3],
                  ["AI desk", "#assistant", Sparkles],
                  ["Creator portal", "/creator", BadgeCheck]
                ].map(([label, href, Icon]) => (
                  <a
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/58 transition hover:bg-white/[0.06] hover:text-white"
                    href={href as string}
                    key={label as string}
                  >
                    <Icon className="h-4 w-4 text-white/32" />
                    {label as string}
                  </a>
                ))}
              </div>
            </Panel>

            <Panel className="p-4" id="assistant">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#D85A30]/12 text-[#ffb49c] ring-1 ring-[#D85A30]/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">AI desk</p>
                  <h2 className="text-base font-black">Next action</h2>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#D85A30]/18 bg-[#D85A30]/8 p-4">
                <p className="text-sm font-bold text-[#ffb49c]">{selectedCreator.name}</p>
                <p className="mt-1 text-2xl font-black tracking-[-0.04em]">{suggestedRate.range}</p>
                <p className="mt-2 text-xs leading-5 text-white/50">{suggestedRate.reason}</p>
              </div>
            </Panel>

            <Panel className="overflow-hidden p-4">
              <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Creative assets</p>
              <div className="mt-4 flex justify-center">
                <ImagesBadge
                  text="Beauty launch board"
                  images={[
                    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=300&q=80"
                  ]}
                />
              </div>
            </Panel>

            <Panel className="p-4">
              <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Data layer</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${feedStateDot(feedData.state)}`} />
                  <p className="text-sm font-black">{feedData.label}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/48">{feedData.message}</p>
              </div>
            </Panel>
          </aside>

          <section className="order-1 grid min-w-0 gap-6 lg:order-none">
            <Panel className="overflow-hidden p-6 md:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full border-[#D85A30]/25 bg-[#D85A30]/10 px-3 py-1 text-[#ffb49c] hover:bg-[#D85A30]/10">
                  <Radio className="mr-2 h-3.5 w-3.5" />
                  Live creator market
                </Badge>
                <Badge className="rounded-full border-white/10 bg-white/[0.05] px-3 py-1 text-white/58 hover:bg-white/[0.05]">
                  {campaignList.length} active campaigns
                </Badge>
              </div>

              <div className="mt-6 max-w-5xl">
                <h1 className="text-[clamp(32px,5vw,68px)] leading-[0.96] font-black tracking-[-0.055em] text-white">
                  Creator campaigns, matched by verified influence.
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/55 md:text-base">
                  Discover creators, compare performance, and start brand collaborations from one focused marketplace
                  dashboard.
                </p>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-4">
                <StatBannerItem icon={Users} label="Marketplace reach" value={formatNumber(totalReach)} />
                <StatBannerItem icon={DollarSign} label="Open budget" value={`$${formatNumber(activeBudget)}`} />
                <StatBannerItem icon={TrendingUp} label="Avg engagement" value={`${avgEngagement.toFixed(1)}%`} />
                <StatBannerItem
                  icon={Zap}
                  label="Top match"
                  value={`${bestMatchScore}%`}
                  highlighted
                  sublabel={bestMatch.name}
                />
              </div>
            </Panel>

            <FeedComposer
              isPosting={createPostMutation.isPending}
              onSubmit={async (draft) => {
                await createPostMutation.mutateAsync(buildComposerPayload(draft));
              }}
              status={
                createPostMutation.isError
                  ? createPostMutation.error.message
                  : createPostMutation.isSuccess
                    ? "Post published to the live feed."
                    : null
              }
            />

            <section className="grid gap-4" id="campaigns">
              <SectionHeader eyebrow="Campaigns" title="Choose a brief to rank the marketplace." />
              <div className="grid gap-3 md:grid-cols-3">
                {campaignList.map((campaign) => {
                  const isSelected = campaign.id === selectedCampaign.id;
                  return (
                    <button
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#D85A30]/55 bg-[#D85A30]/10 shadow-[0_0_32px_rgba(216,90,48,0.11)]"
                          : "border-white/10 bg-white/[0.04] hover:border-white/24 hover:bg-white/[0.06]"
                      }`}
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-black tracking-[0.16em] text-white/35 uppercase">
                            {campaign.brand}
                          </p>
                          <h3 className="mt-2 text-base leading-tight font-black">{campaign.title}</h3>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${isSelected ? "bg-[#D85A30] text-white" : "bg-white/8 text-white/55"}`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="mt-3 min-h-10 text-[13px] leading-5 text-white/52">{campaign.goal}</p>
                      <div className="mt-4 flex items-center justify-between text-[13px]">
                        <span className="font-black text-[#ffb49c]">{campaign.budgetRange}</span>
                        <span className="text-white/38">{campaign.timeline}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4" id="creators">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <SectionHeader eyebrow="Creator discovery" title="Top matches for this campaign." />
                <label className="relative block md:hidden">
                  <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/38" />
                  <input
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pr-4 pl-11 text-sm text-white outline-none placeholder:text-white/35"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search creators..."
                  />
                </label>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {rankedCreators.map((creator) => (
                  <CreatorCard
                    campaign={selectedCampaign}
                    creator={creator}
                    key={creator.id}
                    onOpen={() => openCreatorProfile(creator)}
                  />
                ))}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <Panel className="p-5" id="workspace">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <SectionHeader eyebrow="Workspace" title={`${selectedCampaign.brand} campaign`} />
                  <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
                    {selectedCampaign.status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/55">{campaignBrief(selectedCampaign)}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selectedCampaign.deliverables.map((deliverable) => (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={deliverable.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-white/72">{deliverable.title}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-black ${statusTone(deliverable.status)}`}
                        >
                          {deliverable.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="p-5" id="messages">
                <div className="flex items-center justify-between">
                  <SectionHeader eyebrow="Inbox" title="Brand thread" />
                  <MessageCircle className="h-5 w-5 text-white/35" />
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-black">{selectedConversation.brand}</p>
                  <p className="mt-1 text-xs text-white/38">{selectedConversation.subject}</p>
                  <p className="mt-4 text-sm leading-6 text-white/56">{selectedConversation.lastMessage}</p>
                </div>
                <div className="mt-4 grid gap-2">
                  {marketSignals.map((signal) => (
                    <p
                      className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[13px] leading-5 text-white/52"
                      key={signal}
                    >
                      {signal}
                    </p>
                  ))}
                </div>
              </Panel>
            </section>

            <Panel className="p-5" id="live-feed">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <SectionHeader eyebrow="Feed API" title="Live posts from tRPC." />
                <Badge className="rounded-full bg-white/8 text-white/58 hover:bg-white/8">
                  {feedData.posts.length} posts
                </Badge>
              </div>
              <div className="mt-4 grid gap-3">
                {feedData.state === "loading" && (
                  <FeedStateCard title="Loading live feed" body="Pulling posts through TanStack Query." />
                )}
                {feedData.state === "offline" && (
                  <FeedStateCard title="Feed API unavailable" body="Check DATABASE_URL and the tRPC route locally." />
                )}
                {feedData.state === "empty" && (
                  <FeedStateCard
                    title="No database posts yet"
                    body="Run the seed script once Phase 2 seed data lands."
                  />
                )}
                {feedData.state === "live" &&
                  feedData.posts.map((post) => <LiveFeedPostCard key={post.id} post={post} />)}
              </div>
            </Panel>
          </section>
        </section>

        <CreatorProfileSheet creator={selectedCreator} campaign={selectedCampaign} />
      </main>
    </Sheet>
  );
}

function CreatorSidebarCard({ creator, onOpen }: { creator: Influencer; onOpen: () => void }) {
  return (
    <button
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] text-left shadow-2xl shadow-black/10 transition hover:border-[#D85A30]/35 hover:bg-white/[0.06]"
      onClick={onOpen}
    >
      <div className="h-24 bg-[linear-gradient(135deg,rgba(216,90,48,0.46),rgba(168,85,247,0.22)),url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center" />
      <div className="p-5 pt-0">
        <CreatorAvatar creator={creator} className="-mt-9 h-20 w-20 border-4 border-[#111113] text-xl" showBadge />
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.04em]">{creator.name}</h2>
            <p className="mt-1 text-sm text-white/48">
              {creator.niche} · {creator.city}
            </p>
          </div>
          {creator.verified && <BadgeCheck className="h-5 w-5 text-[#ffb49c]" />}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat label="Reach" value={formatNumber(creator.totalReach)} />
          <MiniStat label="Deals" value={String(creator.campaignsCompleted)} />
          <MiniStat label="Rate" value={`$${shortCurrency(creator.rate)}`} />
        </div>
      </div>
    </button>
  );
}

function CreatorCard({ creator, campaign, onOpen }: { creator: Influencer; campaign: Campaign; onOpen: () => void }) {
  const score = getMatchScore(creator, campaign);
  const tier = matchTier(score);
  return (
    <article
      className={`rounded-2xl border bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06] ${tier.card}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <CreatorAvatar
            creator={creator}
            className="h-14 w-14 text-base ring-4 ring-white/8"
            showBadge={creator.availability === "Available"}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-black tracking-[-0.035em]">{creator.name}</h3>
              {creator.verified && (
                <Badge className="rounded-full bg-white/8 text-white/62 hover:bg-white/8">Verified</Badge>
              )}
            </div>
            <p className="mt-1 text-[13px] text-white/45">
              {creator.handle} · {creator.niche} · {creator.city}
            </p>
          </div>
        </div>
        <MatchPill score={score} />
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-[13px] leading-5 text-white/55">{creator.bio}</p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <MiniStat label="Reach" value={formatNumber(creator.totalReach)} />
        <MiniStat label="Views" value={formatNumber(creator.avgViews)} />
        <MiniStat label="Eng" value={`${creator.engagementRate}%`} />
        <MiniStat label="Rate" value={`$${shortCurrency(creator.rate)}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {creator.platforms.map((platform) => (
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-black ring-1 ${platformTone[platform]}`}
            key={platform}
          >
            {platform}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
        <span className="text-xs leading-5 font-bold text-white/38">{creator.audience}</span>
        <Button className={`h-10 rounded-xl px-4 text-sm font-black ${tier.button}`} onClick={onOpen}>
          Open profile
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function LiveFeedPostCard({ post }: { post: PostListOutput[number] }) {
  const [interaction, setInteraction] = useState<FeedInteractionState>(() => buildInitialInteractionState(post.id));
  const [commentDraft, setCommentDraft] = useState("");
  const [shareDraft, setShareDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const likeMutation = trpc.post.like.useMutation();
  const unlikeMutation = trpc.post.unlike.useMutation();
  const commentMutation = trpc.post.comment.useMutation();
  const shareMutation = trpc.post.share.useMutation();
  const isBusy =
    likeMutation.isPending || unlikeMutation.isPending || commentMutation.isPending || shareMutation.isPending;

  async function handleLike() {
    const wasLiked = interaction.liked;
    setInteraction((current) => toggleLikeState(current));
    setStatus(null);

    try {
      if (wasLiked) {
        await unlikeMutation.mutateAsync({ postId: post.id });
      } else {
        await likeMutation.mutateAsync({ postId: post.id });
      }
    } catch {
      setInteraction((current) => toggleLikeState(current));
      setStatus("Sign in to like posts.");
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = commentDraft.trim();

    if (!body) {
      setStatus("Write a comment first.");
      return;
    }

    setInteraction((current) => addCommentState(current));
    setCommentDraft("");
    setStatus(null);

    try {
      await commentMutation.mutateAsync({ postId: post.id, body });
      setStatus("Comment added.");
    } catch {
      setInteraction((current) => ({ ...current, commentCount: Math.max(0, current.commentCount - 1) }));
      setCommentDraft(body);
      setStatus("Sign in to comment.");
    }
  }

  async function handleShare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = shareDraft.trim();

    setInteraction((current) => addShareState(current));
    setShareDraft("");
    setStatus(null);

    try {
      await shareMutation.mutateAsync({ postId: post.id, body: body || undefined });
      setStatus("Shared to your network.");
    } catch {
      setInteraction((current) => ({ ...current, shareCount: Math.max(0, current.shareCount - 1) }));
      setShareDraft(body);
      setStatus("Sign in to share posts.");
    }
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/18 hover:bg-white/[0.055]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">{post.authorType}</Badge>
          <span className="text-xs font-bold text-white/35">{formatPostType(post.type)}</span>
        </div>
        <span className="text-xs font-bold text-white/32">{formatPostTime(post.createdAt)}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/68">{post.body}</p>

      {post.mediaJson.length > 0 && (
        <div className="mt-4 grid gap-2">
          {post.mediaJson.map((item, index) => (
            <a
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-[#ffb49c] transition hover:border-[#D85A30]/35"
              href={typeof item.url === "string" ? item.url : "#"}
              key={`${post.id}-${index}`}
              rel="noreferrer"
              target="_blank"
            >
              {typeof item.url === "string" ? item.url : "Attached media"}
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <InteractionButton active={interaction.liked} disabled={isBusy} label="Like post" onClick={handleLike}>
          <Heart className={`h-4 w-4 ${interaction.liked ? "fill-current" : ""}`} />
          {interaction.likeCount}
        </InteractionButton>
        <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/56">
          <MessageCircle className="h-4 w-4" />
          {interaction.commentCount}
        </span>
        <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/56">
          <Repeat2 className="h-4 w-4" />
          {interaction.shareCount}
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <form className="flex gap-2" onSubmit={handleComment}>
          <input
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D85A30]/50"
            onChange={(event) => setCommentDraft(event.target.value)}
            placeholder="Add a quick comment"
            value={commentDraft}
          />
          <Button
            className="h-10 rounded-xl bg-white/8 px-3 text-white hover:bg-white/14"
            disabled={isBusy}
            type="submit"
          >
            Comment
          </Button>
        </form>

        <form className="flex gap-2" onSubmit={handleShare}>
          <input
            className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D85A30]/50"
            onChange={(event) => setShareDraft(event.target.value)}
            placeholder="Share with a note"
            value={shareDraft}
          />
          <Button
            className="h-10 rounded-xl bg-white/8 px-3 text-white hover:bg-white/14"
            disabled={isBusy}
            type="submit"
          >
            Share
          </Button>
        </form>
      </div>

      {status && <p className="mt-3 text-xs font-bold text-white/42">{status}</p>}
    </article>
  );
}

function InteractionButton({
  active,
  children,
  disabled,
  label,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-bold transition ${
        active
          ? "border-[#D85A30]/35 bg-[#D85A30]/14 text-[#ffb49c]"
          : "border-white/10 bg-transparent text-white/56 hover:border-white/22 hover:text-white"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
  const selectedType = feedPostTypes.find((type) => type.value === draft.type) ?? feedPostTypes[0];
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
    setDraft({
      body: "",
      type: "update",
      visibility: "public",
      sourceUrl: ""
    });
  }

  return (
    <Panel className="p-5" id="composer">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader eyebrow="Composer" title="Post to the creator market." />
        <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
          {selectedType.label}
        </Badge>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={submitComposer}>
        <div className="grid gap-2 md:grid-cols-5">
          {feedPostTypes.map((type) => {
            const isSelected = draft.type === type.value;
            const isDisabled = type.value === "job_share";

            return (
              <button
                aria-pressed={isSelected}
                className={`min-h-16 rounded-xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-[#D85A30]/55 bg-[#D85A30]/12 text-white"
                    : "border-white/10 bg-white/[0.04] text-white/56 hover:border-white/25 hover:text-white"
                } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={isDisabled}
                key={type.value}
                onClick={() => {
                  setLocalMessage(null);
                  setDraft((current) => ({ ...current, type: type.value as FeedPostType }));
                }}
                type="button"
              >
                <span className="block text-sm font-black">{type.label}</span>
                <span className="mt-1 line-clamp-2 block text-[11px] leading-4 opacity-60">{type.description}</span>
              </button>
            );
          })}
        </div>

        <label className="grid gap-2">
          <span className="text-[11px] font-black tracking-[0.16em] text-white/35 uppercase">Post body</span>
          <textarea
            className="min-h-32 resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/32 focus:border-[#D85A30]/55 focus:ring-4 focus:ring-[#D85A30]/10"
            onChange={(event) => {
              setLocalMessage(null);
              setDraft((current) => ({ ...current, body: event.target.value }));
            }}
            placeholder="Share a creator win, campaign proof, content drop, or open-to-collabs signal..."
            value={draft.body}
          />
        </label>

        {draft.type === "content_drop" && (
          <label className="grid gap-2">
            <span className="text-[11px] font-black tracking-[0.16em] text-white/35 uppercase">Content link</span>
            <input
              className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-[#D85A30]/55"
              onChange={(event) => {
                setLocalMessage(null);
                setDraft((current) => ({ ...current, sourceUrl: event.target.value }));
              }}
              placeholder="https://www.tiktok.com/@creator/video/..."
              value={draft.sourceUrl}
            />
          </label>
        )}

        <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-white/62">{selectedType.description}</p>
            {draft.type === "open_to_work" && (
              <p className="mt-1 text-xs text-[#ffb49c]">
                Publishing this also marks your creator profile open to collabs.
              </p>
            )}
            {visibleMessage && <p className="mt-2 text-xs font-bold text-white/45">{visibleMessage}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-11 rounded-xl border border-white/10 bg-[#151518] px-3 text-sm font-bold text-white/64 outline-none focus:border-[#D85A30]/55"
              onChange={(event) =>
                setDraft((current) => ({ ...current, visibility: event.target.value as ComposerDraft["visibility"] }))
              }
              value={draft.visibility}
            >
              <option value="public">Public</option>
              <option value="connections">Connections</option>
            </select>
            <Button
              className="h-11 rounded-xl bg-[#D85A30] px-5 text-sm font-black text-white hover:bg-[#c54f29]"
              disabled={isPosting || !validation.ok}
              type="submit"
            >
              {isPosting ? "Posting..." : "Publish post"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </Panel>
  );
}

function CreatorProfileSheet({ creator, campaign }: { creator: Influencer; campaign: Campaign }) {
  const rate = suggestRate(creator);
  const matchScore = getMatchScore(creator, campaign);
  const [requestState, setRequestState] = useState("");

  async function sendCampaignRequest() {
    // TODO: wire to tRPC applications.create mutation (Phase 4.2 follow-up).
    setRequestState("Sending request...");
    setRequestState("Request saved to campaign applications.");
  }

  return (
    <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#0b0b0d] p-0 text-white sm:max-w-2xl">
      <div className="relative overflow-hidden">
        <div className="h-52 bg-[linear-gradient(135deg,rgba(216,90,48,0.42),rgba(168,85,247,0.22)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/32 to-transparent" />
      </div>
      <div className="grid gap-6 px-6 pb-7">
        <SheetHeader className="-mt-14 text-left">
          <div className="flex items-end justify-between gap-4">
            <CreatorAvatar
              creator={creator}
              className="h-28 w-28 border-4 border-[#0b0b0d] text-3xl"
              showBadge={creator.availability === "Available"}
            />
            <MatchPill score={matchScore} />
          </div>
          <div className="pt-4">
            <SheetTitle className="text-4xl font-black tracking-[-0.05em] text-white">{creator.name}</SheetTitle>
            <SheetDescription className="mt-2 text-base text-white/55">
              {creator.niche} creator · {creator.city} · {creator.audience}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex flex-wrap gap-2">
          {creator.verified && (
            <Badge className="rounded-full bg-[#D85A30]/12 text-[#ffb49c] hover:bg-[#D85A30]/12">
              Verified performance
            </Badge>
          )}
          <Badge className="rounded-full bg-emerald-300/12 text-emerald-100 hover:bg-emerald-300/12">
            {creator.availability}
          </Badge>
          <Badge className="rounded-full bg-white/8 text-white/65 hover:bg-white/8">
            Brand safety {creator.brandSafety}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ProfileStat icon={Users} label="Total reach" value={formatNumber(creator.totalReach)} />
          <ProfileStat icon={TrendingUp} label="Engagement" value={`${creator.engagementRate}%`} />
          <ProfileStat icon={DollarSign} label="Avg rate" value={`$${shortCurrency(creator.rate)}`} />
          <ProfileStat icon={ShieldCheck} label="Campaigns" value={String(creator.campaignsCompleted)} />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#ffb49c]" />
            <h3 className="font-black">Creator thesis</h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-white/62">{creator.bio}</p>
        </section>

        <section className="grid gap-3">
          <h3 className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Platform mix</h3>
          {creator.socialAccounts.map((account) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={account.platform}>
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-[11px] font-black ring-1 ${platformTone[account.platform]}`}
                >
                  {account.platform}
                </span>
                <span className="text-sm text-white/42">Synced {account.lastSyncedAt}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#D85A30]"
                  style={{ width: `${Math.min(100, account.engagementRate * 12)}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="font-black">{formatNumber(account.followers)} followers</span>
                <span className="text-white/55">{account.engagementRate}% engagement</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-3">
          <h3 className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">Campaign proof</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {creator.collaborations.map((collaboration) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                key={`${collaboration.brand}-${collaboration.title}`}
              >
                <p className="font-black">{collaboration.brand}</p>
                <p className="mt-1 text-sm text-white/50">{collaboration.title}</p>
                <p className="mt-4 text-2xl font-black tracking-[-0.04em]">{formatNumber(collaboration.reach)}</p>
                <p className="text-xs font-bold text-white/42">{collaboration.engagementRate}% engagement</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#D85A30]/18 bg-[#D85A30]/8 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ffb49c]" />
            <h3 className="font-black text-[#ffb49c]">AI rate and pitch</h3>
          </div>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{rate.range}</p>
          <p className="mt-3 text-sm leading-7 text-white/62">{draftBrandOutreach(creator, campaign)}</p>
        </section>

        <SheetFooter className="gap-3 sm:flex-col">
          {requestState && (
            <p className="rounded-2xl border border-emerald-200/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
              {requestState}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button
              className="h-12 rounded-xl bg-[#D85A30] text-white hover:bg-[#c54f29]"
              onClick={sendCampaignRequest}
            >
              Send campaign request
            </Button>
            <SheetClose
              render={
                <Button className="h-12 rounded-xl border-white/15 text-white hover:bg-white/10" variant="outline">
                  Close
                </Button>
              }
            />
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

function Panel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <article
      className={`rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/10 backdrop-blur-xl ${className}`}
      id={id}
    >
      {children}
    </article>
  );
}

function FeedStateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/48">{body}</p>
    </div>
  );
}

function StatBannerItem({
  icon: Icon,
  label,
  value,
  highlighted = false,
  sublabel
}: {
  icon: typeof Users;
  label: string;
  value: string;
  highlighted?: boolean;
  sublabel?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlighted ? "border-[#D85A30]/45 bg-[#D85A30]/10" : "border-white/10 bg-black/18"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black tracking-[0.16em] text-white/38 uppercase">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-[#ffb49c]" : "text-white/34"}`} />
      </div>
      <p className="mt-3 text-3xl font-black tracking-[-0.05em]">{value}</p>
      {sublabel && <p className="mt-1 text-[13px] font-bold text-[#ffb49c]">{sublabel}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <span className="block text-[11px] font-black tracking-[0.15em] text-white/34 uppercase">{label}</span>
      <strong className="mt-1 block text-lg font-black tracking-[-0.04em] text-white">{value}</strong>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <Icon className="h-4 w-4 text-[#ffb49c]" />
      <span className="mt-4 block text-[11px] font-black tracking-[0.15em] text-white/34 uppercase">{label}</span>
      <strong className="mt-1 block text-2xl font-black tracking-[-0.05em] text-white">{value}</strong>
    </div>
  );
}

function MatchPill({ score }: { score: number }) {
  const tier = matchTier(score);
  return (
    <div className={`grid h-14 w-16 shrink-0 place-items-center rounded-xl border text-center ${tier.pill}`}>
      <strong className="text-lg font-black tracking-[-0.04em]">{score}%</strong>
      <span className="-mt-2 text-[10px] font-black tracking-[0.12em] uppercase opacity-70">match</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-black tracking-[0.2em] text-white/35 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-[28px] leading-tight font-black tracking-[-0.045em] text-white">{title}</h2>
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
    <Avatar
      className={`bg-gradient-to-br from-[#D85A30] via-[#f1a06d] to-purple-300 font-black text-black ${className ?? ""}`}
    >
      <AvatarFallback className="bg-transparent text-black">{initials(creator.name)}</AvatarFallback>
      {showBadge && (
        <AvatarBadge className={creator.availability === "Available" ? "bg-emerald-400" : "bg-amber-400"} />
      )}
    </Avatar>
  );
}

function getMatchScore(creator: Influencer, campaign: Campaign) {
  return Math.min(100, scoreInfluencer(creator, campaign));
}

function matchTier(score: number) {
  if (score >= 90) {
    return {
      card: "border-[#D85A30]/45 shadow-[0_0_34px_rgba(216,90,48,0.08)]",
      pill: "border-[#D85A30]/35 bg-[#D85A30]/14 text-[#ffb49c]",
      button: "bg-[#D85A30] text-white hover:bg-[#c54f29]"
    };
  }
  if (score >= 70) {
    return {
      card: "border-purple-300/32",
      pill: "border-purple-300/30 bg-purple-400/12 text-purple-200",
      button: "bg-purple-400/18 text-purple-100 hover:bg-purple-400/25"
    };
  }
  return {
    card: "border-white/10",
    pill: "border-white/12 bg-white/8 text-white/62",
    button: "bg-white/8 text-white hover:bg-white/14"
  };
}

function statusTone(status: string) {
  if (status === "Approved") return "bg-emerald-300/12 text-emerald-100";
  if (status === "Revisions") return "bg-[#D85A30]/12 text-[#ffb49c]";
  if (status === "In progress") return "bg-purple-300/12 text-purple-100";
  return "bg-white/8 text-white/52";
}

function feedStateDot(state: string) {
  if (state === "live") return "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]";
  if (state === "loading") return "bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.7)]";
  if (state === "empty") return "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.7)]";
  return "bg-[#D85A30] shadow-[0_0_18px_rgba(216,90,48,0.75)]";
}

function formatPostType(type: string) {
  return type.replaceAll("_", " ");
}

function formatPostTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function shortCurrency(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString();
}
