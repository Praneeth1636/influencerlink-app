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
        className="h-10 rounded-full bg-[#37352f] text-xs font-semibold text-white hover:bg-[#262420]"
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
      {message && <p className="text-xs leading-5 text-[#787774]">{message}</p>}
    </div>
  );
}

export function CustomerPortalButton({ brandId }: { brandId?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const mutation = trpc.billing.createPortalSession.useMutation();

  return (
    <div className="grid justify-items-start gap-2">
      <Button
        className="h-10 rounded-full border border-[#e9e9e7] bg-white text-xs font-semibold text-[#37352f] hover:bg-[#f8f9fb]"
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
      {message && <p className="max-w-[240px] text-xs leading-5 text-[#787774]">{message}</p>}
    </div>
  );
}
