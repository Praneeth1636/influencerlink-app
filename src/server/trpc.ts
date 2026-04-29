import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
import { z } from "zod";
import { requireBrandMember, requireCreator, requireUser } from "@/lib/auth/rbac";
import { db as defaultDb } from "@/lib/db/client";
import { brandMembers, creators, users, type BrandMember, type Creator, type User } from "@/lib/db/schema";

export type Database = typeof defaultDb;

export type CreateTRPCContextOptions = {
  headers: Headers;
  db?: Database;
  user?: User | null;
  brandId?: string;
};

export type TRPCContext = {
  headers: Headers;
  db: Database;
  user: User | null;
  brandId?: string;
  creator?: Creator;
  brandMember?: BrandMember;
};

export async function createTRPCContext(options: CreateTRPCContextOptions): Promise<TRPCContext> {
  const database = options.db ?? defaultDb;
  let user = options.user;

  if (typeof user === "undefined") {
    const { userId } = await auth();
    if (userId) {
      const [row] = await database.select().from(users).where(eq(users.clerkId, userId)).limit(1);
      user = row ?? null;
    } else {
      user = null;
    }
  }

  return {
    headers: options.headers,
    db: database,
    user,
    brandId: options.brandId
  };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson
});

const brandProcedureInput = z.object({
  brandId: z.string().uuid()
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  let user = ctx.user;

  if (typeof user === "undefined") {
    try {
      user = await requireUser();
    } catch {
      user = null;
    }
  }

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required"
    });
  }

  return next({
    ctx: {
      ...ctx,
      user
    }
  });
});

export const creatorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  let creator = ctx.creator;

  if (!creator && ctx.user) {
    [creator] = await ctx.db.select().from(creators).where(eq(creators.userId, ctx.user.id)).limit(1);
  } else if (!creator) {
    ({ creator } = await requireCreator());
  }

  if (!creator) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Creator account required"
    });
  }

  return next({
    ctx: {
      ...ctx,
      creator
    }
  });
});

export const brandProcedure = protectedProcedure.input(brandProcedureInput).use(async ({ ctx, input, next }) => {
  const { brandId } = brandProcedureInput.parse(input);
  const user = ctx.user ?? (await requireUser());

  let member = ctx.brandMember?.brandId === brandId && ctx.brandMember.userId === user.id ? ctx.brandMember : undefined;

  if (!member) {
    [member] = await ctx.db
      .select()
      .from(brandMembers)
      .where(and(eq(brandMembers.brandId, brandId), eq(brandMembers.userId, user.id)))
      .limit(1);
  }

  if (!member) {
    ({ member } = await requireBrandMember(brandId));
  }

  return next({
    ctx: {
      ...ctx,
      brandId,
      brandMember: member,
      user
    }
  });
});
