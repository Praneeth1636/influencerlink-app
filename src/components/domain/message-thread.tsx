// Thread row in the messages inbox. Selectable, with unread dot and last
// message preview. Pure UI — caller resolves the participant + last message
// from wherever they live (DM table, Liveblocks, mocks).

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MessageThreadData {
  participantName: string;
  participantAvatar: string | null;
  unread: boolean;
  lastMessage?: string;
  lastMessageFromMe?: boolean;
  lastMessageTimestamp?: string;
}

interface MessageThreadProps {
  thread: MessageThreadData;
  isActive?: boolean;
  onClick?: () => void;
}

export function MessageThreadItem({ thread, isActive, onClick }: MessageThreadProps) {
  const preview = thread.lastMessage
    ? thread.lastMessageFromMe
      ? `You: ${thread.lastMessage}`
      : thread.lastMessage
    : "";

  return (
    <div
      className={cn(
        "mx-2 my-1 flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors",
        isActive ? "bg-primary/10" : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="border-background h-12 w-12 border-2 shadow-sm">
          {thread.participantAvatar ? <AvatarImage src={thread.participantAvatar} /> : null}
          <AvatarFallback>{thread.participantName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {thread.unread && (
          <span className="bg-primary border-background absolute top-0 right-0 h-3 w-3 rounded-full border-2" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="mb-1 flex items-baseline justify-between">
          <h4 className="truncate text-sm font-semibold">{thread.participantName}</h4>
          {thread.lastMessageTimestamp && (
            <span className="text-muted-foreground ml-2 text-[10px] whitespace-nowrap">
              {thread.lastMessageTimestamp}
            </span>
          )}
        </div>
        <p className={cn("truncate text-xs", thread.unread ? "text-foreground font-medium" : "text-muted-foreground")}>
          {preview}
        </p>
      </div>
    </div>
  );
}
