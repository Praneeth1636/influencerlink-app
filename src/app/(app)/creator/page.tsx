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
    <main className="bg-background text-foreground min-h-screen">
      <header className="border-border bg-background/88 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-5 py-4">
          <div>
            <p className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">Creator Portal</p>
            <p className="text-muted-foreground hidden text-sm sm:block">Profile, proof, posts, and deals</p>
          </div>
          <nav className="ml-auto hidden items-center gap-2 md:flex">
            <a
              className="text-muted-foreground hover:bg-muted/30 hover:text-foreground rounded-xl px-3 py-2 text-sm font-bold"
              href="#posts"
            >
              Posts
            </a>
            <a
              className="text-muted-foreground hover:bg-muted/30 hover:text-foreground rounded-xl px-3 py-2 text-sm font-bold"
              href="#opportunities"
            >
              Opportunities
            </a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <article className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(216,90,48,0.45),rgba(168,85,247,0.20)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="p-6 pt-0">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex items-end gap-5">
                  <CreatorAvatar creator={creator} className="border-border -mt-12 h-28 w-28 border-4 text-3xl" />
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-4xl font-black tracking-[-0.05em]">{creator.name}</h1>
                      <BadgeCheck className="text-primary h-6 w-6" />
                    </div>
                    <p className="text-foreground/50 mt-2 text-sm">
                      {creator.niche} creator · {creator.city} · {creator.audience}
                    </p>
                  </div>
                </div>
                <Button className="bg-primary text-foreground hover:bg-primary/90 h-11 rounded-xl px-5 font-black">
                  <Plus className="mr-2 h-4 w-4" />
                  New performance post
                </Button>
              </div>

              <p className="text-muted-foreground mt-6 max-w-4xl text-sm leading-7">{creator.bio}</p>

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
                <article className="border-border bg-card rounded-xl border p-5" key={post.title}>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 rounded-full">{post.type}</Badge>
                    <Play className="text-muted-foreground h-4 w-4" />
                  </div>
                  <h2 className="mt-5 text-xl font-black tracking-[-0.04em]">{post.title}</h2>
                  <p className="text-primary mt-3 text-3xl font-black tracking-[-0.05em]">{post.metric}</p>
                  <p className="text-foreground/55 mt-3 text-sm leading-6">{post.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4" id="opportunities">
            <SectionHeader eyebrow="Matched opportunities" title="Campaigns that fit your audience and rates." />
            <div className="grid gap-3">
              {activeOpportunities.map((campaign) => (
                <article
                  className="border-border bg-card grid gap-4 rounded-xl border p-5 md:grid-cols-[minmax(0,1fr)_auto]"
                  key={campaign.id}
                >
                  <div>
                    <p className="text-muted-foreground text-[11px] font-black tracking-[0.18em] uppercase">
                      {campaign.brand}
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">{campaign.title}</h3>
                    <p className="text-foreground/55 mt-2 text-sm leading-6">{campaign.goal}</p>
                  </div>
                  <div className="grid gap-2 md:min-w-48">
                    <span className="border-primary/20 bg-primary/10 text-primary rounded-xl border px-3 py-2 text-sm font-black">
                      {campaign.budgetRange}
                    </span>
                    <span className="border-border bg-muted/30 text-muted-foreground rounded-xl border px-3 py-2 text-sm">
                      {campaign.timeline}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="border-border bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <SectionHeader eyebrow="Notifications" title="What changed" />
              <Bell className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="mt-5 grid gap-3">
              {notifications.map((notification) => (
                <p
                  className="border-border bg-muted/30 text-muted-foreground rounded-xl border px-3 py-3 text-sm leading-5"
                  key={notification}
                >
                  {notification}
                </p>
              ))}
            </div>
          </article>

          <article className="border-border bg-card rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary h-5 w-5" />
              <SectionHeader eyebrow="AI agent" title="Profile coach" />
            </div>
            <p className="text-foreground/56 mt-4 text-sm leading-6">{buildCreatorPitch(creator)}</p>
            <p className="border-primary/20 bg-primary/10 mt-4 rounded-xl border p-3 text-sm leading-6 text-[#ffd2c2]">
              Add 2 more skincare proof posts and your rate card can move toward {rate.range}.
            </p>
          </article>

          <article className="border-border bg-card rounded-xl border p-5">
            <SectionHeader eyebrow="Platform mix" title="Connected accounts" />
            <div className="mt-5 grid gap-3">
              {creator.socialAccounts.map((account) => (
                <div className="border-border bg-muted/30 rounded-xl border p-3" key={account.platform}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{account.platform}</span>
                    <span className="text-muted-foreground text-xs">{account.lastSyncedAt}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-foreground/55">{formatNumber(account.followers)} followers</span>
                    <span className="text-primary font-black">{account.engagementRate}%</span>
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
      className={`rounded-2xl border p-4 ${highlighted ? "border-primary/45 bg-primary/10" : "border-border bg-muted/30"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground text-[11px] font-black tracking-[0.16em] uppercase">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function CreatorAvatar({ creator, className }: { creator: Influencer; className?: string }) {
  return (
    <Avatar
      className={`bg-gradient-to-br from-[#D85A30] via-[#f1a06d] to-purple-300 font-black text-black ${className ?? ""}`}
    >
      <AvatarFallback className="bg-transparent text-black">{initials(creator.name)}</AvatarFallback>
      <AvatarBadge className="bg-emerald-400" />
    </Avatar>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-[11px] font-black tracking-[0.2em] uppercase">{eyebrow}</p>
      <h2 className="text-foreground mt-2 text-[22px] leading-tight font-black tracking-[-0.04em]">{title}</h2>
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
