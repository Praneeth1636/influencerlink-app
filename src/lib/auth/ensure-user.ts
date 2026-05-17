import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db as defaultDb } from "@/lib/db/client";
import { brandMembers, brands, creatorAggregates, creators, jobs, users, type User } from "@/lib/db/schema";

type UserDatabase = typeof defaultDb;

const LOCAL_DEMO_IDS = {
  user: "00000000-0000-4000-8000-000000000001",
  creator: "00000000-0000-4000-8000-000000000002",
  brand: "00000000-0000-4000-8000-000000000003",
  job: "00000000-0000-4000-8000-000000000004"
};

export const LOCAL_DEMO_CLERK_ID = "local_demo_terrace_user";

export async function ensureUserRow(database: UserDatabase, clerkId: string): Promise<User> {
  const [existing] = await database.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkId}@terrace.local`;

  await database
    .insert(users)
    .values({
      clerkId,
      email,
      type: "creator"
    })
    .onConflictDoNothing({
      target: users.clerkId
    });

  const [row] = await database.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (!row) {
    throw new Error("Unable to create Terrace user row");
  }

  return row;
}

export async function ensureDefaultUserRow(clerkId: string): Promise<User> {
  return ensureUserRow(defaultDb, clerkId);
}

export async function ensureLocalDemoUser(database: UserDatabase): Promise<User> {
  await database
    .insert(users)
    .values({
      id: LOCAL_DEMO_IDS.user,
      clerkId: LOCAL_DEMO_CLERK_ID,
      email: "you@terrace.app",
      type: "creator",
      onboardedAt: new Date()
    })
    .onConflictDoNothing({
      target: users.clerkId
    });

  const [user] = await database.select().from(users).where(eq(users.clerkId, LOCAL_DEMO_CLERK_ID)).limit(1);
  if (!user) {
    throw new Error("Unable to create local Terrace demo user");
  }

  await ensureLocalDemoWorkspace(database, user);

  return user;
}

export async function ensureLocalDemoWorkspace(database: UserDatabase, user: User): Promise<void> {
  const [existingCreator] = await database.select().from(creators).where(eq(creators.userId, user.id)).limit(1);
  let creatorId = existingCreator?.id;

  const demoHandle =
    user.clerkId === LOCAL_DEMO_CLERK_ID ? "you" : `you-${user.id.replaceAll("-", "").slice(0, 8).toLowerCase()}`;

  if (!creatorId) {
    const [createdCreator] = await database
      .insert(creators)
      .values({
        ...(user.clerkId === LOCAL_DEMO_CLERK_ID ? { id: LOCAL_DEMO_IDS.creator } : {}),
        userId: user.id,
        handle: demoHandle,
        displayName: "You",
        bio: "Demo creator profile for testing Terrace feed posts, job applications, and messaging locally.",
        headline: "Beauty and lifestyle creator testing Terrace",
        location: "Los Angeles, CA",
        niches: ["Beauty", "Lifestyle"],
        verified: true,
        openToCollabs: true,
        ratesPublic: true,
        baseRateCents: 250000,
        currency: "USD"
      })
      .onConflictDoNothing({
        target: creators.handle
      })
      .returning();

    creatorId = createdCreator?.id;
  }

  if (!creatorId) {
    const [creator] = await database.select().from(creators).where(eq(creators.userId, user.id)).limit(1);
    creatorId = creator?.id;
  }

  if (!creatorId) {
    throw new Error("Unable to create local Terrace demo creator");
  }

  await database
    .insert(creatorAggregates)
    .values({
      creatorId,
      totalReach: 4300000,
      weightedEngagement: "7.000",
      primaryNiche: "Beauty",
      computedAt: new Date()
    })
    .onConflictDoNothing({
      target: creatorAggregates.creatorId
    });

  let [brand] = await database.select().from(brands).where(eq(brands.slug, "terrace-studio")).limit(1);

  if (!brand) {
    [brand] = await database
      .insert(brands)
      .values({
        id: LOCAL_DEMO_IDS.brand,
        slug: "terrace-studio",
        name: "Terrace Studio",
        tagline: "A demo brand workspace for testing creator briefs.",
        about:
          "Terrace Studio is the local demo brand used to test brief publishing, creator applications, and message threads.",
        websiteUrl: "https://terrace.local",
        industry: "Beauty",
        sizeRange: "11-50",
        hqLocation: "Remote",
        verified: true,
        followerCount: 12800
      })
      .onConflictDoNothing({
        target: brands.slug
      })
      .returning();
  }

  if (!brand) {
    [brand] = await database.select().from(brands).where(eq(brands.slug, "terrace-studio")).limit(1);
  }

  if (!brand) {
    throw new Error("Unable to create local Terrace demo brand");
  }

  await database
    .insert(brandMembers)
    .values({
      brandId: brand.id,
      userId: user.id,
      role: "owner",
      joinedAt: new Date()
    })
    .onConflictDoNothing();

  await database
    .insert(jobs)
    .values({
      id: LOCAL_DEMO_IDS.job,
      brandId: brand.id,
      postedById: user.id,
      title: "Terrace Studio: Soft skincare launch brief",
      description:
        "Create a calm, proof-driven skincare content drop for women ages 18-30. We want short-form content that feels personal, polished, and useful without looking like a heavy ad.",
      deliverables: [
        { title: "1 TikTok routine video" },
        { title: "1 Instagram Reel" },
        { title: "3 story frames with product links" }
      ],
      niches: ["Beauty", "Skincare", "Lifestyle"],
      minFollowers: 50000,
      minEngagement: "4.000",
      budgetMinCents: 250000,
      budgetMaxCents: 650000,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      remote: true,
      status: "open"
    })
    .onConflictDoNothing({
      target: jobs.id
    });
}
