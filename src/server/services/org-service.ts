import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { brandMembers, type BrandMember, type User } from "@/lib/db/schema";
import type { BrandRole } from "@/lib/auth/rbac";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

const ADMIN_ROLES = new Set(["owner", "admin"]);

function assertOrgAdmin(member: BrandMember) {
  if (!ADMIN_ROLES.has(member.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Requires admin role or higher"
    });
  }
}

export async function inviteBrandMember(
  db: Database,
  user: User,
  brandMember: BrandMember,
  input: { userId: string; role: BrandRole }
) {
  assertOrgAdmin(brandMember);

  const [created] = await db
    .insert(brandMembers)
    .values({
      brandId: brandMember.brandId,
      userId: input.userId,
      role: input.role,
      invitedBy: user.id
    })
    .returning();

  await writeAuditLog(db, {
    user,
    action: "org.invite",
    entityType: "brand",
    entityId: brandMember.brandId,
    metadata: { invitedUserId: input.userId, role: input.role }
  });

  return created;
}

export async function removeBrandMember(db: Database, user: User, brandMember: BrandMember, input: { userId: string }) {
  assertOrgAdmin(brandMember);

  await db
    .delete(brandMembers)
    .where(and(eq(brandMembers.brandId, brandMember.brandId), eq(brandMembers.userId, input.userId)));

  await writeAuditLog(db, {
    user,
    action: "org.remove_member",
    entityType: "brand",
    entityId: brandMember.brandId,
    metadata: { removedUserId: input.userId }
  });

  return { removed: true };
}

export async function updateBrandMemberRole(
  db: Database,
  user: User,
  brandMember: BrandMember,
  input: { userId: string; role: BrandRole }
) {
  assertOrgAdmin(brandMember);

  const [updated] = await db
    .update(brandMembers)
    .set({ role: input.role })
    .where(and(eq(brandMembers.brandId, brandMember.brandId), eq(brandMembers.userId, input.userId)))
    .returning();

  await writeAuditLog(db, {
    user,
    action: "org.update_role",
    entityType: "brand",
    entityId: brandMember.brandId,
    metadata: { memberUserId: input.userId, role: input.role }
  });

  return updated ?? null;
}
