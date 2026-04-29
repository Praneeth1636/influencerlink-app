import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { brandProcedure, createTRPCRouter, publicProcedure } from "@/server/trpc";
import { getBrandById, getBrandBySlug, updateBrand } from "@/server/services/brand-service";

const brandUpdateInput = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  tagline: z.string().max(180).nullable().optional(),
  about: z.string().max(4_000).nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  industry: z.string().max(80).nullable().optional(),
  sizeRange: z.string().max(80).nullable().optional(),
  hqLocation: z.string().max(120).nullable().optional()
});

export const brandRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => getBrandById(ctx.db, input.id)),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(2).max(80).toLowerCase() }))
    .query(({ ctx, input }) => getBrandBySlug(ctx.db, input.slug)),

  update: brandProcedure.input(brandUpdateInput).mutation(({ ctx, input }) => {
    const { brandId, ...patch } = input;
    if (ctx.brandId !== brandId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Brand context mismatch" });
    }
    return updateBrand(ctx.db, ctx.user, ctx.brandMember, patch);
  })
});
