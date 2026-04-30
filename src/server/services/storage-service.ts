import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { creators, type User } from "@/lib/db/schema";
import {
  ALLOWED_MIME_BY_KIND,
  buildStorageKey,
  isAllowedContentType,
  MAX_BYTES_BY_KIND,
  type UploadKind,
  type UploadOwner
} from "@/lib/storage/keys";
import { presignPutUrl, StorageNotConfiguredError } from "@/lib/storage/r2";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

export type RequestUploadInput = {
  kind: UploadKind;
  contentType: string;
  contentLength: number;
};

export type UploadGrant = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresInSeconds: number;
};

const PRESIGN_TTL_SECONDS = 5 * 60;

export async function requestUpload(db: Database, user: User, input: RequestUploadInput): Promise<UploadGrant> {
  const { kind, contentType, contentLength } = input;

  if (!isAllowedContentType(kind, contentType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Content type ${contentType} not allowed for ${kind}. Allowed: ${ALLOWED_MIME_BY_KIND[kind].join(", ")}`
    });
  }

  const maxBytes = MAX_BYTES_BY_KIND[kind];
  if (contentLength <= 0 || contentLength > maxBytes) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Upload too large. Max ${Math.round(maxBytes / 1024 / 1024)} MB for ${kind}.`
    });
  }

  const owner = await resolveOwner(db, user, kind);
  const key = buildStorageKey(kind, owner, contentType);

  let upload: { url: string; publicUrl: string };
  try {
    upload = await presignPutUrl({ key, contentType, expiresInSeconds: PRESIGN_TTL_SECONDS });
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: err.message });
    }
    throw err;
  }

  await writeAuditLog(db, {
    user,
    action: "storage.request_upload",
    entityType: "upload",
    entityId: null,
    metadata: { kind, contentType, contentLength, key }
  });

  return {
    uploadUrl: upload.url,
    publicUrl: upload.publicUrl,
    key,
    expiresInSeconds: PRESIGN_TTL_SECONDS
  };
}

async function resolveOwner(db: Database, user: User, kind: UploadKind): Promise<UploadOwner> {
  // Avatar/cover always belong to a creator profile. Other uploads tie to the user.
  if (kind === "avatar" || kind === "cover") {
    const [creator] = await db.select({ id: creators.id }).from(creators).where(eq(creators.userId, user.id)).limit(1);
    if (!creator) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Complete creator onboarding before uploading avatar or cover"
      });
    }
    return { kind: "creator", id: creator.id };
  }

  return { kind: "user", id: user.id };
}
