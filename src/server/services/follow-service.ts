import { and, desc, eq } from "drizzle-orm";
import { follows, type User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type FollowTargetInput = {
  followedType: "creator" | "brand";
  followedId: string;
};

export async function followTarget(db: Database, user: User, input: FollowTargetInput) {
  const [follow] = await db
    .insert(follows)
    .values({
      followerId: user.id,
      followedType: input.followedType,
      followedId: input.followedId
    })
    .returning();

  await writeAuditLog(db, {
    user,
    action: "follow.create",
    entityType: input.followedType,
    entityId: input.followedId
  });

  return follow;
}

export async function unfollowTarget(db: Database, user: User, input: FollowTargetInput) {
  await db
    .delete(follows)
    .where(
      and(
        eq(follows.followerId, user.id),
        eq(follows.followedType, input.followedType),
        eq(follows.followedId, input.followedId)
      )
    );

  await writeAuditLog(db, {
    user,
    action: "follow.delete",
    entityType: input.followedType,
    entityId: input.followedId
  });

  return { following: false };
}

export async function listFollowers(db: Database, input: FollowTargetInput & { limit: number }) {
  return db
    .select()
    .from(follows)
    .where(and(eq(follows.followedType, input.followedType), eq(follows.followedId, input.followedId)))
    .orderBy(desc(follows.createdAt))
    .limit(input.limit);
}

export async function listFollowing(db: Database, input: { userId: string; limit: number }) {
  return db
    .select()
    .from(follows)
    .where(eq(follows.followerId, input.userId))
    .orderBy(desc(follows.createdAt))
    .limit(input.limit);
}
