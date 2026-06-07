"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export function MarkAllNotificationsReadButton({ unreadCount }: { unreadCount: number }) {
  const [count, setCount] = useState(unreadCount);
  const [message, setMessage] = useState<string | null>(null);
  const mutation = trpc.notification.markAllRead.useMutation();

  return (
    <div className="grid justify-items-start gap-2 sm:justify-items-end">
      <Button
        className="h-11 rounded-full border border-[#e9e9e7] bg-white px-4 font-semibold text-[#37352f] hover:bg-[#f8f9fb]"
        disabled={mutation.isPending || count === 0}
        onClick={async () => {
          setMessage(null);

          try {
            const result = await mutation.mutateAsync();
            setCount(0);
            setMessage(`${result.updatedCount} notification${result.updatedCount === 1 ? "" : "s"} marked read.`);
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to mark notifications read.");
          }
        }}
        type="button"
        variant="outline"
      >
        <CheckCheck className="h-4 w-4" />
        Mark all read
      </Button>
      <p className="text-xs font-medium text-[#9b9a97]">{count} unread</p>
      {message && <p className="max-w-[220px] text-xs leading-5 text-[#787774]">{message}</p>}
    </div>
  );
}
