"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_ONBOARDED_COOKIE, APP_ROLE_COOKIE } from "@/lib/auth/cookies";
import type { AppRole } from "@/lib/auth/role";
import { logger } from "@/lib/logger";
import { ensureDefaultUserRow } from "@/lib/auth/ensure-user";
import { db } from "@/lib/db/client";
import { brandMembers, brands, creators, users } from "@/lib/db/schema";
import {
  brandOnboardingSchema,
  creatorOnboardingSchema,
  type BrandOnboardingInput,
  type CreatorOnboardingInput
} from "@/lib/onboarding/schemas";
import { generateCreatorEmbedding } from "@/server/services/embedding-service";

const log = logger.child({ module: "onboarding/actions" });

type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function loadAuthedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await ensureDefaultUserRow(userId);
  return { clerkId: userId, user };
}

async function markOnboarded(clerkId: string, userRowId: string) {
  await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, userRowId));

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { onboarded: true }
  });

  const cookieStore = await cookies();
  cookieStore.set(APP_ONBOARDED_COOKIE, clerkId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}

async function setOnboardingRole(role: AppRole) {
  const cookieStore = await cookies();

  cookieStore.set(APP_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
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
  const [ownCreator] = await db.select({ id: creators.id }).from(creators).where(eq(creators.userId, user.id)).limit(1);
  if (existing && existing.id !== ownCreator?.id) {
    return { ok: false, error: "Handle is taken", fieldErrors: { handle: ["Handle is taken"] } };
  }

  const creatorValues = {
    handle,
    displayName: parsed.data.displayName,
    headline: parsed.data.headline || null,
    bio: parsed.data.bio || null,
    location: parsed.data.location || null,
    niches: parsed.data.niches,
    avatarUrl: parsed.data.avatarUrl || null,
    coverUrl: parsed.data.coverUrl || null,
    updatedAt: new Date()
  };

  const [createdOrUpdated] = ownCreator
    ? await db.update(creators).set(creatorValues).where(eq(creators.id, ownCreator.id)).returning({ id: creators.id })
    : await db
        .insert(creators)
        .values({
          userId: user.id,
          ...creatorValues
        })
        .returning({ id: creators.id });

  await db.update(users).set({ type: "creator" }).where(eq(users.id, user.id));

  if (createdOrUpdated) {
    void generateCreatorEmbedding(db, createdOrUpdated.id).catch((err: unknown) => {
      log.warn({ err, creatorId: createdOrUpdated.id }, "creator embedding deferred after onboarding failed");
    });
  }

  await markOnboarded(clerkId, user.id);
  await setOnboardingRole("creator");
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
  const [ownMembership] = await db
    .select({ brandId: brandMembers.brandId })
    .from(brandMembers)
    .where(eq(brandMembers.userId, user.id))
    .limit(1);
  if (slugTaken && slugTaken.id !== ownMembership?.brandId) {
    return { ok: false, error: "Slug is taken", fieldErrors: { slug: ["Slug is taken"] } };
  }

  const brandValues = {
    slug,
    name: parsed.data.name,
    industry: parsed.data.industry,
    sizeRange: parsed.data.sizeRange,
    about: parsed.data.about || null,
    updatedAt: new Date()
  };

  const [brand] = ownMembership
    ? await db.update(brands).set(brandValues).where(eq(brands.id, ownMembership.brandId)).returning({ id: brands.id })
    : await db.insert(brands).values(brandValues).returning({ id: brands.id });

  await db
    .insert(brandMembers)
    .values({
      brandId: brand.id,
      userId: user.id,
      role: "owner"
    })
    .onConflictDoNothing();

  await db.update(users).set({ type: "brand_member" }).where(eq(users.id, user.id));

  // Plan selection is stubbed until Phase 8 (Stripe). Stash on Clerk metadata.
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: { plan: parsed.data.plan, brandId: brand.id }
  });

  await markOnboarded(clerkId, user.id);
  await setOnboardingRole("brand");
  log.info({ clerkId, brandId: brand.id, slug, plan: parsed.data.plan }, "brand onboarded");

  redirect("/search");
}
