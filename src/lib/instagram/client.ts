// Instagram Graph API client. Lean, no SDK — Meta's SDK lags the API and
// pulls in browser-shaped polyfills we don't need server-side.
//
// Flow we implement (Instagram Login, the post-2024 product):
//   1. Redirect user to /oauth/authorize with our app id + scopes + state
//   2. User authorizes → IG redirects back with ?code
//   3. POST /oauth/access_token → short-lived token (1 hour)
//   4. GET /access_token?grant_type=ig_exchange_token → long-lived (60 days)
//   5. GET /me?fields=... → profile + follower count
//   6. Periodically refresh the long-lived token before 60-day expiry
//
// Personal IG accounts can't return follower counts. Creators must have a
// Business or Creator account on IG — surfaced in the connect-failure copy.

const AUTH_URL = "https://api.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const GRAPH_URL = "https://graph.instagram.com";
const SCOPES = ["instagram_business_basic", "instagram_business_manage_insights"];

export class InstagramNotConfiguredError extends Error {
  constructor() {
    super("Instagram OAuth not configured — set INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI");
    this.name = "InstagramNotConfiguredError";
  }
}

function appConfig() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!appId || !appSecret || !redirectUri) throw new InstagramNotConfiguredError();
  return { appId, appSecret, redirectUri };
}

export function buildAuthorizeUrl(state: string): string {
  const { appId, redirectUri } = appConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(","),
    response_type: "code",
    state
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type ShortLivedToken = {
  access_token: string;
  user_id: string;
};

export async function exchangeCodeForShortToken(code: string): Promise<ShortLivedToken> {
  const { appId, appSecret, redirectUri } = appConfig();
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    throw new Error(`Instagram code exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as ShortLivedToken;
}

export type LongLivedToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export async function exchangeShortForLongToken(shortToken: string): Promise<LongLivedToken> {
  const { appSecret } = appConfig();
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: appSecret,
    access_token: shortToken
  });
  const res = await fetch(`${GRAPH_URL}/access_token?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Instagram long-token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as LongLivedToken;
}

export async function refreshLongToken(longToken: string): Promise<LongLivedToken> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: longToken
  });
  const res = await fetch(`${GRAPH_URL}/refresh_access_token?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Instagram refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as LongLivedToken;
}

export type IgProfile = {
  id: string;
  username: string;
  account_type: "BUSINESS" | "CREATOR" | "PERSONAL";
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
  biography?: string;
  profile_picture_url?: string;
};

export async function fetchProfile(accessToken: string): Promise<IgProfile> {
  const params = new URLSearchParams({
    fields: "id,username,account_type,media_count,followers_count,follows_count,biography,profile_picture_url",
    access_token: accessToken
  });
  const res = await fetch(`${GRAPH_URL}/me?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Instagram /me failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as IgProfile;
}
