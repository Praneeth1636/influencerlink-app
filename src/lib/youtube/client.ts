// YouTube Data API client via Google OAuth. Same skeleton as IG and
// TikTok clients. Read-only access is enough for our verified-metrics use
// case (subscriber count, video count, view count, channel title).
//
// Scopes: youtube.readonly. Google OAuth returns a refresh_token only on
// the first consent — we tag the auth URL with prompt=consent to force a
// fresh refresh token when re-connecting, otherwise we'd be unable to
// refresh after the initial access_token expires (1 hour).

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";
const SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];

export class YouTubeNotConfiguredError extends Error {
  constructor() {
    super("YouTube OAuth not configured — set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REDIRECT_URI");
    this.name = "YouTubeNotConfiguredError";
  }
}

function appConfig() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) throw new YouTubeNotConfiguredError();
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(state: string): string {
  const { clientId, redirectUri } = appConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // required to get refresh_token
    prompt: "consent", // force fresh refresh_token on every connect
    state
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type YouTubeToken = {
  access_token: string;
  refresh_token?: string; // only present on first consent
  expires_in: number;
  scope: string;
  token_type: "Bearer";
};

export async function exchangeCodeForToken(code: string): Promise<YouTubeToken> {
  const { clientId, clientSecret, redirectUri } = appConfig();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    throw new Error(`YouTube code exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as YouTubeToken;
}

export async function refreshAccessToken(refreshToken: string): Promise<YouTubeToken> {
  const { clientId, clientSecret } = appConfig();
  const body = new URLSearchParams({
    client_id: clientId,
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
    throw new Error(`YouTube token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as YouTubeToken;
}

export type YouTubeChannel = {
  id: string;
  title: string;
  description?: string;
  customUrl?: string;
  thumbnailUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
};

export async function fetchPrimaryChannel(accessToken: string): Promise<YouTubeChannel> {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    mine: "true"
  });
  const res = await fetch(`${CHANNELS_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`YouTube /channels failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as {
    items?: Array<{
      id: string;
      snippet?: { title: string; description?: string; customUrl?: string; thumbnails?: { default?: { url: string } } };
      statistics?: { subscriberCount?: string; videoCount?: string; viewCount?: string };
    }>;
  };
  const channel = json.items?.[0];
  if (!channel) {
    throw new Error("YouTube /channels returned no channels — make sure the Google account has a YouTube channel");
  }
  return {
    id: channel.id,
    title: channel.snippet?.title ?? "",
    description: channel.snippet?.description,
    customUrl: channel.snippet?.customUrl,
    thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
    subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
    videoCount: Number(channel.statistics?.videoCount ?? 0),
    viewCount: Number(channel.statistics?.viewCount ?? 0)
  };
}
