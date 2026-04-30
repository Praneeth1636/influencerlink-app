import { z } from "zod";
import { createTRPCRouter, protectedWriteProcedure } from "@/server/trpc";
import { requestUpload } from "@/server/services/storage-service";

export const uploadKindSchema = z.enum(["avatar", "cover", "post-media", "message-attachment"]);

export const storageRouter = createTRPCRouter({
  requestUpload: protectedWriteProcedure
    .input(
      z.object({
        kind: uploadKindSchema,
        contentType: z.string().min(1).max(120),
        contentLength: z.number().int().positive()
      })
    )
    .mutation(({ ctx, input }) => requestUpload(ctx.db, ctx.user, input))
});
