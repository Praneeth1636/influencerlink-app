import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { brandMembers, brands, jobs, posts, users, type Brand, type BrandMember, type User } from "@/lib/db/schema";
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
