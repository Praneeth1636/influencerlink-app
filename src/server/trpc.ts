import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
import { z } from "zod";
import { requireBrandMember, requireUser } from "@/lib/auth/rbac";
import { db as defaultDb } from "@/lib/db/client";
import { brandMembers, creators, users, type BrandMember, type Creator, type User } from "@/lib/db/schema";
import { enforceRateLimit, type RateLimitKind } from "@/lib/rate-limit";
import { formatTRPCError, toTRPCError } from "@/server/trpc-errors";

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
  transformer: superjson,
  errorFormatter({ error, shape }) {
    return formatTRPCError({ error, shape });
  }
});

const brandProcedureInput = z.object({
  brandId: z.string().uuid()
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const errorBoundaryMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    throw toTRPCError(error);
  }
});

function rateLimitProcedure(kind: RateLimitKind) {
  return t.middleware(async ({ ctx, path, next }) => {
    const result = await enforceRateLimit({
      kind,
      userId: ctx.user?.id,
      headers: ctx.headers,
      path
    });

    if (!result.success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Try again after ${new Date(result.reset).toISOString()}.`
      });
    }

    return next();
  });
}

const readRateLimit = rateLimitProcedure("read");
const writeRateLimit = rateLimitProcedure("write");
const aiRateLimit = rateLimitProcedure("ai");

const authMiddleware = t.middleware(async ({ ctx, next }) => {
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

const creatorMiddleware = t.middleware(async ({ ctx, next }) => {
  const user = ctx.user;
  let creator = ctx.creator;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required"
    });
  }

  if (!creator) {
    [creator] = await ctx.db.select().from(creators).where(eq(creators.userId, user.id)).limit(1);
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
      user,
      creator
    }
  });
});

const brandMiddleware = t.middleware(async ({ ctx, input, next }) => {
  const { brandId } = brandProcedureInput.parse(input);
  const user = ctx.user;

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required"
    });
  }

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

const baseProcedure = t.procedure.use(errorBoundaryMiddleware);

export const publicProcedure = baseProcedure.use(readRateLimit);
export const protectedProcedure = publicProcedure.use(authMiddleware);
export const protectedWriteProcedure = baseProcedure.use(writeRateLimit).use(authMiddleware);
export const creatorProcedure = protectedProcedure.use(creatorMiddleware);
export const creatorWriteProcedure = protectedWriteProcedure.use(creatorMiddleware);
export const brandProcedure = protectedProcedure.input(brandProcedureInput).use(brandMiddleware);
export const brandWriteProcedure = protectedWriteProcedure.input(brandProcedureInput).use(brandMiddleware);
export const aiProcedure = baseProcedure.use(aiRateLimit).use(authMiddleware);
