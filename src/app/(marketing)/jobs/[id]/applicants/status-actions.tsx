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
                ? "h-9 rounded-xl bg-[#D85A30] px-3 text-xs font-black text-white hover:bg-[#c54f29]"
                : "h-9 rounded-xl border-white/10 bg-white/[0.04] px-3 text-xs font-black text-white/58 hover:bg-white/[0.08] hover:text-white"
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

      {message && <p className="text-xs font-bold text-white/48">{message}</p>}
    </div>
  );
}
