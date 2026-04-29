export type FeedInteractionState = {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
};

export function buildInitialInteractionState(postId: string): FeedInteractionState {
  const score = stableScore(postId);

  return {
    liked: false,
    likeCount: 12 + (score % 88),
    commentCount: 2 + (score % 18),
    shareCount: score % 12
  };
}

export function toggleLikeState(state: FeedInteractionState): FeedInteractionState {
  return {
    ...state,
    liked: !state.liked,
    likeCount: Math.max(0, state.likeCount + (state.liked ? -1 : 1))
  };
}

export function addCommentState(state: FeedInteractionState): FeedInteractionState {
  return {
    ...state,
    commentCount: state.commentCount + 1
  };
}

export function addShareState(state: FeedInteractionState): FeedInteractionState {
  return {
    ...state,
    shareCount: state.shareCount + 1
  };
}

function stableScore(value: string) {
  return [...value].reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 1), 0);
}
