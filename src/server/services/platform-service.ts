// Platform connection service. Owns the lifecycle of an OAuth-bound social
// account: connect, refresh tokens, sync metrics, disconnect. Tokens are
// stored encrypted at rest via lib/crypto.

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { creatorPlatforms, platformMetrics, type Creator, type User } from "@/lib/db/schema";
import { encrypt, decrypt } from "@/lib/crypto";
import {
  exchangeCodeForShortToken,
  exchangeShortForLongToken,
  fetchProfile,
  refreshLongToken,
  type IgProfile
} from "@/lib/instagram/client";
import { logger } from "@/lib/logger";
import type { Database } from "@/server/trpc";
import { writeAuditLog } from "./audit-service";

const log = logger.child({ module: "platform-service" });

export type ConnectInstagramInput = {
  code: string;
};

export async function connectInstagram(db: Database, user: User, creator: Creator, input: ConnectInstagramInput) {
  // 1. Code → short-lived → long-lived
  const short = await exchangeCodeForShortToken(input.code);
  const long = await exchangeShortForLongToken(short.access_token);

  // 2. Pull the profile + verified follower count
  const profile = await fetchProfile(long.access_token);

  if (profile.account_type === "PERSONAL") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Instagram returned a Personal account. Switch your IG to a Business or Creator account to surface follower counts."
    });
  }

  // 3. Upsert connection (one row per creator+platform). Encrypt tokens.
  const [existing] = await db
    .select({ id: creatorPlatforms.id })
    .from(creatorPlatforms)
    .where(and(eq(creatorPlatforms.creatorId, creator.id), eq(creatorPlatforms.platform, "instagram")))
    .limit(1);

  let connectionId: string;
  if (existing) {
    await db
      .update(creatorPlatforms)
      .set({
        externalId: profile.id,
        externalHandle: profile.username,
        accessToken: encrypt(long.access_token),
        refreshToken: null,
        connectedAt: new Date(),
        lastSyncedAt: new Date()
      })
      .where(eq(creatorPlatforms.id, existing.id));
    connectionId = existing.id;
  } else {
    const [created] = await db
      .insert(creatorPlatforms)
      .values({
        creatorId: creator.id,
        platform: "instagram",
        externalId: profile.id,
        externalHandle: profile.username,
        accessToken: encrypt(long.access_token),
        lastSyncedAt: new Date()
      })
      .returning({ id: creatorPlatforms.id });
    if (!created) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to insert connection" });
    }
    connectionId = created.id;
  }

  // 4. Snapshot metrics. Engagement data (likes/comments) needs media fetch
  //    + Insights API call — punt to the sync job for now.
  await writeMetricsSnapshot(db, connectionId, profile);

  await writeAuditLog(db, {
    user,
    action: "platform.connect",
    entityType: "creator_platform",
    entityId: connectionId,
    metadata: { platform: "instagram", username: profile.username, followers: profile.followers_count ?? 0 }
  });

  log.info(
    { creatorId: creator.id, username: profile.username, followers: profile.followers_count ?? 0 },
    "instagram connected"
  );

  return {
    connectionId,
    username: profile.username,
    followers: profile.followers_count ?? 0,
    accountType: profile.account_type
  };
}

export async function disconnectPlatform(db: Database, user: User, creator: Creator, connectionId: string) {
  const [row] = await db
    .select({ id: creatorPlatforms.id, platform: creatorPlatforms.platform })
    .from(creatorPlatforms)
    .where(and(eq(creatorPlatforms.id, connectionId), eq(creatorPlatforms.creatorId, creator.id)))
    .limit(1);

  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Connection not found" });
  }

  await db.delete(creatorPlatforms).where(eq(creatorPlatforms.id, connectionId));

  await writeAuditLog(db, {
    user,
    action: "platform.disconnect",
    entityType: "creator_platform",
    entityId: connectionId,
    metadata: { platform: row.platform }
  });

  return { ok: true };
}

/**
 * Refresh the long-lived token if it's older than 50 days. Idempotent — a no-op
 * if `lastSyncedAt` is recent. Returns the platform row's connectionId for
 * subsequent calls.
 */
export async function refreshInstagramTokenIfStale(
  db: Database,
  connectionId: string,
  thresholdDays = 50
): Promise<void> {
  const [row] = await db.select().from(creatorPlatforms).where(eq(creatorPlatforms.id, connectionId)).limit(1);

  if (!row || row.platform !== "instagram") return;

  const ageMs = Date.now() - new Date(row.connectedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < thresholdDays) return;

  const fresh = await refreshLongToken(decrypt(row.accessToken));
  await db
    .update(creatorPlatforms)
    .set({
      accessToken: encrypt(fresh.access_token),
      connectedAt: new Date()
    })
    .where(eq(creatorPlatforms.id, connectionId));
  log.info({ connectionId }, "instagram token refreshed");
}

