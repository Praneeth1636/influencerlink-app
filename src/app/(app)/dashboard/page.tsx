// Brand-side dashboard. Creators land on /feed (sidebar already routes them
// there); brands land here. Renders inside the (app) AppShell — sidebar
// chrome is already there, so we only own the page body.

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart, DollarSign, PlusCircle, Star, Users } from "lucide-react";
import { resolveAppRole } from "@/lib/auth/role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignCard, type CampaignCardData } from "@/components/domain/campaign-card";
import { CreatorCard, type CreatorCardData } from "@/components/domain/creator-card";
import { StatCard } from "@/components/domain/stat-card";

// TODO: replace with tRPC `dashboard.brand` once we have brand-side queries.
const ACTIVE_CAMPAIGNS: CampaignCardData[] = [
  {
    title: "Summer Glow Launch",
    description: "Skincare creators with sensitive-skin focus. Reels + 1 long-form review.",
    platform: "Instagram",
    budget: "$8k–$12k",
    deadline: "2026-06-15",
    status: "active",
    applicantsCount: 14
  },
  {
    title: "Q3 Tech Deep-Dive",
    description: "Long-form YouTube reviews from engineers/photographers, 12-min minimum.",
    platform: "YouTube",
    budget: "$15k–$25k",
    deadline: "2026-07-10",
    status: "active",
    applicantsCount: 8
  }
];

const SHORTLISTED: CreatorCardData[] = [
  {
    name: "Elena Rivera",
    bio: "Skincare routines for sensitive, melanin-rich skin.",
    niche: "Beauty",
    location: "Brooklyn, NY",
    avatar: null,
    verified: true,
    totalFollowers: 482_000,
    engagementRate: 4.8,
    ratePerPost: 1800,
    platforms: [
      { platform: "Instagram", followers: 320_000 },
      { platform: "TikTok", followers: 162_000 }
    ]
  },
  {
    name: "Marcus Chen",
    bio: "Long-form gear reviews and DIY photography studio builds.",
    niche: "Tech",
    location: "Austin, TX",
    avatar: null,
    verified: true,
    totalFollowers: 1_240_000,
    engagementRate: 3.2,
    ratePerPost: 4500,
    platforms: [
      { platform: "YouTube", followers: 980_000 },
      { platform: "Instagram", followers: 260_000 }
    ]
  }
];

const RECENT_THREADS = [
  { id: "t1", participantName: "Elena Rivera", lastMessage: "Loved the brief — sending refs tonight." },
  { id: "t2", participantName: "Marcus Chen", lastMessage: "Can we push the deadline by a week?" },
  { id: "t3", participantName: "Aisha Kapoor", lastMessage: "Is this open to creators outside the US?" }
];

const RECENT_ACTIVITY = [
  {
    kind: "application" as const,
    title: "New Application",
    body: "Elena applied to Summer Glow Launch",
    timeAgo: "2h ago"
  },
  { kind: "shortlist" as const, title: "Creator Shortlisted", body: "You shortlisted Marcus Chen", timeAgo: "1d ago" }
];

export default async function DashboardPage() {
  const role = await resolveAppRole();
  if (role === "creator") redirect("/feed");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Here&apos;s your campaign overview.</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard title="Active Campaigns" value="2" icon={<BarChart className="h-5 w-5" />} />
            <StatCard
              title="Total Applicants"
              value="22"
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 15, label: "vs last month" }}
            />
            <StatCard title="Shortlisted" value="5" icon={<Star className="h-5 w-5" />} />
            <StatCard title="Total Spend" value="$12.5k" icon={<DollarSign className="h-5 w-5" />} />
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-serif text-xl font-bold">Active Campaigns</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jobs">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {ACTIVE_CAMPAIGNS.map((campaign) => (
                <CampaignCard key={campaign.title} campaign={campaign} isBrand />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-serif text-xl font-bold">Shortlisted Creators</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/applications">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SHORTLISTED.map((creator) => (
                <CreatorCard key={creator.name} creator={creator} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <Button variant="ghost" size="sm" asChild className="-mr-2 h-8 px-2">
                <Link href="/messages">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {RECENT_THREADS.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/messages/${thread.id}`}
                  className="group hover:bg-muted/50 -mx-2 flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors"
                >
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <Users className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="group-hover:text-primary text-sm font-medium transition-colors">
                      {thread.participantName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">{thread.lastMessage}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((event) => (
                  <div
                    key={event.title + event.timeAgo}
                    className="border-border bg-card flex items-start gap-3 rounded border p-4"
                  >
                    <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      {event.kind === "application" ? <Users className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <span className="text-muted-foreground text-xs whitespace-nowrap">{event.timeAgo}</span>
                      </div>
                      <p className="text-muted-foreground text-xs">{event.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
