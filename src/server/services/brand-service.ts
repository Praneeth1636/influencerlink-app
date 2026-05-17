import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  auditLogs,
  brandMembers,
  brands,
  creatorAggregates,
  creators,
  jobApplications,
  jobs,
  messageThreads,
  messages,
  posts,
  threadParticipants,
  users,
  type Brand,
  type BrandMember,
  type User
} from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

const ADMIN_ROLES = new Set(["owner", "admin"]);

export type BrandUpdateInput = Partial<
  Pick<
    Brand,
    "name" | "tagline" | "about" | "websiteUrl" | "logoUrl" | "coverUrl" | "industry" | "sizeRange" | "hqLocation"
  >
>;

export function assertBrandAdmin(member: BrandMember) {
  if (!ADMIN_ROLES.has(member.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Requires admin role or higher"
    });
  }
}

export async function getBrandById(db: Database, id: string) {
  const [row] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return row ?? null;
}

export async function getBrandBySlug(db: Database, slug: string) {
  const [row] = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  return row ?? null;
}

export async function getBrandProfileBySlug(db: Database, slug: string) {
  const brand = await getBrandBySlug(db, slug);

  if (!brand) {
    return null;
  }

  const team = await db
    .select({
      member: brandMembers,
      user: users
    })
    .from(brandMembers)
    .innerJoin(users, eq(users.id, brandMembers.userId))
    .where(eq(brandMembers.brandId, brand.id))
    .orderBy(desc(brandMembers.joinedAt));

  const brandPosts = await db
    .select()
    .from(posts)
    .where(and(eq(posts.authorType, "brand"), eq(posts.authorId, brand.id)))
    .orderBy(desc(posts.createdAt))
    .limit(12);

  const activeJobs = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.brandId, brand.id), eq(jobs.status, "open")))
    .orderBy(desc(jobs.createdAt))
    .limit(8);

  return {
    brand,
    team,
    posts: brandPosts,
    jobs: activeJobs
  };
}

export async function listBrandMemberships(db: Database, user: User) {
  return db
    .select({
      member: brandMembers,
      brand: brands
    })
    .from(brandMembers)
    .innerJoin(brands, eq(brands.id, brandMembers.brandId))
    .where(eq(brandMembers.userId, user.id))
    .orderBy(desc(brandMembers.joinedAt));
}

/**
 * Build the brand dashboard payload — campaigns, applicants, recent threads,
 * recent activity, headline stats. One round-trip from the page server
 * component instead of 4-5 separate queries.
 *
 * Active campaigns = jobs in 'open' status. Shortlisted creators = creators
 * whose latest application on any of the brand's jobs has status='shortlisted'.
 * Recent activity = last 5 audit_log rows where the actor is on this brand's
 * member roster and the action is in our known job/application set.
 */
