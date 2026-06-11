"use client";

import { useMemo } from "react";
import { BadgeCheck, Bell, BriefcaseBusiness, DollarSign, Play, Plus, Sparkles, TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  campaigns as seedCampaigns,
  influencers as seedInfluencers,
  type Campaign,
  type Influencer
} from "@/data/marketplace";
import { buildCreatorPitch, formatNumber, suggestRate } from "@/lib/agents";

const defaultCreator = seedInfluencers.find((creator) => creator.id === "sara") ?? seedInfluencers[0];

const creatorPosts = [
  {
    title: "Summer serum launch recap",
    metric: "2.1M reach",
    body: "GRWM hook, product reveal at 3.8 seconds, strongest saves from women 24-31.",
    type: "Campaign result"
  },
  {
    title: "3-look carousel test",
    metric: "6.2% engagement",
    body: "Carousel outperformed static PDP creative by 38% on saves and brand profile visits.",
    type: "Performance post"
  },
  {
    title: "Routine-led TikTok short",
    metric: "840K views",
    body: "Short-form tutorial format drove comment quality and purchase-intent replies.",
    type: "Short video"
  }
];

const notifications = [
  "Glossier viewed your media kit",
  "Rare Beauty requested updated rates",
  "AI suggests raising your skincare launch package",
  "New campaign matches your audience: women 18-30"
];

