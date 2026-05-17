"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

export function AdminUserActions({ userId, suspended }: { userId: string; suspended: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const suspend = trpc.admin.suspendUser.useMutation();
  const unsuspend = trpc.admin.unsuspendUser.useMutation();

  async function handleSuspend() {
    const reason = window.prompt("Reason for suspension?");
    if (!reason || reason.trim().length < 3) return;
    setPending(true);
    try {
      await suspend.mutateAsync({ userId, reason });
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Suspend failed");
    } finally {
      setPending(false);
    }
  }

  async function handleUnsuspend() {
    setPending(true);
    try {
      await unsuspend.mutateAsync({ userId });
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unsuspend failed");
    } finally {
      setPending(false);
    }
  }

  if (suspended) {
    return (
      <button
        className="rounded-full border border-[#bfe8d0] bg-[#e8f8ef] px-3 py-1 text-xs font-semibold text-[#147a3b] hover:bg-[#dff4e3] disabled:opacity-50"
        type="button"
        onClick={handleUnsuspend}
        disabled={pending}
      >
        Unsuspend
      </button>
    );
  }

  return (
    <button
      className="rounded-full border border-[#fbd5d5] bg-[#fff2f2] px-3 py-1 text-xs font-semibold text-[#a4262c] hover:bg-[#ffe6e6] disabled:opacity-50"
      type="button"
      onClick={handleSuspend}
      disabled={pending}
    >
      Suspend
    </button>
  );
}
