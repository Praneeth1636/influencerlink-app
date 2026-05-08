// Domain card for displaying a creator in discover/search/shortlist surfaces.
// Source-agnostic: callers pass a plain object so the same component works
// against the DB row, a tRPC payload, or a mock fixture.

import { CheckCircle2, ExternalLink, MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export type CreatorPlatform = "Instagram" | "YouTube" | "TikTok";

export interface CreatorCardData {
  name: string;
  bio: string;
  niche: string;
  location: string;
  avatar: string | null;
  verified: boolean;
  totalFollowers: number;
  engagementRate: number;
  ratePerPost: number;
  platforms: { platform: CreatorPlatform; followers: number }[];
}

interface CreatorCardProps {
  creator: CreatorCardData;
  onMessage?: () => void;
  onShortlist?: () => void;
  onView?: () => void;
}

const PLATFORM_LABEL: Record<CreatorPlatform, string> = {
  Instagram: "IG",
  YouTube: "YT",
  TikTok: "TT"
};

function formatFollowers(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

export function CreatorCard({ creator, onMessage, onShortlist, onView }: CreatorCardProps) {
  return (
    <Card className="hover-elevate group border-border overflow-hidden transition-all duration-300">
      <CardHeader className="p-0">
        <div className="from-primary/10 to-primary/5 h-24 w-full bg-gradient-to-r" />
        <div className="relative flex items-end justify-between px-6">
          <Avatar className="border-card bg-card -mt-10 h-20 w-20 rounded-xl border-4">
            {creator.avatar ? <AvatarImage src={creator.avatar} className="rounded-xl object-cover" /> : null}
            <AvatarFallback className="rounded-xl font-serif text-xl">
              {creator.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            {creator.platforms.map((p) => (
              <Badge
                variant="secondary"
                key={p.platform}
                className="bg-background/80 flex items-center gap-1 border px-2 py-0.5 shadow-sm backdrop-blur"
              >
                <span className="text-[10px] font-bold tracking-wider">{PLATFORM_LABEL[p.platform]}</span>
                <span className="text-xs">{formatFollowers(p.followers)}</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6 pt-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <h3 className="font-serif text-lg leading-none font-bold">{creator.name}</h3>
            {creator.verified && <CheckCircle2 className="text-primary h-4 w-4" />}
          </div>
          <p className="text-muted-foreground line-clamp-2 h-10 text-sm">{creator.bio}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-primary/5">
            {creator.niche}
          </Badge>
          <Badge variant="outline">{creator.location}</Badge>
        </div>

        <div className="border-border/50 grid grid-cols-3 gap-2 border-y py-3">
          <Stat label="Followers" value={formatFollowers(creator.totalFollowers)} />
          <Stat
            label="Engagement"
            value={`${creator.engagementRate}%`}
            valueClass="text-primary"
            className="border-border/50 border-x"
          />
          <Stat label="Rate/Post" value={`$${creator.ratePerPost}`} />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 px-6 pt-0 pb-6">
        <Button variant="default" className="flex-1 shadow-sm hover:shadow" onClick={onView}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View
        </Button>
        <Button variant="outline" size="icon" onClick={onMessage} title="Message">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onShortlist} title="Shortlist">
          <Plus className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function Stat({
  label,
  value,
  valueClass,
  className
}: {
  label: string;
  value: string;
  valueClass?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center ${className ?? ""}`}>
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      <span className={`font-mono font-bold ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
