import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { brandMembers, creators, users, type Creator, type User } from "@/lib/db/schema";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";

export const BRAND_ROLES = ["viewer", "recruiter", "admin", "owner"] as const;
export type BrandRole = (typeof BRAND_ROLES)[number];

const ROLE_PRIORITY: Record<BrandRole, number> = {
  viewer: 0,
  recruiter: 1,
  admin: 2,
  owner: 3
};

/**
 * Returns the users row for the current Clerk session. Throws
 * UnauthorizedError if no session, NotFoundError if no matching row.
 */
export async function requireUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const [row] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (!row) {
    throw new NotFoundError("User row not found for current session");
  }
  return row;
}

/**
 * Asserts the current user is a creator. Returns the joined users + creators
 * rows. Throws ForbiddenError if account type is not "creator", NotFoundError
 * if the creators row is missing.
 */
export async function requireCreator(): Promise<{ user: User; creator: Creator }> {
  const user = await requireUser();
  if (user.type !== "creator") {
    throw new ForbiddenError("Creator account required");
  }

  const [creator] = await db.select().from(creators).where(eq(creators.userId, user.id)).limit(1);
  if (!creator) {
    throw new NotFoundError("Creator profile not found");
  }
  return { user, creator };
}

/**
 * Asserts the current user is a member of the given brand with at least
 * `minRole`. Returns the users row and the brand membership row. Throws
 * ForbiddenError if not a member or role is below threshold.
 */
export async function requireBrandMember(brandId: string, minRole: BrandRole = "viewer") {
  const user = await requireUser();

  const [member] = await db
    .select()
    .from(brandMembers)
    .where(and(eq(brandMembers.brandId, brandId), eq(brandMembers.userId, user.id)))
    .limit(1);

  if (!member) {
    throw new ForbiddenError("Not a member of this brand");
  }

  if (ROLE_PRIORITY[member.role] < ROLE_PRIORITY[minRole]) {
    throw new ForbiddenError(`Requires ${minRole} role or higher`);
  }

  return { user, member };
}
