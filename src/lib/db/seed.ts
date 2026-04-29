import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";
import {
  brandMembers,
  brands,
  creatorAggregates,
  creatorPlatforms,
  creators,
  follows,
  jobApplications,
  jobSavedByCreator,
  jobs,
  messages,
  messageThreads,
  platformMetrics,
  posts,
  subscriptionPlans,
  threadParticipants,
  users
} from "@/lib/db/schema";

type SeedDatabase = NeonHttpDatabase<typeof schema>;

type CreatorSeed = {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  bio: string;
  headline: string;
  location: string;
  niches: string[];
  verified: boolean;
  openToCollabs: boolean;
  baseRateCents: number;
  totalReach: number;
  weightedEngagement: string;
};

type BrandSeed = {
  id: string;
  ownerUserId: string;
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  hqLocation: string;
};

export type SeedData = ReturnType<typeof buildSeedData>;

const creatorNames = [
  "Sara Rivera",
  "Maya Torres",
  "Dev Shah",
  "Lena Brooks",
  "Omar Reed",
  "Nia Carter",
  "Aria Kim",
  "Jamie Kim",
  "Maya Adeyemi",
  "Noah Patel",
  "Ivy Chen",
  "Eli Morgan",
  "Zara Hill",
  "Mateo Cruz",
  "Priya Rao",
  "Kai Bennett",
  "Ava Stone",
  "Leo Wright",
  "Mila James",
  "Theo Grant",
  "Anika Bose",
  "Sofia Lane",
  "Caleb Fox",
  "Naomi Scott",
  "Rhea Kapoor",
  "Jonah Lee",
  "Amara Cole",
  "Ezra Brooks",
  "Talia Green",
  "Micah Young",
  "Layla Hart",
  "Rohan Mehta",
  "Sienna Park",
  "Miles Reed",
  "Elena Ruiz",
  "Ari Cohen",
  "Mina Ali",
  "Jules Carter",
  "Samira Khan",
  "Finn Walker",
  "Gia Romano",
  "Andre Lewis",
  "Kira Novak",
  "Nolan Price",
  "Leah Woods",
  "Dante Moore",
  "Yara Silva",
  "Hana Mori",
  "Cole Adams",
  "Mira Singh"
];

const brandNames = [
  "Glossier",
  "Sephora",
  "Alo",
  "Hydrant",
  "Resy",
  "Oatly",
  "Reformation",
  "Notion",
  "Vercel",
  "AllTrails"
];

const niches = ["Beauty", "Fitness", "Food", "Fashion", "Tech", "Travel", "Skincare", "Lifestyle", "Gaming", "Finance"];
const locations = [
  "Los Angeles, CA",
  "Austin, TX",
  "New York, NY",
  "Seattle, WA",
  "Denver, CO",
  "Chicago, IL",
  "Miami, FL",
  "Atlanta, GA"
];
const platformValues = ["instagram", "tiktok", "youtube", "linkedin"] as const;
const postTypes = ["update", "milestone", "content_drop", "open_to_work", "job_share"] as const;
const jobTemplates = [
  {
    title: "Summer skincare launch creator brief",
    description:
      "Create educational short-form content showing a realistic morning skincare routine with product integration and usage rights for paid social.",
    deliverables: ["1 TikTok tutorial", "1 Instagram Reel", "3 story frames"],
    niches: ["Beauty", "Skincare"],
    minFollowers: 100_000,
    minEngagement: "4.000",
    budgetMinCents: 250_000,
    budgetMaxCents: 650_000
  },
  {
    title: "Wellness studio opening campaign",
    description:
      "Bring local creators into a new studio opening and document the experience through polished lifestyle content.",
    deliverables: ["1 Instagram Reel", "1 static carousel", "Event attendance"],
    niches: ["Fitness", "Lifestyle"],
    minFollowers: 50_000,
    minEngagement: "3.500",
    budgetMinCents: 150_000,
    budgetMaxCents: 420_000
  },
  {
    title: "Creator-led restaurant discovery series",
    description:
      "Produce a restaurant discovery video that helps young professionals find high-intent dinner spots in major cities.",
    deliverables: ["1 TikTok video", "Usage rights for 30 days"],
    niches: ["Food", "Lifestyle"],
    minFollowers: 75_000,
    minEngagement: "4.200",
    budgetMinCents: 180_000,
    budgetMaxCents: 500_000
  },
  {
    title: "SaaS workflow demo for creators",
    description:
      "Show how creator teams organize briefs, approvals, and content calendars with a practical workflow demo.",
    deliverables: ["1 YouTube Short", "1 LinkedIn post", "Raw footage license"],
    niches: ["Tech", "Business"],
    minFollowers: 40_000,
    minEngagement: "3.000",
    budgetMinCents: 200_000,
    budgetMaxCents: 700_000
  }
];

