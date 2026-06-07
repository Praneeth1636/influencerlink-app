"use client";

// Renders the payment status + appropriate action for a single brief_payment.
// Brand viewers get "Pay" / "Release" / "Refund" buttons depending on state;
// creators see read-only status + amount due.
//
// Action button is a tiny client island so it can call tRPC mutations and
// update the query cache without a full page reload.

import { useState } from "react";
import { CheckCircle2, Clock, CircleDollarSign, Send, Undo2, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export type PaymentStatus = "pending" | "authorized" | "captured" | "released" | "refunded" | "failed";

export interface PaymentTileData {
  id: string;
  status: PaymentStatus;
  amountCents: number;
  platformFeeCents: number;
  creatorPayoutCents: number;
  currency: string;
}

const STATUS_COPY: Record<
  PaymentStatus,
  { label: string; pillClass: string; brandHint: string; creatorHint: string; icon: typeof Clock }
> = {
  pending: {
    label: "Awaiting payment",
    pillClass: "border-[#fce4cf] bg-[#fff7f0] text-[#c0530b]",
    brandHint: "Confirm and pay to fund this brief.",
    creatorHint: "Awaiting brand payment.",
    icon: Clock
  },
  authorized: {
    label: "Checkout pending",
    pillClass: "border-[#fce4cf] bg-[#fff7f0] text-[#c0530b]",
    brandHint: "Finish payment on the Stripe page to fund this brief.",
    creatorHint: "Brand started payment — almost there.",
    icon: CircleDollarSign
  },
  captured: {
    label: "Funded",
    pillClass: "border-[#cfe9d7] bg-[#eef9f1] text-[#147a3b]",
    brandHint: "Funds held on Terrace. Release them once the creator delivers.",
    creatorHint: "Funded — start delivering. Funds release on confirmation.",
    icon: CheckCircle2
  },
  released: {
    label: "Released",
    pillClass: "border-[#d6eaf8] bg-[#edf8ff] text-[#2f83b7]",
    brandHint: "Funds transferred to the creator's Stripe account.",
    creatorHint: "Funds on the way — Stripe typically settles in 2-7 days.",
    icon: Send
  },
  refunded: {
    label: "Refunded",
    pillClass: "border-[#e9e9e7] bg-[#fbfbfa] text-[#787774]",
    brandHint: "Payment refunded.",
    creatorHint: "Brand refunded this brief.",
    icon: Undo2
  },
  failed: {
    label: "Payment failed",
    pillClass: "border-[#fbd5d5] bg-[#fff2f2] text-[#a4262c]",
    brandHint: "Stripe rejected the charge. Try a different card.",
    creatorHint: "Brand's payment did not clear.",
    icon: XCircle
  }
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

interface Props {
  payment: PaymentTileData;
  viewer: "brand" | "creator";
  brandId?: string; // required for brand-side mutations
}

export function PaymentTile({ payment, viewer, brandId }: Props) {
  const meta = STATUS_COPY[payment.status];
  const Icon = meta.icon;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const release = trpc.payment.release.useMutation();
  const refund = trpc.payment.refund.useMutation();

  async function handleRelease() {
    if (!brandId) return;
    setError(null);
    setPending(true);
    try {
      await release.mutateAsync({ brandId, paymentId: payment.id });
      await utils.payment.byApplication.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Release failed");
    } finally {
      setPending(false);
    }
  }

  async function handleRefund() {
    if (!brandId) return;
    setError(null);
    setPending(true);
    try {
      await refund.mutateAsync({ brandId, paymentId: payment.id });
      await utils.payment.byApplication.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e9e9e7] bg-white p-4 shadow-[0_8px_24px_rgba(17,24,39,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.pillClass}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {formatMoney(payment.amountCents, payment.currency)}
          </p>
          <p className="mt-1 text-xs text-[#787774]">
            {viewer === "brand"
              ? `${formatMoney(payment.platformFeeCents, payment.currency)} platform fee · ${formatMoney(payment.creatorPayoutCents, payment.currency)} to creator`
              : `You receive ${formatMoney(payment.creatorPayoutCents, payment.currency)} after delivery`}
          </p>
        </div>
        {viewer === "brand" && payment.status === "captured" && brandId && (
          <div className="flex flex-col gap-2">
            <button
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#37352f] px-4 text-sm font-semibold text-white transition hover:bg-[#262420] disabled:opacity-50"
              onClick={handleRelease}
              type="button"
              disabled={pending}
            >
              {pending ? "Releasing..." : "Release funds"}
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#e9e9e7] px-4 text-sm font-semibold text-[#787774] transition hover:border-[#dce3ea] disabled:opacity-50"
              onClick={handleRefund}
              type="button"
              disabled={pending}
            >
              Refund
            </button>
          </div>
        )}
        {viewer === "brand" &&
          (payment.status === "pending" || payment.status === "authorized" || payment.status === "failed") && (
            // Hosted Stripe Checkout flow. Form POST → API redirects to Stripe.
            <form action={`/api/stripe/checkout/brief/${payment.id}`} method="post">
              <button
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#37352f] px-5 text-sm font-semibold text-white transition hover:bg-[#262420]"
                type="submit"
              >
                {payment.status === "failed" ? "Try again" : "Pay now"}
              </button>
            </form>
          )}
      </div>
      <p className="mt-3 text-xs text-[#787774]">{viewer === "brand" ? meta.brandHint : meta.creatorHint}</p>
      {error && <p className="mt-2 text-xs font-semibold text-[#a4262c]">{error}</p>}
    </div>
  );
}
