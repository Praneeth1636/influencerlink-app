"use client";

import { useState } from "react";
import { ArrowUpRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingAudience } from "@/lib/billing/plans";
import { trpc } from "@/lib/trpc/client";

export function CheckoutButton({
  audience,
  brandId,
  planId
}: {
  audience: BillingAudience;
  brandId?: string;
  planId: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const mutation = trpc.billing.createCheckoutSession.useMutation();

  return (
    <div className="grid gap-2">
      <Button
        className="h-10 rounded-xl bg-[#D85A30] text-xs font-black text-white hover:bg-[#c54f29]"
        disabled={mutation.isPending}
        onClick={async () => {
          setMessage(null);

          try {
            const session = await mutation.mutateAsync({ audience, brandId, planId });
            window.location.href = session.url;
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to start checkout.");
          }
        }}
        type="button"
      >
        Upgrade
        <ArrowUpRight className="h-4 w-4" />
      </Button>
      {message && <p className="text-xs leading-5 text-[#ffb49c]">{message}</p>}
    </div>
  );
}

export function CustomerPortalButton({ brandId }: { brandId?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const mutation = trpc.billing.createPortalSession.useMutation();

  return (
    <div className="grid justify-items-start gap-2">
      <Button
        className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black text-white/68 hover:bg-white/[0.08] hover:text-white"
        disabled={mutation.isPending}
        onClick={async () => {
          setMessage(null);

          try {
            const session = await mutation.mutateAsync({ brandId });
            window.location.href = session.url;
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "No active Stripe subscription found yet.");
          }
        }}
        type="button"
        variant="outline"
      >
        <CreditCard className="h-4 w-4" />
        Manage billing
      </Button>
      {message && <p className="max-w-[240px] text-xs leading-5 text-white/48">{message}</p>}
    </div>
  );
}
