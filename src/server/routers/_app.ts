import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true,
    service: "creatorlink-trpc"
  }))
});

export type AppRouter = typeof appRouter;
