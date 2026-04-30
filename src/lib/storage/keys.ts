// Stable storage key generation. Keys live forever — never include mutable
// data (current display name, current handle) in them. The creator id and a
// random uuid are the only identity fields.

import { randomUUID } from "node:crypto";

export type UploadKind = "avatar" | "cover" | "post-media" | "message-attachment";

export type UploadOwner =
  | { kind: "creator"; id: string }
  | { kind: "brand"; id: string }
  | { kind: "user"; id: string };

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const ALLOWED_VIDEO_MIME = ["video/mp4", "video/webm"] as const;

export const ALLOWED_MIME_BY_KIND: Record<UploadKind, readonly string[]> = {
  avatar: ALLOWED_IMAGE_MIME,
  cover: ALLOWED_IMAGE_MIME,
  "post-media": [...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME],
  "message-attachment": [...ALLOWED_IMAGE_MIME, ...ALLOWED_VIDEO_MIME, "application/pdf"]
};

export const MAX_BYTES_BY_KIND: Record<UploadKind, number> = {
  avatar: 5 * 1024 * 1024, // 5 MB
  cover: 8 * 1024 * 1024, // 8 MB
  "post-media": 25 * 1024 * 1024, // 25 MB
  "message-attachment": 25 * 1024 * 1024
};

export function buildStorageKey(kind: UploadKind, owner: UploadOwner, contentType: string): string {
  const ext = extensionFor(contentType);
  const id = randomUUID();
  return `${owner.kind}/${owner.id}/${kind}/${id}${ext}`;
}

export function isAllowedContentType(kind: UploadKind, contentType: string): boolean {
  return ALLOWED_MIME_BY_KIND[kind].includes(contentType);
}

function extensionFor(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}
