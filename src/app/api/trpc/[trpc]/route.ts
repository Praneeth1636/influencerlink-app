import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { handleTRPCError } from "@/server/trpc-errors";
import { createTRPCContext } from "@/server/trpc";

function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: request.headers
      }),
    onError({ error, path, type, ctx }) {
      handleTRPCError({ error, path, type, ctx });
    }
  });
}

export { handler as GET, handler as POST };
