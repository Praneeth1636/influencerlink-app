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
            ? "h-11 rounded-xl border border-[#D85A30]/35 bg-[#D85A30]/14 font-black text-[#ffb49c] hover:bg-[#D85A30]/20"
            : "h-11 rounded-xl border border-white/10 bg-white/[0.04] font-black text-white/68 hover:bg-white/[0.08] hover:text-white"
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
      {message && <p className="text-xs leading-5 text-white/48">{message}</p>}
    </div>
  );
}
