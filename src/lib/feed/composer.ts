export const feedPostTypes = [
  {
    value: "update",
    label: "Update",
    description: "Share a creator win, campaign thought, or work note."
  },
  {
    value: "milestone",
    label: "Milestone",
    description: "Post a structured growth moment like follower, reach, or campaign proof."
  },
  {
    value: "content_drop",
    label: "Content drop",
    description: "Share a new video, post, launch, or content sample."
  },
  {
    value: "open_to_work",
    label: "Open to collabs",
    description: "Signal availability and update your profile collaboration status."
  },
  {
    value: "job_share",
    label: "Job share",
    description: "Brand-only repost for an active brief."
  }
] as const;

export type FeedPostType = (typeof feedPostTypes)[number]["value"];

export type ComposerDraft = {
  body: string;
  type: FeedPostType;
  visibility: "public" | "connections";
  sourceUrl?: string;
};

export type ComposerValidation = {
  ok: boolean;
  message: string | null;
};

export function validateComposerDraft(draft: ComposerDraft): ComposerValidation {
  const body = draft.body.trim();

  if (body.length < 8) {
    return {
      ok: false,
      message: "Write at least 8 characters before posting."
    };
  }

  if (body.length > 3_000) {
    return {
      ok: false,
      message: "Posts must stay under 3,000 characters."
    };
  }

  if (draft.type === "content_drop" && draft.sourceUrl && !isValidUrl(draft.sourceUrl)) {
    return {
      ok: false,
      message: "Content links need to be valid URLs."
    };
  }

  if (draft.type === "job_share") {
    return {
      ok: false,
      message: "Job shares are brand-only and will unlock from the brand portal."
    };
  }

  return {
    ok: true,
    message: null
  };
}

export function buildComposerPayload(draft: ComposerDraft) {
  const sourceUrl = draft.sourceUrl?.trim();

  return {
    body: draft.body.trim(),
    type: draft.type,
    visibility: draft.visibility,
    mediaJson:
      draft.type === "content_drop" && sourceUrl
        ? [
            {
              kind: "external_link",
              url: sourceUrl
            }
          ]
        : []
  };
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
