import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { brandMembers, creators, postComments, postLikes, postShares, posts, type User } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type CreatePostInput = {
  authorType: "creator" | "brand";
  brandId?: string;
  body: string;
  mediaJson: Array<Record<string, unknown>>;
  type: "update" | "milestone" | "content_drop" | "open_to_work" | "job_share";
  visibility: "public" | "connections";
};

export type PostListInput = {
  limit: number;
  cursor?: string;
  authorType?: "creator" | "brand";
  authorId?: string;
};

export async function createPost(db: Database, user: User, input: CreatePostInput) {
  let authorId = input.brandId;

  if (input.authorType === "creator") {
    const [creator] = await db.select().from(creators).where(eq(creators.userId, user.id)).limit(1);
    if (!creator) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Creator profile required to post as creator" });
    }
    authorId = creator.id;
  }

  if (input.authorType === "brand") {
    if (!input.brandId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "brandId is required for brand posts" });
    }

    const [membership] = await db
      .select()
      .from(brandMembers)
      .where(and(eq(brandMembers.brandId, input.brandId), eq(brandMembers.userId, user.id)))
      .limit(1);

    if (!membership) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Brand membership required to post as brand" });
    }
  }

  const [created] = await db
    .insert(posts)
    .values({
      authorType: input.authorType,
      authorId: authorId!,
      body: input.body,
      mediaJson: input.mediaJson,
      type: input.type,
      visibility: input.visibility
    })
    .returning();

  await writeAuditLog(db, {
    user,
    action: "post.create",
    entityType: "post",
    entityId: created.id,
    metadata: { authorType: input.authorType }
  });

  return created;
}

export async function listPosts(db: Database, input: PostListInput) {
  const filters = [
    input.cursor ? eq(posts.id, input.cursor) : undefined,
    input.authorType ? eq(posts.authorType, input.authorType) : undefined,
    input.authorId ? eq(posts.authorId, input.authorId) : undefined
  ].filter(Boolean);

  return db
    .select()
    .from(posts)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(posts.createdAt))
    .limit(input.limit);
}

export async function likePost(db: Database, user: User, postId: string) {
  await db.insert(postLikes).values({ postId, userId: user.id }).onConflictDoNothing();
  await writeAuditLog(db, { user, action: "post.like", entityType: "post", entityId: postId });
  return { postId, liked: true };
}

export async function unlikePost(db: Database, user: User, postId: string) {
  await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)));
  await writeAuditLog(db, { user, action: "post.unlike", entityType: "post", entityId: postId });
  return { postId, liked: false };
}

export async function commentOnPost(
  db: Database,
  user: User,
  input: { postId: string; body: string; parentId?: string }
) {
  const [comment] = await db
    .insert(postComments)
    .values({
      postId: input.postId,
      userId: user.id,
      body: input.body,
      parentId: input.parentId
    })
    .returning();

  await writeAuditLog(db, {
    user,
    action: "post.comment",
    entityType: "post",
    entityId: input.postId,
    metadata: { commentId: comment.id }
  });

  return comment;
}

export async function sharePost(db: Database, user: User, input: { postId: string; body?: string }) {
  const [share] = await db
    .insert(postShares)
    .values({
      postId: input.postId,
      userId: user.id,
      body: input.body
    })
    .returning();

  await writeAuditLog(db, {
    user,
    action: "post.share",
    entityType: "post",
    entityId: input.postId,
    metadata: { shareId: share.id }
  });

  return share;
}
