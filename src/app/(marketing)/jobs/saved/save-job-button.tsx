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
            ? "border-primary/35 bg-primary/14 text-primary hover:bg-primary/20 h-11 rounded-xl border font-black"
            : "border-border bg-muted/30 text-foreground/68 hover:bg-muted/40 hover:text-foreground h-11 rounded-xl border font-black"
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
      {message && <p className="text-foreground/48 text-xs leading-5">{message}</p>}
    </div>
  );
}
