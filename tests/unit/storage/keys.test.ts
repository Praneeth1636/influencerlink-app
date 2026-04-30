import { describe, expect, it } from "vitest";
import { ALLOWED_MIME_BY_KIND, buildStorageKey, isAllowedContentType, MAX_BYTES_BY_KIND } from "@/lib/storage/keys";

describe("storage/keys", () => {
  it("builds a creator-scoped key with the right extension", () => {
    const key = buildStorageKey("avatar", { kind: "creator", id: "creator-1" }, "image/jpeg");
    expect(key.startsWith("creator/creator-1/avatar/")).toBe(true);
    expect(key.endsWith(".jpg")).toBe(true);
  });

  it("scopes message attachments under the user", () => {
    const key = buildStorageKey("message-attachment", { kind: "user", id: "user-1" }, "application/pdf");
    expect(key.startsWith("user/user-1/message-attachment/")).toBe(true);
    expect(key.endsWith(".pdf")).toBe(true);
  });

  it("rejects content types not whitelisted for the kind", () => {
    expect(isAllowedContentType("avatar", "image/png")).toBe(true);
    expect(isAllowedContentType("avatar", "video/mp4")).toBe(false);
    expect(isAllowedContentType("post-media", "video/mp4")).toBe(true);
    expect(isAllowedContentType("avatar", "application/pdf")).toBe(false);
  });

  it("exposes per-kind size caps that match the documented contract", () => {
    expect(MAX_BYTES_BY_KIND.avatar).toBe(5 * 1024 * 1024);
    expect(MAX_BYTES_BY_KIND.cover).toBe(8 * 1024 * 1024);
    expect(MAX_BYTES_BY_KIND["post-media"]).toBe(25 * 1024 * 1024);
    expect(ALLOWED_MIME_BY_KIND.avatar.length).toBeGreaterThan(0);
  });
});
