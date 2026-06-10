"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export function SaveJobButton({ jobId }: { jobId: string }) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const saveMutation = trpc.job.save.useMutation();
  const unsaveMutation = trpc.job.unsave.useMutation();
  const isPending = saveMutation.isPending || unsaveMutation.isPending;

  return (
    <div className="grid gap-2">
      <Button
        className={
          saved
            ? "h-11 rounded-full border border-[#f3d5c4] bg-[#faf0ea] font-semibold text-[#e08550] hover:bg-[#faf0ea]"
            : "h-11 rounded-full border border-[#e9e9e7] bg-white font-semibold text-[#787774] hover:border-[#dce3ea] hover:text-[#37352f]"
        }
        disabled={isPending}
        onClick={async () => {
          setMessage(null);

          try {
            if (saved) {
              await unsaveMutation.mutateAsync({ jobId });
              setSaved(false);
              setMessage("Removed from saved jobs.");
            } else {
              await saveMutation.mutateAsync({ jobId });
              setSaved(true);
              setMessage("Saved to your jobs workspace.");
            }
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Sign in as a creator to save jobs.");
          }
        }}
        type="button"
        variant="outline"
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Saved" : "Save job"}
      </Button>
      {message && <p className="text-xs leading-5 text-[#787774]">{message}</p>}
    </div>
  );
}
