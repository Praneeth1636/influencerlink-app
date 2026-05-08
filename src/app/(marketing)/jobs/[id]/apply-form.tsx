"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toJobApplicationInput } from "@/lib/jobs/forms";
import { trpc } from "@/lib/trpc/client";

type JobApplyFormProps = {
  jobId: string;
};

export function JobApplyForm({ jobId }: JobApplyFormProps) {
  const { isLoaded, isSignedIn } = useUser();
  const [pitch, setPitch] = useState("");
  const [proposedRateDollars, setProposedRateDollars] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const mutation = trpc.job.applyToJob.useMutation();

  if (isLoaded && !isSignedIn) {
    return (
      <Link
        className="hover:bg-primary/10 mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-black text-black transition"
        href="/login"
      >
        Sign in to apply
      </Link>
    );
  }

  return (
    <form
      className="mt-5 grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus(null);
        setThreadId(null);

        try {
          const result = await mutation.mutateAsync(
            toJobApplicationInput(jobId, {
              pitch,
              proposedRateDollars
            })
          );
          setStatus("Application submitted. A job conversation is ready.");
          setThreadId(result.thread?.id ?? null);
          setPitch("");
          setProposedRateDollars("");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Unable to apply right now.");
        }
      }}
    >
      <div className="grid gap-2">
        <Label className="text-foreground/70" htmlFor="job-application-pitch">
          Pitch
        </Label>
        <textarea
          className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary/60 min-h-28 rounded-xl border px-3 py-3 text-sm leading-6 transition outline-none"
          id="job-application-pitch"
          maxLength={300}
          minLength={20}
          onChange={(event) => setPitch(event.target.value)}
          placeholder="Tell the brand why your audience is the right fit..."
          required
          value={pitch}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-foreground/70" htmlFor="job-application-rate">
          Proposed rate
        </Label>
        <Input
          className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary rounded-xl"
          id="job-application-rate"
          min="0"
          onChange={(event) => setProposedRateDollars(event.target.value)}
          placeholder="3200"
          type="number"
          value={proposedRateDollars}
        />
      </div>

      <Button
        className="hover:bg-primary/10 h-11 rounded-xl bg-white font-black text-black"
        disabled={mutation.isPending}
      >
        <Send className="h-4 w-4" />
        {mutation.isPending ? "Submitting..." : "Apply to brief"}
      </Button>

      {status && <p className="text-muted-foreground text-sm leading-6">{status}</p>}
      {threadId && (
        <Link className="text-primary hover:text-foreground text-sm font-black" href={`/messages/${threadId}`}>
          Open job conversation
        </Link>
      )}
    </form>
  );
}
