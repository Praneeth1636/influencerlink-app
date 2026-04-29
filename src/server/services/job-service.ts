import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  brands,
  creatorAggregates,
  creators,
  jobApplications,
  jobSavedByCreator,
  jobs,
  messageThreads,
  threadParticipants,
  type BrandMember,
  type Creator,
  type User
} from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";
import { assertQuotaAvailable } from "./billing-service";
import { createNotification } from "./notification-service";

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

export type JobApplicantListInput = {
  brandId: string;
  jobId: string;
};

export type JobApplicationStatus = "submitted" | "shortlisted" | "rejected" | "hired";

export type JobApplicationStatusInput = {
  brandId: string;
  applicationId: string;
  status: JobApplicationStatus;
};

export type JobSaveInput = {
  jobId: string;
};

function assertRecruiterAccess(member: BrandMember) {
  if (!["owner", "admin", "recruiter"].includes(member.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Recruiter access required"
    });
  }
}

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
  assertRecruiterAccess(member);
  await assertQuotaAvailable(db, { user, brandId: input.brandId }, "jobsPosted");

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

export async function listJobApplicants(db: Database, _user: User, member: BrandMember, input: JobApplicantListInput) {
  assertRecruiterAccess(member);

  const [job] = await db
    .select({
      job: jobs,
      brand: brands
    })
    .from(jobs)
    .innerJoin(brands, eq(brands.id, jobs.brandId))
    .where(and(eq(jobs.id, input.jobId), eq(jobs.brandId, input.brandId)))
    .limit(1);

  if (!job) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Brand job not found"
    });
  }

  const applicants = await db
    .select({
      application: jobApplications,
      creator: creators,
      aggregate: creatorAggregates
    })
    .from(jobApplications)
    .innerJoin(creators, eq(creators.id, jobApplications.creatorId))
    .leftJoin(creatorAggregates, eq(creatorAggregates.creatorId, creators.id))
    .where(eq(jobApplications.jobId, input.jobId))
    .orderBy(desc(jobApplications.createdAt));

  return {
    ...job,
    applicants
  };
}

export async function updateJobApplicationStatus(
  db: Database,
  user: User,
  member: BrandMember,
  input: JobApplicationStatusInput
) {
  assertRecruiterAccess(member);

  const [application] = await db
    .select({
      application: jobApplications,
      job: jobs,
      creator: creators
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(creators, eq(creators.id, jobApplications.creatorId))
    .where(and(eq(jobApplications.id, input.applicationId), eq(jobs.brandId, input.brandId)))
    .limit(1);

  if (!application) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found for this brand"
    });
  }

  const [updated] = await db
    .update(jobApplications)
    .set({
      status: input.status,
      updatedAt: new Date()
    })
    .where(eq(jobApplications.id, input.applicationId))
    .returning();

  if (!updated) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to update application"
    });
  }

  await writeAuditLog(db, {
    user,
    action: "job_application.update_status",
    entityType: "job_application",
    entityId: input.applicationId,
    metadata: { jobId: application.job.id, brandId: input.brandId, status: input.status }
  });

  if (application.application.status !== input.status) {
    await createNotification(db, {
      userId: application.creator.userId,
      type: "job_application.status_updated",
      actorId: user.id,
      entityType: "job_application",
      entityId: input.applicationId
    });
  }

  return updated;
}

export async function listCreatorJobWorkspace(db: Database, _user: User, creator: Creator) {
  const applications = await db
    .select({
      application: jobApplications,
      job: jobs,
      brand: brands
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobs.id, jobApplications.jobId))
    .innerJoin(brands, eq(brands.id, jobs.brandId))
    .where(eq(jobApplications.creatorId, creator.id))
    .orderBy(desc(jobApplications.createdAt));

  const savedJobs = await db
    .select({
      saved: jobSavedByCreator,
      job: jobs,
      brand: brands
    })
    .from(jobSavedByCreator)
    .innerJoin(jobs, eq(jobs.id, jobSavedByCreator.jobId))
    .innerJoin(brands, eq(brands.id, jobs.brandId))
    .where(eq(jobSavedByCreator.creatorId, creator.id))
    .orderBy(desc(jobSavedByCreator.savedAt));

  return {
    applications,
    savedJobs
  };
}

export async function saveJob(db: Database, user: User, creator: Creator, input: JobSaveInput) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, input.jobId)).limit(1);

  if (!job || job.status !== "open") {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Open job not found"
    });
  }

  await db
    .insert(jobSavedByCreator)
    .values({
      jobId: input.jobId,
      creatorId: creator.id
    })
    .onConflictDoNothing({
      target: [jobSavedByCreator.jobId, jobSavedByCreator.creatorId]
    });

  await writeAuditLog(db, {
    user,
    action: "job.save",
    entityType: "job",
    entityId: input.jobId,
    metadata: { creatorId: creator.id }
  });

  return {
    jobId: input.jobId,
    saved: true
  };
}

export async function unsaveJob(db: Database, user: User, creator: Creator, input: JobSaveInput) {
  await db
    .delete(jobSavedByCreator)
    .where(and(eq(jobSavedByCreator.jobId, input.jobId), eq(jobSavedByCreator.creatorId, creator.id)));

  await writeAuditLog(db, {
    user,
    action: "job.unsave",
    entityType: "job",
    entityId: input.jobId,
    metadata: { creatorId: creator.id }
  });

  return {
    jobId: input.jobId,
    saved: false
  };
}

export async function applyToJob(db: Database, user: User, creator: Creator, input: JobApplyInput) {
  await assertQuotaAvailable(db, { user, creator }, "applications");

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

  await createNotification(db, {
    userId: job.postedById,
    type: "job_application.submitted",
    actorId: user.id,
    entityType: "job_application",
    entityId: application.id
  });

  return {
    application,
    thread: thread ?? null
  };
}
