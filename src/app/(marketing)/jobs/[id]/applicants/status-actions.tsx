"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApplicantStatus } from "@/lib/jobs/applicants";
import { trpc } from "@/lib/trpc/client";

const statuses: Array<{ label: string; value: ApplicantStatus }> = [
  { label: "Submitted", value: "submitted" },
  { label: "Shortlist", value: "shortlisted" },
  { label: "Hire", value: "hired" },
  { label: "Reject", value: "rejected" }
];

export function ApplicantStatusActions({
  applicationId,
  brandId,
  currentStatus
}: {
  applicationId: string;
  brandId: string;
  currentStatus: ApplicantStatus;
}) {
  const [status, setStatus] = useState<ApplicantStatus>(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const mutation = trpc.job.updateApplicationStatus.useMutation();

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex flex-wrap gap-2">
        {statuses.map((option) => (
          <Button
            className={
              option.value === status
                ? "bg-primary text-foreground hover:bg-primary/90 h-9 rounded-xl px-3 text-xs font-black"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground h-9 rounded-xl px-3 text-xs font-black"
            }
            disabled={mutation.isPending}
            key={option.value}
            onClick={async () => {
              setMessage(null);

              try {
                const updated = await mutation.mutateAsync({
                  applicationId,
                  brandId,
                  status: option.value
                });
                setStatus(updated.status);
                setMessage("Status updated.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Unable to update status.");
              }
            }}
            type="button"
            variant={option.value === status ? "default" : "outline"}
          >
            {option.value === status && <CheckCircle2 className="h-3.5 w-3.5" />}
            {option.label}
          </Button>
        ))}
      </div>

      {message && <p className="text-foreground/48 text-xs font-bold">{message}</p>}
    </div>
  );
}
