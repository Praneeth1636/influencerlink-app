"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  Eye,
  MessageCircle,
  Play,
  Plus,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { campaigns as seedCampaigns, influencers as seedInfluencers, type Campaign, type Influencer } from "@/data/marketplace";
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
  const [creator, setCreator] = useState<Influencer>(defaultCreator);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const response = await fetch("/api/bootstrap", { cache: "no-store" }).catch(() => null);
      if (!response?.ok) return;
      const payload = (await response.json()) as { creators: Influencer[]; campaigns: Campaign[] };
      if (!mounted) return;
      setCreator(payload.creators.find((item) => item.id === defaultCreator.id) ?? payload.creators[0] ?? defaultCreator);
      setCampaigns(payload.campaigns.length ? payload.campaigns : seedCampaigns);
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const rate = suggestRate(creator);
  const activeOpportunities = useMemo(() => campaigns.filter((campaign) => campaign.niche === creator.niche || campaign.status !== "Draft"), [campaigns, creator.niche]);

  return (
    <main className="min-h-screen bg-[#080809] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(216,90,48,0.18),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(168,85,247,0.12),transparent_24%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080809]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-5 py-4">
          <Link className="logoMark miniLogo shrink-0 bg-white/5 ring-1 ring-white/10" href="/creator" aria-label="InfluencerLink creator portal">
            <span />
            <span />
            <span />
          </Link>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/38">Creator Portal</p>
            <p className="hidden text-sm text-white/60 sm:block">Profile, proof, posts, and deals</p>
          </div>
          <nav className="ml-auto hidden items-center gap-2 md:flex">
            <Link className="rounded-xl px-3 py-2 text-sm font-bold text-white/58 hover:bg-white/[0.06] hover:text-white" href="/creator">
              Profile
            </Link>
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-white/58 hover:bg-white/[0.06] hover:text-white" href="#posts">
              Posts
            </a>
            <a className="rounded-xl px-3 py-2 text-sm font-bold text-white/58 hover:bg-white/[0.06] hover:text-white" href="#opportunities">
              Opportunities
            </a>
            <Link className="rounded-xl px-3 py-2 text-sm font-bold text-[#ffb49c] hover:bg-[#D85A30]/10" href="/feed">
              Company portal
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1380px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-6">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/10">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(216,90,48,0.45),rgba(168,85,247,0.20)),url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center" />
            <div className="p-6 pt-0">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div className="flex items-end gap-5">
                  <CreatorAvatar creator={creator} className="-mt-12 h-28 w-28 border-4 border-[#101013] text-3xl" />
                  <div className="pb-2">
                    <div className="flex items-center gap-2">
                      <h1 className="text-4xl font-black tracking-[-0.05em]">{creator.name}</h1>
                      <BadgeCheck className="h-6 w-6 text-[#ffb49c]" />
                    </div>
                    <p className="mt-2 text-sm text-white/50">{creator.niche} creator · {creator.city} · {creator.audience}</p>
                  </div>
                </div>
                <Button className="h-11 rounded-xl bg-[#D85A30] px-5 font-black text-white hover:bg-[#c54f29]">
                  <Plus className="mr-2 h-4 w-4" />
                  New performance post
                </Button>
              </div>

              <p className="mt-6 max-w-4xl text-sm leading-7 text-white/58">{creator.bio}</p>

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
                <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5" key={post.title}>
                  <div className="flex items-center justify-between">
                    <Badge className="rounded-full bg-[#D85A30]/10 text-[#ffb49c] hover:bg-[#D85A30]/10">{post.type}</Badge>
                    <Play className="h-4 w-4 text-white/34" />
                  </div>
                  <h2 className="mt-5 text-xl font-black tracking-[-0.04em]">{post.title}</h2>
                  <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#ffb49c]">{post.metric}</p>
                  <p className="mt-3 text-sm leading-6 text-white/55">{post.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4" id="opportunities">
            <SectionHeader eyebrow="Matched opportunities" title="Campaigns that fit your audience and rates." />
            <div className="grid gap-3">
              {activeOpportunities.map((campaign) => (
                <article className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 md:grid-cols-[minmax(0,1fr)_auto]" key={campaign.id}>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/35">{campaign.brand}</p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">{campaign.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{campaign.goal}</p>
                  </div>
                  <div className="grid gap-2 md:min-w-48">
                    <span className="rounded-xl border border-[#D85A30]/20 bg-[#D85A30]/10 px-3 py-2 text-sm font-black text-[#ffb49c]">{campaign.budgetRange}</span>
                    <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/52">{campaign.timeline}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center justify-between">
              <SectionHeader eyebrow="Notifications" title="What changed" />
              <Bell className="h-5 w-5 text-white/35" />
            </div>
            <div className="mt-5 grid gap-3">
              {notifications.map((notification) => (
                <p className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-5 text-white/58" key={notification}>
                  {notification}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#ffb49c]" />
              <SectionHeader eyebrow="AI agent" title="Profile coach" />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/56">{buildCreatorPitch(creator)}</p>
            <p className="mt-4 rounded-xl border border-[#D85A30]/20 bg-[#D85A30]/10 p-3 text-sm leading-6 text-[#ffd2c2]">
              Add 2 more skincare proof posts and your rate card can move toward {rate.range}.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <SectionHeader eyebrow="Platform mix" title="Connected accounts" />
            <div className="mt-5 grid gap-3">
              {creator.socialAccounts.map((account) => (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3" key={account.platform}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{account.platform}</span>
                    <span className="text-xs text-white/38">{account.lastSyncedAt}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/55">{formatNumber(account.followers)} followers</span>
                    <span className="font-black text-[#ffb49c]">{account.engagementRate}%</span>
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

function CreatorMetric({ icon: Icon, label, value, highlighted = false }: { icon: typeof Users; label: string; value: string; highlighted?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlighted ? "border-[#D85A30]/45 bg-[#D85A30]/10" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">{label}</span>
        <Icon className={`h-4 w-4 ${highlighted ? "text-[#ffb49c]" : "text-white/34"}`} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function CreatorAvatar({ creator, className }: { creator: Influencer; className?: string }) {
  return (
    <Avatar className={`bg-gradient-to-br from-[#D85A30] via-[#f1a06d] to-purple-300 font-black text-black ${className ?? ""}`}>
      <AvatarFallback className="bg-transparent text-black">{initials(creator.name)}</AvatarFallback>
      <AvatarBadge className="bg-emerald-400" />
    </Avatar>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/35">{eyebrow}</p>
      <h2 className="mt-2 text-[22px] font-black leading-tight tracking-[-0.04em] text-white">{title}</h2>
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