export async function getBrandDashboard(db: Database, _user: User, member: BrandMember) {
  const brandId = member.brandId;

  const [campaignsCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(and(eq(jobs.brandId, brandId), eq(jobs.status, "open")));

  const brandJobIds = (await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.brandId, brandId))).map((r) => r.id);

  const totalApplicantsRow = brandJobIds.length
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobApplications)
        .where(inArray(jobApplications.jobId, brandJobIds))
    : [{ count: 0 }];

  const shortlistedCountRow = brandJobIds.length
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(jobApplications)
        .where(and(inArray(jobApplications.jobId, brandJobIds), eq(jobApplications.status, "shortlisted")))
    : [{ count: 0 }];

  // Active campaigns (status='open'), newest first.
  const activeCampaignsRaw = await db
    .select({
      job: jobs
    })
    .from(jobs)
    .where(and(eq(jobs.brandId, brandId), eq(jobs.status, "open")))
    .orderBy(desc(jobs.createdAt))
    .limit(4);

  // Applicant count per active campaign.
  const activeCampaignIds = activeCampaignsRaw.map((r) => r.job.id);
  const perJobApplicantCounts = activeCampaignIds.length
    ? await db
        .select({
          jobId: jobApplications.jobId,
          count: sql<number>`count(*)::int`
        })
        .from(jobApplications)
        .where(inArray(jobApplications.jobId, activeCampaignIds))
        .groupBy(jobApplications.jobId)
    : [];
  const applicantCountByJob = new Map(perJobApplicantCounts.map((r) => [r.jobId, r.count]));

  const activeCampaigns = activeCampaignsRaw.map(({ job }) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    platform: (typeof job.deliverables[0]?.platform === "string" ? job.deliverables[0].platform : "Multi") as string,
    budget:
      job.budgetMinCents && job.budgetMaxCents
        ? `$${(job.budgetMinCents / 100).toLocaleString()}–$${(job.budgetMaxCents / 100).toLocaleString()}`
        : "Budget pending",
    deadline: job.deadline?.toISOString() ?? null,
    status: job.status,
    applicantsCount: applicantCountByJob.get(job.id) ?? 0
  }));

  // Shortlisted creators on this brand's jobs. Left-join aggregates so we
  // can render reach + engagement on the dashboard without a second query.
  const shortlistedRaw = brandJobIds.length
    ? await db
        .select({
          creator: creators,
          aggregate: creatorAggregates,
          application: jobApplications
        })
        .from(jobApplications)
        .innerJoin(creators, eq(creators.id, jobApplications.creatorId))
        .leftJoin(creatorAggregates, eq(creatorAggregates.creatorId, creators.id))
        .where(and(inArray(jobApplications.jobId, brandJobIds), eq(jobApplications.status, "shortlisted")))
        .orderBy(desc(jobApplications.updatedAt))
        .limit(4)
    : [];

  const shortlisted = shortlistedRaw.map(({ creator, aggregate }) => ({
    id: creator.id,
    handle: creator.handle,
    name: creator.displayName,
    bio: creator.bio ?? "",
    niche: creator.niches[0] ?? "Multi",
    location: creator.location ?? "—",
    avatar: creator.avatarUrl,
    verified: creator.verified,
    totalFollowers: aggregate?.totalReach ?? 0,
    engagementRate: aggregate ? Number(aggregate.weightedEngagement) : 0,
    ratePerPost: creator.baseRateCents ? Math.round(creator.baseRateCents / 100) : 0
  }));

  // Recent threads where this brand's member is a participant.
  const recentThreads = await db
    .select({
      thread: messageThreads,
      lastMessage: sql<string | null>`(
        select body from ${messages}
        where ${messages.threadId} = ${messageThreads.id}
        order by ${messages.createdAt} desc
        limit 1
      )`.as("lastMessage")
    })
    .from(messageThreads)
    .innerJoin(threadParticipants, eq(threadParticipants.threadId, messageThreads.id))
    .where(eq(threadParticipants.userId, member.userId))
    .orderBy(desc(messageThreads.lastMessageAt))
    .limit(3);

  // For each thread, identify the OTHER participant for display.
  const threadIds = recentThreads.map((r) => r.thread.id);
  const others = threadIds.length
    ? await db
        .select({
          threadId: threadParticipants.threadId,
          name: users.email
        })
        .from(threadParticipants)
        .innerJoin(users, eq(users.id, threadParticipants.userId))
        .where(
          and(inArray(threadParticipants.threadId, threadIds), sql`${threadParticipants.userId} != ${member.userId}`)
        )
    : [];
  const otherByThread = new Map(others.map((o) => [o.threadId, o.name]));

  const recentMessages = recentThreads.map(({ thread, lastMessage }) => ({
    id: thread.id,
    participantName: otherByThread.get(thread.id) ?? "—",
    lastMessage: lastMessage ?? ""
  }));

  // Recent audit activity for this brand's member.
  const recentAuditRaw = await db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.userId, member.userId),
        inArray(auditLogs.action, ["job.create", "job_application.update_status", "job.apply", "platform.connect"])
      )
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(5);

  const recentActivity = recentAuditRaw.map((row) => ({
    kind:
      row.action === "job_application.update_status"
        ? ("shortlist" as const)
        : row.action === "job.apply"
          ? ("application" as const)
          : ("application" as const),
    title:
      row.action === "job.create"
        ? "Brief Posted"
        : row.action === "job_application.update_status"
          ? "Applicant Updated"
          : row.action === "job.apply"
            ? "New Application"
            : "Activity",
    body:
      typeof row.metadata === "object" && row.metadata
        ? Object.values(row.metadata).slice(0, 1).map(String).join(" ")
        : "",
    timeAgo: relativeTime(row.createdAt)
  }));

  return {
    stats: {
      activeCampaigns: campaignsCountRow?.count ?? 0,
      totalApplicants: totalApplicantsRow[0]?.count ?? 0,
      shortlisted: shortlistedCountRow[0]?.count ?? 0,
      totalSpendCents: 0 // TODO: replace once brief_payments lands
    },
    activeCampaigns,
    shortlisted,
    recentMessages,
    recentActivity
  };
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export async function updateBrand(db: Database, user: User, brandMember: BrandMember, input: BrandUpdateInput) {
  assertBrandAdmin(brandMember);

  const [updated] = await db
    .update(brands)
    .set({
      ...input,
      updatedAt: new Date()
    })
    .where(eq(brands.id, brandMember.brandId))
    .returning();

  if (!updated) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Brand not found" });
  }

  await writeAuditLog(db, {
    user,
    action: "brand.update",
    entityType: "brand",
    entityId: brandMember.brandId,
    metadata: { fields: Object.keys(input) }
  });

  return updated;
}
