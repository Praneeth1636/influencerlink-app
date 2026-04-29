import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { brands, type Brand, type BrandMember, type User } from "@/lib/db/schema";
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
