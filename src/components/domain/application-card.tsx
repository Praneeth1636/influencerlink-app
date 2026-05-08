// Pipeline card for an applicant on a brief. Lives in a Kanban-style column
// per stage; chevrons move the application across stages. Optimistic UI is
// the caller's job — this component is purely presentational.

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type ApplicationStage = "applied" | "shortlisted" | "hired" | "rejected";

const STAGES: ApplicationStage[] = ["applied", "shortlisted", "hired", "rejected"];

export interface ApplicationCardData {
  stage: ApplicationStage;
  appliedAt: string | Date;
}

export interface ApplicationCreatorData {
  name: string;
  niche: string;
  avatar: string | null;
  totalFollowers: number;
}

interface ApplicationCardProps {
  application: ApplicationCardData;
  creator: ApplicationCreatorData;
  onMoveStage?: (newStage: ApplicationStage) => void;
  onViewCreator?: () => void;
}

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function ApplicationCard({ application, creator, onMoveStage, onViewCreator }: ApplicationCardProps) {
  const currentIndex = STAGES.indexOf(application.stage);

  return (
    <Card className="hover-elevate border-border group mb-3 cursor-pointer transition-all" onClick={onViewCreator}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {creator.avatar ? <AvatarImage src={creator.avatar} /> : null}
              <AvatarFallback>{creator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm leading-tight font-semibold">{creator.name}</h4>
              <p className="text-muted-foreground mt-0.5 text-xs">{creator.niche}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mt-1 -mr-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCreator?.();
                }}
              >
                View Profile
              </DropdownMenuItem>
              {application.stage !== "rejected" && (
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveStage?.("rejected");
                  }}
                >
                  Reject
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            {monthDay.format(new Date(application.appliedAt))}
          </Badge>
          <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
            {creator.totalFollowers.toLocaleString()} followers
          </Badge>
        </div>

        <div className="border-border/50 flex items-center justify-between border-t pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-6 w-6"
            disabled={currentIndex <= 0}
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex > 0) onMoveStage?.(STAGES[currentIndex - 1]);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">Move</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-6 w-6"
            disabled={currentIndex >= STAGES.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex < STAGES.length - 1) onMoveStage?.(STAGES[currentIndex + 1]);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
