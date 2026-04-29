import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  brands,
  jobApplications,
  jobs,
  messageThreads,
  threadParticipants,
  type BrandMember,
  type Creator,
  type User
} from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type JobListInput = {
  limit: number;
  niche?: string;
  minBudgetCents?: number;
  remote?: boolean;
};

export type JobCreateInput = {
  brandId: string;
  title: string;
  description: string;
  deliverables: Array<Record<string, unknown>>;
  niches: string[];
  minFollowers?: number;
  minEngagement?: string;
  budgetMinCents?: number;
  budgetMaxCents?: number;
  deadline?: Date;
  location?: string;
  remote: boolean;
  status: "draft" | "open";
};

export type JobApplyInput = {
  jobId: string;
  pitch: string;
  proposedRateCents?: number;
  attachments: Array<Record<string, unknown>>;
};

export async function listJobs(db: Database, input: JobListInput) {
  const filters = [
    eq(jobs.status, "open"),
    input.niche ? sql`${jobs.niches} @> ARRAY[${input.niche}]::text[]` : undefined,
    typeof input.minBudgetCents === "number" ? gte(jobs.budgetMaxCents, input.minBudgetCents) : undefined,
    typeof input.remote === "boolean" ? eq(jobs.remote, input.remote) : undefined
  ].filter(Boolean);

  return db
    .select({
      job: jobs,
      brand: brands
    })
    .from(jobs)
    .innerJoin(brands, eq(brands.id, jobs.brandId))
    .where(and(...filters))
    .orderBy(desc(jobs.createdAt))
    .limit(input.limit);
}

export async function getJobById(db: Database, id: string) {
  const [job] = await db
    .select({
      job: jobs,
      brand: brands
    })
    .from(jobs)
    .innerJoin(brands, eq(brands.id, jobs.brandId))
    .where(eq(jobs.id, id))
    .limit(1);

  return job ?? null;
}

export async function createJob(db: Database, user: User, member: BrandMember, input: JobCreateInput) {
  if (!["owner", "admin", "recruiter"].includes(member.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Recruiter access required to post jobs"
    });
  }

  const [created] = await db
    .insert(jobs)
    .values({
      brandId: input.brandId,
      postedById: user.id,
      title: input.title,
      description: input.description,
      deliverables: input.deliverables,
      niches: input.niches,
      minFollowers: input.minFollowers,
      minEngagement: input.minEngagement,
      budgetMinCents: input.budgetMinCents,
      budgetMaxCents: input.budgetMaxCents,
      deadline: input.deadline,
      location: input.location,
      remote: input.remote,
      status: input.status
    })
    .returning();

  if (!created) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to create job"
    });
  }

  await writeAuditLog(db, {
    user,
    action: "job.create",
    entityType: "job",
    entityId: created.id,
    metadata: { brandId: input.brandId, status: input.status }
  });

  return created;
}

export async function applyToJob(db: Database, user: User, creator: Creator, input: JobApplyInput) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, input.jobId)).limit(1);

  if (!job || job.status !== "open") {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Open job not found"
    });
  }

  const [existingApplication] = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.jobId, input.jobId), eq(jobApplications.creatorId, creator.id)))
    .limit(1);

  if (existingApplication) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "You already applied to this job"
    });
  }

  const [application] = await db
    .insert(jobApplications)
    .values({
      jobId: input.jobId,
      creatorId: creator.id,
      pitch: input.pitch,
      proposedRateCents: input.proposedRateCents,
      attachments: input.attachments
    })
    .returning();

  if (!application) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to apply to job"
    });
  }

  await db
    .update(jobs)
    .set({
      applicationCount: sql`${jobs.applicationCount} + 1`,
      updatedAt: new Date()
    })
    .where(eq(jobs.id, input.jobId));

  const [thread] = await db
    .insert(messageThreads)
    .values({
      type: "job",
      jobId: input.jobId
    })
    .returning();

  if (thread) {
    await db
      .insert(threadParticipants)
      .values([
        {
          threadId: thread.id,
          userId: user.id,
          role: "creator"
        },
        {
          threadId: thread.id,
          userId: job.postedById,
          role: "recruiter"
        }
      ])
      .onConflictDoNothing();
  }

  await writeAuditLog(db, {
    user,
    action: "job.apply",
    entityType: "job",
    entityId: input.jobId,
    metadata: { applicationId: application.id, threadId: thread?.id ?? null }
  });

  return {
    application,
    thread: thread ?? null
  };
}