/**
 * Pull the latest profile snapshot from Instagram and append a metrics row.
 * Caller is responsible for choosing when to invoke this (cron, on-demand, etc).
 */
export async function syncInstagramMetrics(db: Database, connectionId: string) {
  await refreshInstagramTokenIfStale(db, connectionId);

  const [row] = await db.select().from(creatorPlatforms).where(eq(creatorPlatforms.id, connectionId)).limit(1);

  if (!row || row.platform !== "instagram") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Instagram connection not found" });
  }

  const profile = await fetchProfile(decrypt(row.accessToken));
  await writeMetricsSnapshot(db, connectionId, profile);
  await db.update(creatorPlatforms).set({ lastSyncedAt: new Date() }).where(eq(creatorPlatforms.id, connectionId));

  return {
    followers: profile.followers_count ?? 0,
    mediaCount: profile.media_count ?? 0
  };
}

async function writeMetricsSnapshot(db: Database, connectionId: string, profile: IgProfile) {
  await db.insert(platformMetrics).values({
    creatorPlatformId: connectionId,
    snapshotDate: new Date(),
    followers: profile.followers_count ?? 0,
    avgViews: 0,
    avgLikes: 0,
    avgComments: 0,
    engagementRate: "0"
  });
}

// ─────────────────────────────────────────────────────────────────────────
// TikTok
// ─────────────────────────────────────────────────────────────────────────

import {
  exchangeCodeForToken as tiktokExchangeCode,
  fetchProfile as tiktokFetchProfile,
  refreshAccessToken as tiktokRefreshToken,
  type TikTokProfile
} from "@/lib/tiktok/client";

export async function connectTikTok(db: Database, user: User, creator: Creator, input: { code: string }) {
  const token = await tiktokExchangeCode(input.code);
  const profile = await tiktokFetchProfile(token.access_token);

  const connectionId = await upsertConnection(db, creator.id, "tiktok", {
    externalId: profile.open_id,
    externalHandle: profile.username || profile.display_name,
    accessToken: encrypt(token.access_token),
    refreshToken: encrypt(token.refresh_token)
  });

  await db.insert(platformMetrics).values({
    creatorPlatformId: connectionId,
    snapshotDate: new Date(),
    followers: profile.follower_count,
    avgViews: 0,
    avgLikes: profile.likes_count,
    avgComments: 0,
    engagementRate: "0"
  });

  await writeAuditLog(db, {
    user,
    action: "platform.connect",
    entityType: "creator_platform",
    entityId: connectionId,
    metadata: { platform: "tiktok", username: profile.username, followers: profile.follower_count }
  });
  log.info(
    { creatorId: creator.id, username: profile.username, followers: profile.follower_count },
    "tiktok connected"
  );

  return {
    connectionId,
    username: profile.username,
    followers: profile.follower_count
  };
}

export async function syncTikTokMetrics(db: Database, connectionId: string) {
  const [row] = await db.select().from(creatorPlatforms).where(eq(creatorPlatforms.id, connectionId)).limit(1);
  if (!row || row.platform !== "tiktok") {
    throw new TRPCError({ code: "NOT_FOUND", message: "TikTok connection not found" });
  }
  const accessToken = await ensureTikTokAccessToken(
    db,
    row.id,
    decrypt(row.accessToken),
    row.refreshToken ? decrypt(row.refreshToken) : null
  );
  const profile = await tiktokFetchProfile(accessToken);
  await writeTikTokMetricsSnapshot(db, connectionId, profile);
  await db.update(creatorPlatforms).set({ lastSyncedAt: new Date() }).where(eq(creatorPlatforms.id, connectionId));
  return { followers: profile.follower_count, videoCount: profile.video_count };
}

async function ensureTikTokAccessToken(
  db: Database,
  connectionId: string,
  accessToken: string,
  refreshToken: string | null
): Promise<string> {
  // TikTok access tokens last 24h; we proactively refresh on every sync.
  // Cheap, and avoids the failure-mode where access token expired between
  // syncs. If no refresh token, return as-is and let the caller fail loudly.
  if (!refreshToken) return accessToken;
  try {
    const fresh = await tiktokRefreshToken(refreshToken);
    await db
      .update(creatorPlatforms)
      .set({
        accessToken: encrypt(fresh.access_token),
        refreshToken: encrypt(fresh.refresh_token)
      })
      .where(eq(creatorPlatforms.id, connectionId));
    return fresh.access_token;
  } catch (err) {
    log.warn({ err, connectionId }, "tiktok refresh failed, retrying with old token");
    return accessToken;
  }
}

