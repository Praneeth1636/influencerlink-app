// TikTok Login Kit client. Same shape as the IG client: lean, no SDK, all
// requests are server-side. TikTok uses CSRF state + PKCE optional; we use
// state cookies for parity with our IG flow.
//
// TikTok scopes for verified follower counts:
//   user.info.basic — open_id, avatar
//   user.info.profile — username + display_name
//   user.info.stats — follower_count, video_count, likes_count
//
// Tokens: short-lived access_token (24h) + refresh_token (365d). We refresh
// before access_token expiry via refreshAccessToken().

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_URL = "https://open.tiktokapis.com/v2/user/info/";
const SCOPES = ["user.info.basic", "user.info.profile", "user.info.stats"];

export class TikTokNotConfiguredError extends Error {
  constructor() {
    super("TikTok OAuth not configured — set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI");
    this.name = "TikTokNotConfiguredError";
  }
}

function appConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  if (!clientKey || !clientSecret || !redirectUri) throw new TikTokNotConfiguredError();
  return { clientKey, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(state: string): string {
  const { clientKey, redirectUri } = appConfig();
  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    scope: SCOPES.join(","),
    response_type: "code",
    state
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type TikTokToken = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
  scope: string;
};

export async function exchangeCodeForToken(code: string): Promise<TikTokToken> {
  const { clientKey, clientSecret, redirectUri } = appConfig();
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body
  });
  if (!res.ok) {
    throw new Error(`TikTok code exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TikTokToken;
}

export async function refreshAccessToken(refreshToken: string): Promise<TikTokToken> {
  const { clientKey, clientSecret } = appConfig();
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    throw new Error(`TikTok token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as TikTokToken;
}

export type TikTokProfile = {
  open_id: string;
  union_id?: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
};

export async function fetchProfile(accessToken: string): Promise<TikTokProfile> {
  const fields =
    "open_id,union_id,display_name,username,avatar_url,follower_count,following_count,likes_count,video_count";
  const res = await fetch(`${USER_URL}?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`TikTok /user/info failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: { user?: TikTokProfile } };
  if (!json.data?.user) {
    throw new Error("TikTok /user/info returned no user");
  }
  return json.data.user;
}
