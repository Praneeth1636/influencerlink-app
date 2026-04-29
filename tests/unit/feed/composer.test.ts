import { describe, expect, it } from "vitest";
import { buildComposerPayload, validateComposerDraft, type ComposerDraft } from "@/lib/feed/composer";

const baseDraft: ComposerDraft = {
  body: "Just crossed 500K followers with a verified beauty audience.",
  type: "milestone",
  visibility: "public",
  sourceUrl: ""
};

describe("feed composer helpers", () => {
  it("validates a normal creator post", () => {
    expect(validateComposerDraft(baseDraft)).toEqual({
      ok: true,
      message: null
    });
  });

  it("rejects short posts and brand-only job shares", () => {
    expect(validateComposerDraft({ ...baseDraft, body: "tiny" })).toMatchObject({
      ok: false
    });
    expect(validateComposerDraft({ ...baseDraft, type: "job_share" })).toMatchObject({
      ok: false,
      message: "Job shares are brand-only and will unlock from the brand portal."
    });
  });

  it("turns content links into media payload items", () => {
    const payload = buildComposerPayload({
      ...baseDraft,
      type: "content_drop",
      sourceUrl: "https://www.tiktok.com/@creator/video/123"
    });

    expect(payload).toMatchObject({
      body: baseDraft.body,
      type: "content_drop",
      visibility: "public",
      mediaJson: [
        {
          kind: "external_link",
          url: "https://www.tiktok.com/@creator/video/123"
        }
      ]
    });
  });

  it("rejects malformed content links", () => {
    expect(
      validateComposerDraft({
        ...baseDraft,
        type: "content_drop",
        sourceUrl: "not-a-url"
      })
    ).toMatchObject({
      ok: false,
      message: "Content links need to be valid URLs."
    });
  });
});