async function writeTikTokMetricsSnapshot(db: Database, connectionId: string, profile: TikTokProfile) {
  await db.insert(platformMetrics).values({
    creatorPlatformId: connectionId,
    snapshotDate: new Date(),
    followers: profile.follower_count,
    avgViews: 0,
    avgLikes: profile.likes_count,
    avgComments: 0,
    engagementRate: "0"
  });
}

// ─────────────────────────────────────────────────────────────────────────
// YouTube
// ─────────────────────────────────────────────────────────────────────────

import {
  exchangeCodeForToken as ytExchangeCode,
  fetchPrimaryChannel as ytFetchChannel,
  refreshAccessToken as ytRefreshToken,
  type YouTubeChannel
} from "@/lib/youtube/client";

export async function connectYouTube(db: Database, user: User, creator: Creator, input: { code: string }) {
  const token = await ytExchangeCode(input.code);
  const channel = await ytFetchChannel(token.access_token);

  if (!token.refresh_token) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "YouTube did not return a refresh token. Revoke the existing grant in your Google account and retry."
    });
  }

  const connectionId = await upsertConnection(db, creator.id, "youtube", {
    externalId: channel.id,
    externalHandle: channel.customUrl ?? channel.title,
    accessToken: encrypt(token.access_token),
    refreshToken: encrypt(token.refresh_token)
  });

  await db.insert(platformMetrics).values({
    creatorPlatformId: connectionId,
    snapshotDate: new Date(),
    followers: channel.subscriberCount,
    avgViews: Math.floor(channel.viewCount / Math.max(channel.videoCount, 1)),
    avgLikes: 0,
    avgComments: 0,
    engagementRate: "0"
  });

  await writeAuditLog(db, {
    user,
    action: "platform.connect",
    entityType: "creator_platform",
    entityId: connectionId,
    metadata: { platform: "youtube", channel: channel.title, subscribers: channel.subscriberCount }
  });
  log.info(
    { creatorId: creator.id, channel: channel.title, subscribers: channel.subscriberCount },
    "youtube connected"
  );

  return {
    connectionId,
    channel: channel.title,
    subscribers: channel.subscriberCount
  };
}

export async function syncYouTubeMetrics(db: Database, connectionId: string) {
  const [row] = await db.select().from(creatorPlatforms).where(eq(creatorPlatforms.id, connectionId)).limit(1);
  if (!row || row.platform !== "youtube") {
    throw new TRPCError({ code: "NOT_FOUND", message: "YouTube connection not found" });
  }
  if (!row.refreshToken) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Missing YouTube refresh token — reconnect" });
  }
  const fresh = await ytRefreshToken(decrypt(row.refreshToken));
  await db
    .update(creatorPlatforms)
    .set({ accessToken: encrypt(fresh.access_token) })
    .where(eq(creatorPlatforms.id, connectionId));

  const channel = await ytFetchChannel(fresh.access_token);
  await writeYouTubeMetricsSnapshot(db, connectionId, channel);
  await db.update(creatorPlatforms).set({ lastSyncedAt: new Date() }).where(eq(creatorPlatforms.id, connectionId));
  return { subscribers: channel.subscriberCount, videoCount: channel.videoCount };
}

async function writeYouTubeMetricsSnapshot(db: Database, connectionId: string, channel: YouTubeChannel) {
  await db.insert(platformMetrics).values({
    creatorPlatformId: connectionId,
    snapshotDate: new Date(),
    followers: channel.subscriberCount,
    avgViews: Math.floor(channel.viewCount / Math.max(channel.videoCount, 1)),
    avgLikes: 0,
    avgComments: 0,
    engagementRate: "0"
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────

async function upsertConnection(
  db: Database,
  creatorId: string,
  platform: "instagram" | "tiktok" | "youtube" | "linkedin",
  data: { externalId: string; externalHandle: string; accessToken: string; refreshToken: string | null }
): Promise<string> {
  const [existing] = await db
    .select({ id: creatorPlatforms.id })
    .from(creatorPlatforms)
    .where(and(eq(creatorPlatforms.creatorId, creatorId), eq(creatorPlatforms.platform, platform)))
    .limit(1);

  if (existing) {
    await db
      .update(creatorPlatforms)
      .set({
        externalId: data.externalId,
        externalHandle: data.externalHandle,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        connectedAt: new Date(),
        lastSyncedAt: new Date()
      })
      .where(eq(creatorPlatforms.id, existing.id));
    return existing.id;
  }

  const [created] = await db
    .insert(creatorPlatforms)
    .values({
      creatorId,
      platform,
      externalId: data.externalId,
      externalHandle: data.externalHandle,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      lastSyncedAt: new Date()
    })
    .returning({ id: creatorPlatforms.id });
  if (!created) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to insert connection" });
  }
  return created.id;
}