export function buildSeedData() {
  const creatorSeeds = creatorNames.map((displayName, index): CreatorSeed => {
    const primaryNiche = niches[index % niches.length]!;
    const totalReach = 65_000 + index * 47_500 + (index % 5) * 125_000;
    const engagement = (3.8 + (index % 9) * 0.42).toFixed(3);

    return {
      id: seedUuid(1_000 + index),
      userId: seedUuid(100 + index),
      handle: toHandle(displayName),
      displayName,
      bio: `${displayName} creates ${primaryNiche.toLowerCase()} content with verified audience signals, brand-safe storytelling, and repeatable campaign proof.`,
      headline: `${primaryNiche} creator helping brands turn attention into trust`,
      location: locations[index % locations.length]!,
      niches: [primaryNiche, niches[(index + 3) % niches.length]!],
      verified: index % 4 !== 0,
      openToCollabs: index % 5 !== 3,
      baseRateCents: 55_000 + index * 9_500,
      totalReach,
      weightedEngagement: engagement
    };
  });

  const brandSeeds = brandNames.map(
    (name, index): BrandSeed => ({
      id: seedUuid(2_000 + index),
      ownerUserId: seedUuid(800 + index),
      slug: toHandle(name),
      name,
      tagline: `${name} partners with creators who can prove audience fit.`,
      industry: index % 3 === 0 ? "Beauty" : index % 3 === 1 ? "Consumer" : "SaaS",
      hqLocation: locations[(index + 2) % locations.length]!
    })
  );

  const creatorUsers = creatorSeeds.map((creator): typeof users.$inferInsert => ({
    id: creator.userId,
    clerkId: `seed_creator_${creator.handle}`,
    email: `${creator.handle}@creatorlink.dev`,
    type: "creator",
    onboardedAt: new Date("2026-04-01T00:00:00.000Z")
  }));

  const brandUsers = brandSeeds.map((brand): typeof users.$inferInsert => ({
    id: brand.ownerUserId,
    clerkId: `seed_brand_${brand.slug}`,
    email: `${brand.slug}@brands.creatorlink.dev`,
    type: "brand_member",
    onboardedAt: new Date("2026-04-01T00:00:00.000Z")
  }));

  const creatorRows = creatorSeeds.map((creator): typeof creators.$inferInsert => ({
    id: creator.id,
    userId: creator.userId,
    handle: creator.handle,
    displayName: creator.displayName,
    bio: creator.bio,
    headline: creator.headline,
    location: creator.location,
    niches: creator.niches,
    verified: creator.verified,
    profileViews: 120 + creatorSeeds.indexOf(creator) * 17,
    openToCollabs: creator.openToCollabs,
    ratesPublic: true,
    baseRateCents: creator.baseRateCents,
    currency: "USD"
  }));

  const brandRows = brandSeeds.map((brand): typeof brands.$inferInsert => ({
    id: brand.id,
    slug: brand.slug,
    name: brand.name,
    tagline: brand.tagline,
    about: `${brand.name} uses CreatorLink to discover creators, post briefs, and build measurable creator partnerships.`,
    websiteUrl: `https://example.com/${brand.slug}`,
    industry: brand.industry,
    sizeRange: "51-200",
    hqLocation: brand.hqLocation,
    verified: true,
    followerCount: 1_200 + brandSeeds.indexOf(brand) * 350
  }));

  const brandMemberRows = brandSeeds.map((brand): typeof brandMembers.$inferInsert => ({
    brandId: brand.id,
    userId: brand.ownerUserId,
    role: "owner",
    joinedAt: new Date("2026-04-01T00:00:00.000Z")
  }));

  const aggregateRows = creatorSeeds.map((creator): typeof creatorAggregates.$inferInsert => ({
    creatorId: creator.id,
    totalReach: creator.totalReach,
    weightedEngagement: creator.weightedEngagement,
    primaryNiche: creator.niches[0],
    computedAt: new Date("2026-04-28T00:00:00.000Z")
  }));

  const platformRows = creatorSeeds.flatMap((creator, creatorIndex) =>
    platformValues.slice(0, 3).map((platform, platformIndex): typeof creatorPlatforms.$inferInsert => ({
      id: seedUuid(3_000 + creatorIndex * 10 + platformIndex),
      creatorId: creator.id,
      platform,
      externalId: `seed_${platform}_${creator.handle}`,
      externalHandle: creator.handle,
      accessToken: `seed_encrypted_placeholder_${creator.handle}_${platform}`,
      refreshToken: `seed_encrypted_refresh_placeholder_${creator.handle}_${platform}`,
      connectedAt: new Date("2026-04-01T00:00:00.000Z"),
      lastSyncedAt: new Date("2026-04-28T00:00:00.000Z")
    }))
  );

  const metricRows = platformRows.map((platform, index): typeof platformMetrics.$inferInsert => {
    const creator = creatorSeeds[Math.floor(index / 3)]!;
    const divisor = index % 3 === 0 ? 2 : index % 3 === 1 ? 3 : 5;

    return {
      id: seedUuid(4_000 + index),
      creatorPlatformId: platform.id!,
      snapshotDate: new Date("2026-04-28T00:00:00.000Z"),
      followers: Math.round(creator.totalReach / divisor),
      avgViews: Math.round(creator.totalReach / (divisor + 1)),
      avgLikes: Math.round(creator.totalReach / (divisor * 18)),
      avgComments: Math.round(creator.totalReach / (divisor * 110)),
      engagementRate: creator.weightedEngagement,
      audienceAgeJson: { "18-24": 31, "25-34": 44, "35-44": 18 },
      audienceGenderJson: { female: 62, male: 34, other: 4 },
      audienceGeoJson: { US: 68, CA: 8, UK: 7, AU: 5 }
    };
  });

  const postRows = Array.from({ length: 100 }, (_, index): typeof posts.$inferInsert => {
    const isBrandPost = index % 5 === 4;
    const creator = creatorSeeds[index % creatorSeeds.length]!;
    const brand = brandSeeds[index % brandSeeds.length]!;
    const type = postTypes[index % postTypes.length]!;

    return {
      id: seedUuid(5_000 + index),
      authorType: isBrandPost ? "brand" : "creator",
      authorId: isBrandPost ? brand.id : creator.id,
      body: isBrandPost
        ? `${brand.name} is scouting ${niches[index % niches.length]!.toLowerCase()} creators for a new measurable launch brief.`
        : `${creator.displayName} shared a ${type.replace("_", " ")}: ${creator.totalReach.toLocaleString()} reach and ${creator.weightedEngagement}% engagement across ${creator.niches.join(" and ")} audiences.`,
      mediaJson: [],
      type,
      visibility: "public",
      createdAt: new Date(Date.UTC(2026, 3, 28, 12, index % 60, 0)),
      updatedAt: new Date(Date.UTC(2026, 3, 28, 12, index % 60, 0))
    };
  });

  const followRows = brandSeeds.flatMap((brand, brandIndex) =>
    creatorSeeds.slice(0, 12).map((creator, creatorIndex): typeof follows.$inferInsert => ({
      id: seedUuid(6_000 + brandIndex * 100 + creatorIndex),
      followerId: brand.ownerUserId,
      followedType: "creator",
      followedId: creator.id
    }))
  );

  const jobRows = Array.from({ length: 20 }, (_, index): typeof jobs.$inferInsert => {
    const brand = brandSeeds[index % brandSeeds.length]!;
    const template = jobTemplates[index % jobTemplates.length]!;

    return {
      id: seedUuid(8_000 + index),
      brandId: brand.id,
      postedById: brand.ownerUserId,
      title: `${brand.name}: ${template.title}`,
      description: template.description,
      deliverables: template.deliverables.map((title, deliverableIndex) => ({
        title,
        platform: deliverableIndex === 0 ? "TikTok" : deliverableIndex === 1 ? "Instagram" : "Mixed"
      })),
      niches: template.niches,
      minFollowers: template.minFollowers + index * 8_000,
      minEngagement: template.minEngagement,
      budgetMinCents: template.budgetMinCents + index * 10_000,
      budgetMaxCents: template.budgetMaxCents + index * 15_000,
      deadline: new Date(Date.UTC(2026, 5, 12 + (index % 14), 23, 59, 0)),
      location: index % 3 === 0 ? locations[index % locations.length] : null,
      remote: index % 3 !== 0,
      status: index % 9 === 8 ? "draft" : "open",
      applicationCount: 8 + index * 3,
      createdAt: new Date(Date.UTC(2026, 3, 20 + (index % 9), 10, index, 0)),
      updatedAt: new Date(Date.UTC(2026, 3, 20 + (index % 9), 10, index, 0))
    };
  });

  const jobApplicationRows = jobRows.flatMap((job, jobIndex): Array<typeof jobApplications.$inferInsert> => {
    const statuses: Array<typeof jobApplications.$inferInsert.status> = [
      "submitted",
      "shortlisted",
      "rejected",
      "hired"
    ];

    return Array.from({ length: 4 }, (_, applicationIndex): typeof jobApplications.$inferInsert => {
      const creator = creatorSeeds[(jobIndex * 4 + applicationIndex) % creatorSeeds.length]!;
      const proposedRateCents = creator.baseRateCents + applicationIndex * 25_000;

      return {
        id: seedUuid(8_500 + jobIndex * 10 + applicationIndex),
        jobId: job.id!,
        creatorId: creator.id,
        pitch: `${creator.displayName} can turn this brief into ${creator.niches[0]?.toLowerCase()} content for an audience with verified reach and a clear brand fit.`,
        proposedRateCents,
        attachments: [],
        status: statuses[(jobIndex + applicationIndex) % statuses.length],
        createdAt: new Date(Date.UTC(2026, 3, 24 + (jobIndex % 5), 11, applicationIndex, 0)),
        updatedAt: new Date(Date.UTC(2026, 3, 24 + (jobIndex % 5), 11, applicationIndex, 0))
      };
    });
  });

  const savedJobRows = creatorSeeds.slice(0, 20).flatMap((creator, creatorIndex) =>
    Array.from({ length: 3 }, (_, savedIndex): typeof jobSavedByCreator.$inferInsert => ({
      creatorId: creator.id,
      jobId: jobRows[(creatorIndex + savedIndex * 3) % jobRows.length]!.id!,
      savedAt: new Date(Date.UTC(2026, 3, 25 + (savedIndex % 3), 9, creatorIndex, 0))
    }))
  );

  const threadRows = Array.from({ length: 12 }, (_, index): typeof messageThreads.$inferInsert => {
    const job = jobRows[index % jobRows.length]!;

    return {
      id: seedUuid(9_000 + index),
      type: index % 3 === 0 ? "job" : "direct",
      jobId: index % 3 === 0 ? job.id : null,
      createdAt: new Date(Date.UTC(2026, 3, 27, 9, index, 0)),
      lastMessageAt: new Date(Date.UTC(2026, 3, 28, 16, index, 0))
    };
  });

  const threadParticipantRows = threadRows.flatMap((thread, index): Array<typeof threadParticipants.$inferInsert> => {
    const creator = creatorSeeds[index % creatorSeeds.length]!;
    const brand = brandSeeds[index % brandSeeds.length]!;

    return [
      {
        threadId: thread.id!,
        userId: creator.userId,
        role: "creator",
        lastReadAt: index % 2 === 0 ? new Date(Date.UTC(2026, 3, 28, 15, index, 0)) : null,
        muted: false
      },
      {
        threadId: thread.id!,
        userId: brand.ownerUserId,
        role: "recruiter",
        lastReadAt: new Date(Date.UTC(2026, 3, 28, 14, index, 0)),
        muted: false
      }
    ];
  });

  const messageRows = threadRows.flatMap((thread, index): Array<typeof messages.$inferInsert> => {
    const creator = creatorSeeds[index % creatorSeeds.length]!;
    const brand = brandSeeds[index % brandSeeds.length]!;

    return [
      {
        id: seedUuid(9_200 + index * 3),
        threadId: thread.id!,
        senderId: brand.ownerUserId,
        body: `${brand.name} is interested in ${creator.displayName}'s ${creator.niches[0]?.toLowerCase()} audience for an upcoming creator brief.`,
        attachments: [],
        createdAt: new Date(Date.UTC(2026, 3, 28, 10, index, 0))
      },
      {
        id: seedUuid(9_201 + index * 3),
        threadId: thread.id!,
        senderId: creator.userId,
        body: `Love the direction. I can send concepts built around verified reach, audience fit, and usage rights.`,
        attachments: [],
        createdAt: new Date(Date.UTC(2026, 3, 28, 12, index, 0))
      },
      {
        id: seedUuid(9_202 + index * 3),
        threadId: thread.id!,
        senderId: brand.ownerUserId,
        body: `Perfect. Can you share two content angles and your rate for one Reel plus story frames?`,
        attachments: [],
        createdAt: new Date(Date.UTC(2026, 3, 28, 16, index, 0))
      }
    ];
  });

  const planRows: Array<typeof subscriptionPlans.$inferInsert> = [
    {
      id: seedUuid(7_000),
      name: "Creator Free",
      audience: "creator",
      priceCents: 0,
      interval: "month",
      features: { posts: true, applicationsPerMonth: 5 }
    },
    {
      id: seedUuid(7_001),
      name: "Creator Pro",
      audience: "creator",
      priceCents: 1_900,
      interval: "month",
      features: { applications: "unlimited", profileViews: true, analytics: true }
    },
    {
      id: seedUuid(7_010),
      name: "Brand Growth",
      audience: "brand",
      priceCents: 9_900,
      interval: "month",
      features: { dmsPerMonth: 100, jobs: 10, fullSearch: true }
    },
    {
      id: seedUuid(7_011),
      name: "Brand Scale",
      audience: "brand",
      priceCents: 49_900,
      interval: "month",
      features: { dmsPerMonth: 1000, jobs: "unlimited", aiMatching: true }
    }
  ];

  return {
    users: [...creatorUsers, ...brandUsers],
    creators: creatorRows,
    brands: brandRows,
    brandMembers: brandMemberRows,
    creatorAggregates: aggregateRows,
    creatorPlatforms: platformRows,
    platformMetrics: metricRows,
    posts: postRows,
    follows: followRows,
    jobs: jobRows,
    jobApplications: jobApplicationRows,
    jobSavedByCreator: savedJobRows,
    messageThreads: threadRows,
    threadParticipants: threadParticipantRows,
    messages: messageRows,
    subscriptionPlans: planRows
  };
}

