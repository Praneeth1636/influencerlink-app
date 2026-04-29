import { describe, expect, it } from "vitest";
import { addCommentState, addShareState, buildInitialInteractionState, toggleLikeState } from "@/lib/feed/interactions";

describe("feed interaction helpers", () => {
  it("builds stable starting counters from a post id", () => {
    const first = buildInitialInteractionState("00000000-0000-4000-8000-000000005000");
    const second = buildInitialInteractionState("00000000-0000-4000-8000-000000005000");

    expect(first).toEqual(second);
    expect(first.likeCount).toBeGreaterThan(0);
    expect(first.liked).toBe(false);
  });

  it("optimistically toggles likes without going negative", () => {
    const liked = toggleLikeState({
      liked: false,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0
    });

    expect(liked).toMatchObject({ liked: true, likeCount: 1 });
    expect(toggleLikeState(liked)).toMatchObject({ liked: false, likeCount: 0 });
  });

  it("increments comment and share counters", () => {
    const state = buildInitialInteractionState("post");

    expect(addCommentState(state).commentCount).toBe(state.commentCount + 1);
    expect(addShareState(state).shareCount).toBe(state.shareCount + 1);
  });
});