export default function CreatorPortalPage() {
  // TODO: replace seed data with tRPC creator.byHandle + campaign.list (Phase 4.2 follow-up).
  const creator: Influencer = defaultCreator;
  const campaigns: Campaign[] = seedCampaigns;

  const rate = suggestRate(creator);
  const activeOpportunities = useMemo(
    () => campaigns.filter((campaign) => campaign.niche === creator.niche || campaign.status !== "Draft"),
    [campaigns, creator.niche]
  );

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352f]">
      <header className="border-b border-[#e9e9e7] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em]">Creator Portal</p>
            <p className="hidden text-sm text-[#787774] sm:block">Profile, proof, posts, and deals</p>
          </div>
          <nav className="ml-auto hidden items-center gap-2 md:flex">
            <a
              className="rounded-full px-3 py-2 text-sm font-medium text-[#787774] hover:bg-[#f7f7f5] hover:text-[#37352f]"
              href="#posts"
            >
              Posts
            </a>
            <a
              className="rounded-full px-3 py-2 text-sm font-medium text-[#787774] hover:bg-[#f7f7f5] hover:text-[#37352f]"
              href="#opportunities"
            >
              Opportunities
            </a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <article className="overflow-hidden rounded-[28px] border border-[#e9e9e7] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.05)]">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(159,201,228,0.55),rgba(226,138,119,0.28)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="p-6 pt-0">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex items-end gap-5">
                  <CreatorAvatar creator={creator} className="-mt-12 h-28 w-28 border-4 border-white text-3xl" />
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-4xl font-semibold tracking-[-0.05em]">{creator.name}</h1>
                      <BadgeCheck className="h-6 w-6 text-[#78bde8]" />
                    </div>
                    <p className="mt-2 text-sm text-[#787774]">
                      {creator.niche} creator · {creator.city} · {creator.audience}
                    </p>
                  </div>
                </div>
                <Button className="h-11 rounded-full bg-[#37352f] px-5 font-semibold text-white hover:bg-[#262420]">
                  <Plus className="mr-2 h-4 w-4" />
                  New performance post
                </Button>
              </div>

              <p className="mt-6 max-w-4xl text-sm leading-7 text-[#787774]">{creator.bio}</p>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <CreatorMetric icon={Users} label="Total reach" value={formatNumber(creator.totalReach)} />
                <CreatorMetric icon={TrendingUp} label="Engagement" value={`${creator.engagementRate}%`} />
                <CreatorMetric icon={BriefcaseBusiness} label="Campaigns" value={String(creator.campaignsCompleted)} />
                <CreatorMetric icon={DollarSign} label="Suggested rate" value={rate.range} highlighted />
              </div>
            </div>
          </article>

          <section className="grid gap-4" id="posts">
            <SectionHeader eyebrow="Creator feed" title="Post proof like a media kit that updates itself." />
            <div className="grid gap-4 md:grid-cols-3">
              {creatorPosts.map((post) => (
                <article
                  className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]"
                  key={post.title}
                >
                  <div className="flex items-center justify-between">
                    <Badge className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] text-[#e08550] hover:bg-[#faf0ea]">
                      {post.type}
                    </Badge>
                    <Play className="h-4 w-4 text-[#9b9a97]" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em]">{post.title}</h2>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#e08550]">{post.metric}</p>
                  <p className="mt-3 text-sm leading-6 text-[#787774]">{post.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4" id="opportunities">
            <SectionHeader eyebrow="Matched opportunities" title="Campaigns that fit your audience and rates." />
            <div className="grid gap-3">
              {activeOpportunities.map((campaign) => (
                <article
                  className="grid gap-4 rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)] md:grid-cols-[minmax(0,1fr)_auto]"
                  key={campaign.id}
                >
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-[#9b9a97] uppercase">
                      {campaign.brand}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em]">{campaign.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#787774]">{campaign.goal}</p>
                  </div>
                  <div className="grid gap-2 md:min-w-48">
                    <span className="rounded-full border border-[#f3d5c4] bg-[#faf0ea] px-3 py-2 text-sm font-semibold text-[#e08550]">
                      {campaign.budgetRange}
                    </span>
                    <span className="rounded-full border border-[#e9e9e7] bg-[#f8f9fb] px-3 py-2 text-sm text-[#787774]">
                      {campaign.timeline}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <div className="flex items-center justify-between">
              <SectionHeader eyebrow="Notifications" title="What changed" />
              <Bell className="h-5 w-5 text-[#9b9a97]" />
            </div>
            <div className="mt-5 grid gap-3">
              {notifications.map((notification) => (
                <p
                  className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] px-3 py-3 text-sm leading-5 text-[#787774]"
                  key={notification}
                >
                  {notification}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#e08550]" />
              <SectionHeader eyebrow="AI agent" title="Profile coach" />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#787774]">{buildCreatorPitch(creator)}</p>
            <p className="mt-4 rounded-lg border border-[#f3d5c4] bg-[#faf0ea] p-3 text-sm leading-6 text-[#9f4826]">
              Add 2 more skincare proof posts and your rate card can move toward {rate.range}.
            </p>
          </article>

          <article className="rounded-xl border border-[#e9e9e7] bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.035)]">
            <SectionHeader eyebrow="Platform mix" title="Connected accounts" />
            <div className="mt-5 grid gap-3">
              {creator.socialAccounts.map((account) => (
                <div className="rounded-lg border border-[#e9e9e7] bg-[#fbfbfa] p-3" key={account.platform}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{account.platform}</span>
                    <span className="text-xs text-[#9b9a97]">{account.lastSyncedAt}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-[#787774]">{formatNumber(account.followers)} followers</span>
                    <span className="font-semibold text-[#e08550]">{account.engagementRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function CreatorMetric({
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
      className={`rounded-lg border p-4 ${highlighted ? "border-[#f3d5c4] bg-[#faf0ea]" : "border-[#e9e9e7] bg-[#fbfbfa]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-[#9b9a97] uppercase">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-[#e08550]" : "text-[#9b9a97]"}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function CreatorAvatar({ creator, className }: { creator: Influencer; className?: string }) {
  return (
    <Avatar className={`bg-[linear-gradient(135deg,#9fc9e4,#e28a77)] font-semibold text-[#37352f] ${className ?? ""}`}>
      <AvatarFallback className="bg-transparent text-[#37352f]">{initials(creator.name)}</AvatarFallback>
      <AvatarBadge className="bg-emerald-400" />
    </Avatar>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.04em] text-[#37352f]">{title}</h2>
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
