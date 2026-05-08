// Brief/campaign card surfaced in the creator feed and the brand briefs board.
// Behavior diverges by `isBrand`: brand sees applicants count + status badge,
// creator sees an Apply CTA.

import { Briefcase, Calendar, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export type CampaignStatus = "active" | "draft" | "completed";

export interface CampaignCardData {
  title: string;
  description: string;
  platform: string;
  budget: string;
  deadline: string | Date;
  status: CampaignStatus;
  applicantsCount?: number;
}

interface CampaignCardProps {
  campaign: CampaignCardData;
  isBrand?: boolean;
  onApply?: () => void;
}

const STATUS_CLASSES: Record<CampaignStatus, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  completed: "bg-muted text-muted-foreground"
};

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function CampaignCard({ campaign, isBrand, onApply }: CampaignCardProps) {
  return (
    <Card className="hover-elevate border-border transition-all">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div>
          <h3 className="mb-1 font-serif text-lg leading-tight font-bold">{campaign.title}</h3>
          <Badge variant="secondary" className="font-mono text-xs">
            {campaign.platform}
          </Badge>
        </div>
        {isBrand && (
          <Badge variant="outline" className={`capitalize ${STATUS_CLASSES[campaign.status]}`}>
            {campaign.status}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <p className="text-muted-foreground line-clamp-2 text-sm">{campaign.description}</p>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="text-foreground font-medium">{campaign.budget}</span>
          </div>
          <div className="text-muted-foreground flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Due {monthDay.format(new Date(campaign.deadline))}</span>
          </div>
          {isBrand && typeof campaign.applicantsCount === "number" && (
            <div className="text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{campaign.applicantsCount} applicants</span>
            </div>
          )}
        </div>
      </CardContent>

      {onApply && !isBrand && (
        <CardFooter className="pt-0">
          <Button className="w-full shadow-sm" onClick={onApply}>
            <Briefcase className="mr-2 h-4 w-4" />
            Apply Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
