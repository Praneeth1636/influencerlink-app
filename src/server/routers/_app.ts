import { createTRPCRouter, publicProcedure } from "@/server/trpc";
import { billingRouter } from "./billing";
import { brandRouter } from "./brand";
import { creatorRouter } from "./creator";
import { followRouter } from "./follow";
import { inboxRouter } from "./inbox";
import { jobRouter } from "./job";
import { notificationRouter } from "./notification";
import { matchRouter } from "./match";
import { orgRouter } from "./org";
import { postRouter } from "./post";
import { storageRouter } from "./storage";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    ok: true,
    service: "creatorlink-trpc"
  })),
  creator: creatorRouter,
  post: postRouter,
  follow: followRouter,
  inbox: inboxRouter,
  job: jobRouter,
  notification: notificationRouter,
  brand: brandRouter,
  org: orgRouter,
  billing: billingRouter,
  storage: storageRouter,
  match: matchRouter
});

export type AppRouter = typeof appRouter;
