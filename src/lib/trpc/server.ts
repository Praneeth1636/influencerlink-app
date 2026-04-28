import { cache } from "react";
import { headers } from "next/headers";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory, createTRPCContext } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

export const createTRPCServerCaller = cache(async () => {
  const requestHeaders = new Headers(await headers());
  const context = await createTRPCContext({
    headers: requestHeaders
  });

  return createCaller(context);
});
