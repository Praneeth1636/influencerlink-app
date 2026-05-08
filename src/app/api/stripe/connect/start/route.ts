// Stripe Connect onboarding entry. Creator clicks → we ensure they have a
// Connect account, generate a one-time onboarding link, redirect. Stripe
// handles the rest of the UX and posts back via webhook + redirect.

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { creators, users } from "@/lib/db/schema";
import { StripeNotConfiguredError, startOnboarding } from "@/server/services/payout-service";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
const log = logger.child({ module: "stripe-connect-start" });

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function settled(status: "ok" | "unauthorized" | "no_creator" | "error" | "not_configured", message?: string) {
  const url = new URL("/creator", baseUrl());
  url.searchParams.set("payout", status);
  if (message) url.searchParams.set("payout_message", message);
  return NextResponse.redirect(url);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return settled("unauthorized");

  const [userRow] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!userRow) return settled("no_creator", "User row missing");

  const [creator] = await db.select().from(creators).where(eq(creators.userId, userRow.id)).limit(1);
  if (!creator) return settled("no_creator", "Finish creator onboarding before setting up payouts");

  try {
    const { url } = await startOnboarding(db, userRow, creator);
    return NextResponse.redirect(url);
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      log.warn("connect onboarding attempted with missing config");
      return settled("not_configured");
    }
    log.error({ err }, "connect onboarding failed");
    return settled("error", err instanceof Error ? err.message : "Unknown");
  }
}
