import { z } from "zod";
import { brandWriteProcedure, createTRPCRouter } from "@/server/trpc";
import { inviteBrandMember, removeBrandMember, updateBrandMemberRole } from "@/server/services/org-service";

const brandRoleInput = z.enum(["owner", "admin", "recruiter", "viewer"]);

export const orgRouter = createTRPCRouter({
  invite: brandWriteProcedure
    .input(
      z.object({
        brandId: z.string().uuid(),
        userId: z.string().uuid(),
        role: brandRoleInput.default("viewer")
      })
    )
    .mutation(({ ctx, input }) => inviteBrandMember(ctx.db, ctx.user, ctx.brandMember, input)),

  removeMember: brandWriteProcedure
    .input(
      z.object({
        brandId: z.string().uuid(),
        userId: z.string().uuid()
      })
    )
    .mutation(({ ctx, input }) => removeBrandMember(ctx.db, ctx.user, ctx.brandMember, input)),

  updateRole: brandWriteProcedure
    .input(
      z.object({
        brandId: z.string().uuid(),
        userId: z.string().uuid(),
        role: brandRoleInput
      })
    )
    .mutation(({ ctx, input }) => updateBrandMemberRole(ctx.db, ctx.user, ctx.brandMember, input))
});
