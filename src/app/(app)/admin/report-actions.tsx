"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"resolve" | "dismiss" | null>(null);
  const resolve = trpc.admin.resolveReport.useMutation();

  async function handle(outcome: "resolved" | "dismissed") {
    setPending(outcome === "resolved" ? "resolve" : "dismiss");
    try {
      await resolve.mutateAsync({ reportId, outcome });
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <button
        className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] px-3 py-1 text-xs font-semibold text-[#147a3b] hover:bg-[#dff4e3] disabled:opacity-50"
        type="button"
        onClick={() => handle("resolved")}
        disabled={pending !== null}
      >
        {pending === "resolve" ? "..." : "Resolve"}
      </button>
      <button
        className="rounded-full border border-[#ececec] bg-white px-3 py-1 text-xs font-semibold text-[#687386] hover:border-[#dce3ea] disabled:opacity-50"
        type="button"
        onClick={() => handle("dismissed")}
        disabled={pending !== null}
      >
        {pending === "dismiss" ? "..." : "Dismiss"}
      </button>
    </div>
  );
}
