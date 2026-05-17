// POST → creates a Stripe Checkout session for the brief_payment and
// redirects the brand to Stripe's hosted page. We use POST (not GET) so the
// browser doesn't speculatively prefetch this action and accidentally charge.

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { brandMembers, briefPayments, users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { createBriefCheckoutSession } from "@/server/services/payment-service";
import { StripeNotConfiguredError } from "@/lib/stripe/connect";

export const runtime = "nodejs";
const log = logger.child({ route: "POST /api/stripe/checkout/brief/[paymentId]" });

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function back(status: "unauthorized" | "no_brand" | "error" | "not_configured", message?: string) {
  const url = new URL("/dashboard", baseUrl());
  url.searchParams.set("paid", status);
  if (message) url.searchParams.set("paid_message", message);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const { userId } = await auth();
  if (!userId) return back("unauthorized");

  // Resolve user + brand membership
  const [userRow] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!userRow) return back("unauthorized");

  // Verify payment exists and the user is a member of the owning brand
  const [payment] = await db
    .select({
      id: briefPayments.id,
      brandId: briefPayments.brandId
    })
    .from(briefPayments)
    .where(eq(briefPayments.id, paymentId))
    .limit(1);
  if (!payment) return back("error", "Payment not found");

  const [member] = await db
    .select()
    .from(brandMembers)
    .where(and(eq(brandMembers.userId, userRow.id), eq(brandMembers.brandId, payment.brandId)))
    .limit(1);
  if (!member) return back("no_brand", "Not a member of this brand");

  try {
    const { checkoutUrl } = await createBriefCheckoutSession(db, userRow, member, paymentId);
    return NextResponse.redirect(checkoutUrl, 303);
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      log.warn({ paymentId }, "checkout attempted with missing Stripe config");
      return back("not_configured");
    }
    log.error({ err, paymentId }, "brief checkout failed");
    return back("error", err instanceof Error ? err.message : "Unknown");
  }
}
