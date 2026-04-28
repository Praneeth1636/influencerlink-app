"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db/client";
import { brandMembers, brands, creators, users } from "@/lib/db/schema";
import {
  brandOnboardingSchema,
  creatorOnboardingSchema,
  type BrandOnboardingInput,
  type CreatorOnboardingInput
} from "@/lib/onboarding/schemas";

const log = logger.child({ module: "onboarding/actions" });

type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function loadAuthedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!row) throw new Error("User row missing — webhook may not have fired");
  return { clerkId: userId, user: row };
}

async function markOnboarded(clerkId: string, userRowId: string) {
  await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, userRowId));

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { onboarded: true }
  });
}

// ---------------------------------------------------------------------------
// Creator path
// ---------------------------------------------------------------------------

export async function checkHandleAvailability(rawHandle: string): Promise<{ available: boolean }> {
  const handle = rawHandle.toLowerCase().trim();
  if (handle.length < 3) return { available: false };

  const [hit] = await db.select({ id: creators.id }).from(creators).where(eq(creators.handle, handle)).limit(1);
  return { available: !hit };
}

export async function completeCreatorOnboarding(input: CreatorOnboardingInput): Promise<ActionResult> {
  const parsed = creatorOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { clerkId, user } = await loadAuthedUser();

  const handle = parsed.data.handle.toLowerCase();
  const [existing] = await db.select({ id: creators.id }).from(creators).where(eq(creators.handle, handle)).limit(1);
  if (existing) {
    return { ok: false, error: "Handle is taken", fieldErrors: { handle: ["Handle is taken"] } };
  }

  await db.insert(creators).values({
    userId: user.id,
    handle,
    displayName: parsed.data.displayName,
    headline: parsed.data.headline || null,
    bio: parsed.data.bio || null,
    location: parsed.data.location || null,
    niches: parsed.data.niches
  });

  await db.update(users).set({ type: "creator" }).where(eq(users.id, user.id));

  await markOnboarded(clerkId, user.id);
  log.info({ clerkId, handle }, "creator onboarded");

  redirect(`/profile/${handle}`);
}

// ---------------------------------------------------------------------------
// Brand path
// ---------------------------------------------------------------------------

export async function completeBrandOnboarding(input: BrandOnboardingInput): Promise<ActionResult> {
  const parsed = brandOnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { clerkId, user } = await loadAuthedUser();
  const slug = parsed.data.slug.toLowerCase();

  const [slugTaken] = await db.select({ id: brands.id }).from(brands).where(eq(brands.slug, slug)).limit(1);
  if (slugTaken) {
    return { ok: false, error: "Slug is taken", fieldErrors: { slug: ["Slug is taken"] } };
  }

  const [brand] = await db
    .insert(brands)
    .values({
      slug,
      name: parsed.data.name,
      industry: parsed.data.industry,
      sizeRange: parsed.data.sizeRange,
      about: parsed.data.about || null
    })
    .returning({ id: brands.id });

  await db.insert(brandMembers).values({
    brandId: brand.id,
    userId: user.id,
    role: "owner"
  });

  await db.update(users).set({ type: "brand_member" }).where(eq(users.id, user.id));

  // Plan selection is stubbed until Phase 8 (Stripe). Stash on Clerk metadata.
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { plan: parsed.data.plan, brandId: brand.id }
  });

  await markOnboarded(clerkId, user.id);
  log.info({ clerkId, brandId: brand.id, slug, plan: parsed.data.plan }, "brand onboarded");

  redirect("/search");
}