export async function seedDatabase(db: SeedDatabase) {
  const data = buildSeedData();

  await db
    .insert(users)
    .values(data.users)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        clerkId: sql`excluded.clerk_id`,
        email: sql`excluded.email`,
        type: sql`excluded.type`,
        onboardedAt: sql`excluded.onboarded_at`
      }
    });

  await db
    .insert(brands)
    .values(data.brands)
    .onConflictDoUpdate({
      target: brands.id,
      set: {
        slug: sql`excluded.slug`,
        name: sql`excluded.name`,
        tagline: sql`excluded.tagline`,
        about: sql`excluded.about`,
        websiteUrl: sql`excluded.website_url`,
        industry: sql`excluded.industry`,
        sizeRange: sql`excluded.size_range`,
        hqLocation: sql`excluded.hq_location`,
        verified: sql`excluded.verified`,
        followerCount: sql`excluded.follower_count`,
        updatedAt: new Date()
      }
    });

  await db
    .insert(creators)
    .values(data.creators)
    .onConflictDoUpdate({
      target: creators.id,
      set: {
        handle: sql`excluded.handle`,
        displayName: sql`excluded.display_name`,
        bio: sql`excluded.bio`,
        headline: sql`excluded.headline`,
        location: sql`excluded.location`,
        niches: sql`excluded.niches`,
        verified: sql`excluded.verified`,
        profileViews: sql`excluded.profile_views`,
        openToCollabs: sql`excluded.open_to_collabs`,
        ratesPublic: sql`excluded.rates_public`,
        baseRateCents: sql`excluded.base_rate_cents`,
        updatedAt: new Date()
      }
    });

  await db
    .insert(brandMembers)
    .values(data.brandMembers)
    .onConflictDoUpdate({
      target: [brandMembers.brandId, brandMembers.userId],
      set: {
        role: sql`excluded.role`,
        joinedAt: sql`excluded.joined_at`
      }
    });

  await db
    .insert(creatorAggregates)
    .values(data.creatorAggregates)
    .onConflictDoUpdate({
      target: creatorAggregates.creatorId,
      set: {
        totalReach: sql`excluded.total_reach`,
        weightedEngagement: sql`excluded.weighted_engagement`,
        primaryNiche: sql`excluded.primary_niche`,
        computedAt: sql`excluded.computed_at`
      }
    });

  await db
    .insert(creatorPlatforms)
    .values(data.creatorPlatforms)
    .onConflictDoUpdate({
      target: creatorPlatforms.id,
      set: {
        externalHandle: sql`excluded.external_handle`,
        accessToken: sql`excluded.access_token`,
        refreshToken: sql`excluded.refresh_token`,
        lastSyncedAt: sql`excluded.last_synced_at`
      }
    });

  await db
    .insert(platformMetrics)
    .values(data.platformMetrics)
    .onConflictDoUpdate({
      target: platformMetrics.id,
      set: {
        followers: sql`excluded.followers`,
        avgViews: sql`excluded.avg_views`,
        avgLikes: sql`excluded.avg_likes`,
        avgComments: sql`excluded.avg_comments`,
        engagementRate: sql`excluded.engagement_rate`,
        audienceAgeJson: sql`excluded.audience_age_json`,
        audienceGenderJson: sql`excluded.audience_gender_json`,
        audienceGeoJson: sql`excluded.audience_geo_json`
      }
    });

  await db
    .insert(posts)
    .values(data.posts)
    .onConflictDoUpdate({
      target: posts.id,
      set: {
        authorType: sql`excluded.author_type`,
        authorId: sql`excluded.author_id`,
        body: sql`excluded.body`,
        mediaJson: sql`excluded.media_json`,
        type: sql`excluded.type`,
        visibility: sql`excluded.visibility`,
        updatedAt: new Date()
      }
    });

  await db.insert(follows).values(data.follows).onConflictDoNothing({ target: follows.id });
  await db
    .insert(jobs)
    .values(data.jobs)
    .onConflictDoUpdate({
      target: jobs.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        deliverables: sql`excluded.deliverables`,
        niches: sql`excluded.niches`,
        minFollowers: sql`excluded.min_followers`,
        minEngagement: sql`excluded.min_engagement`,
        budgetMinCents: sql`excluded.budget_min_cents`,
        budgetMaxCents: sql`excluded.budget_max_cents`,
        deadline: sql`excluded.deadline`,
        location: sql`excluded.location`,
        remote: sql`excluded.remote`,
        status: sql`excluded.status`,
        applicationCount: sql`excluded.application_count`,
        updatedAt: new Date()
      }
    });
  await db
    .insert(jobApplications)
    .values(data.jobApplications)
    .onConflictDoUpdate({
      target: jobApplications.id,
      set: {
        pitch: sql`excluded.pitch`,
        proposedRateCents: sql`excluded.proposed_rate_cents`,
        attachments: sql`excluded.attachments`,
        status: sql`excluded.status`,
        updatedAt: new Date()
      }
    });
  await db
    .insert(jobSavedByCreator)
    .values(data.jobSavedByCreator)
    .onConflictDoNothing({
      target: [jobSavedByCreator.jobId, jobSavedByCreator.creatorId]
    });
  await db
    .insert(messageThreads)
    .values(data.messageThreads)
    .onConflictDoUpdate({
      target: messageThreads.id,
      set: {
        type: sql`excluded.type`,
        jobId: sql`excluded.job_id`,
        lastMessageAt: sql`excluded.last_message_at`
      }
    });
  await db
    .insert(threadParticipants)
    .values(data.threadParticipants)
    .onConflictDoUpdate({
      target: [threadParticipants.threadId, threadParticipants.userId],
      set: {
        role: sql`excluded.role`,
        lastReadAt: sql`excluded.last_read_at`,
        muted: sql`excluded.muted`
      }
    });
  await db
    .insert(messages)
    .values(data.messages)
    .onConflictDoUpdate({
      target: messages.id,
      set: {
        body: sql`excluded.body`,
        attachments: sql`excluded.attachments`,
        editedAt: sql`excluded.edited_at`,
        deletedAt: sql`excluded.deleted_at`
      }
    });
  await db
    .insert(subscriptionPlans)
    .values(data.subscriptionPlans)
    .onConflictDoUpdate({
      target: subscriptionPlans.id,
      set: {
        name: sql`excluded.name`,
        audience: sql`excluded.audience`,
        priceCents: sql`excluded.price_cents`,
        interval: sql`excluded.interval`,
        features: sql`excluded.features`,
        updatedAt: new Date()
      }
    });

  return {
    users: data.users.length,
    creators: data.creators.length,
    brands: data.brands.length,
    posts: data.posts.length,
    follows: data.follows.length,
    jobs: data.jobs.length,
    jobApplications: data.jobApplications.length,
    savedJobs: data.jobSavedByCreator.length,
    messages: data.messages.length
  };
}

export function createSeedDatabase(databaseUrl: string): SeedDatabase {
  return drizzle(neon(databaseUrl), { schema });
}

function seedUuid(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function toHandle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
}
