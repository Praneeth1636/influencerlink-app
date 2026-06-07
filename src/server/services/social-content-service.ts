// Social-content sync. Pulls a creator's recent posts from their connected
// platforms (Instagram / TikTok / YouTube) and upserts them into `posts` as
// `source != 'terrace'` rows, so they surface in the Terrace feed as a proof
// stream of real, ongoing work.
//
// Today the per-platform fetch uses a deterministic demo adapter. Real
// ingestion needs approved platform OAuth + content APIs. When those land,
// swap `fetchRecentMedia` for the real API call; the upsert path below is
// the production shape the feed already consumes.

import { eq } from "drizzle-orm";
import { creatorPlatforms, posts } from "@/lib/db/schema";
import type { Database } from "@/server/trpc";

type SyncSource = "instagram" | "tiktok" | "youtube";

// Shape returned by each platform adapter. Maps onto a `posts` row +
// `mediaJson` payload the feed knows how to render.
export type SyncedMediaItem = {
  externalId: string;
  externalUrl: string;
  caption: string;
  mediaType: "image" | "reel" | "video" | "short" | "story";
  thumbnailUrl: string | null;
  title: string | null;
  stats: { views?: number; likes?: number; comments?: number };
  publishedAt: Date;
};

export type SocialSyncResult = {
  platformsSynced: number;
  postsUpserted: number;
};

const SYNC_PLATFORMS: SyncSource[] = ["instagram", "tiktok", "youtube"];

export async function syncSocialContentForCreator(
  db: Database,
  creatorId: string,
  options: { fetcher?: typeof fetchRecentMedia } = {}
): Promise<SocialSyncResult> {
  const fetcher = options.fetcher ?? fetchRecentMedia;

  const platformRows = await db
    .select({
      id: creatorPlatforms.id,
      platform: creatorPlatforms.platform,
      handle: creatorPlatforms.externalHandle
    })
    .from(creatorPlatforms)
    .where(eq(creatorPlatforms.creatorId, creatorId));

  let postsUpserted = 0;
  let platformsSynced = 0;

  for (const row of platformRows) {
    if (!SYNC_PLATFORMS.includes(row.platform as SyncSource)) continue;
    const source = row.platform as SyncSource;
    const items = await fetcher(source, row.handle);
    platformsSynced += 1;

    for (const item of items) {
      await upsertSyncedPost(db, creatorId, source, item);
      postsUpserted += 1;
    }

    await db.update(creatorPlatforms).set({ lastSyncedAt: new Date() }).where(eq(creatorPlatforms.id, row.id));
  }

  return { platformsSynced, postsUpserted };
}

export async function upsertSyncedPost(db: Database, creatorId: string, source: SyncSource, item: SyncedMediaItem) {
  await db
    .insert(posts)
    .values({
      authorType: "creator",
      authorId: creatorId,
      body: item.caption,
      type: "content_drop",
      visibility: "public",
      source,
      externalUrl: item.externalUrl,
      externalId: item.externalId,
      mediaJson: [
        {
          kind: "social",
          source,
          mediaType: item.mediaType,
          thumbnailUrl: item.thumbnailUrl,
          title: item.title,
          stats: item.stats,
          publishedAt: item.publishedAt.toISOString()
        }
      ],
      createdAt: item.publishedAt
    })
    .onConflictDoUpdate({
      target: [posts.source, posts.externalId],
      set: {
        body: item.caption,
        mediaJson: [
          {
            kind: "social",
            source,
            mediaType: item.mediaType,
            thumbnailUrl: item.thumbnailUrl,
            title: item.title,
            stats: item.stats,
            publishedAt: item.publishedAt.toISOString()
          }
        ],
        externalUrl: item.externalUrl,
        updatedAt: new Date()
      }
    });
}

// Sync all creators that have at least one connected platform. Called by cron.
export async function syncAllSocialContent(
  db: Database,
  options: { fetcher?: typeof fetchRecentMedia } = {}
): Promise<SocialSyncResult & { creatorsSynced: number }> {
  const creatorIds = await db.selectDistinct({ creatorId: creatorPlatforms.creatorId }).from(creatorPlatforms);

  let postsUpserted = 0;
  let platformsSynced = 0;

  for (const { creatorId } of creatorIds) {
    const result = await syncSocialContentForCreator(db, creatorId, options);
    postsUpserted += result.postsUpserted;
    platformsSynced += result.platformsSynced;
  }

  return { creatorsSynced: creatorIds.length, platformsSynced, postsUpserted };
}

// ---------------------------------------------------------------------------
// Platform adapters. Deterministic demo data until OAuth + content APIs are
// approved. Each returns recent-media shaped records. Replace the body with
// real fetches and keep the SyncedMediaItem shape; the rest of the pipeline is
// unchanged.
// ---------------------------------------------------------------------------

async function fetchRecentMedia(source: SyncSource, handle: string): Promise<SyncedMediaItem[]> {
  return buildDemoMedia(source, handle);
}

const DEMO_TONES = ["#fde2cf", "#d6ecf8", "#fce0cc", "#dceefb", "#e8f4ec", "#f3e2f8"];

function buildDemoMedia(source: SyncSource, handle: string): SyncedMediaItem[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const seed = (n: number) => {
    let h = 0;
    const s = `${source}:${handle}:${n}`;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  if (source === "youtube") {
    return [
      {
        externalId: `yt_${seed(1)}`,
        externalUrl: `https://youtube.com/watch?v=${seed(1).toString(36)}`,
        caption: "New video is live — the full breakdown of my 2026 setup.",
        mediaType: "video",
        thumbnailUrl: null,
        title: "My 2026 Creator Setup — Everything I Use",
        stats: { views: 41200 + (seed(1) % 9000), likes: 2100, comments: 180 },
        publishedAt: new Date(now - 1 * day)
      },
      {
        externalId: `yt_${seed(2)}`,
        externalUrl: `https://youtube.com/watch?v=${seed(2).toString(36)}`,
        caption: "Honest review — is it worth the hype? Watch to the end.",
        mediaType: "video",
        thumbnailUrl: null,
        title: "Honest Review: The Product Everyone's Talking About",
        stats: { views: 28800 + (seed(2) % 9000), likes: 1600, comments: 240 },
        publishedAt: new Date(now - 6 * day)
      }
    ];
  }

  if (source === "tiktok") {
    return [
      {
        externalId: `tt_${seed(1)}`,
        externalUrl: `https://tiktok.com/@${handle}/video/${seed(1)}`,
        caption: "the morning routine that actually stuck 🌅 #grwm",
        mediaType: "short",
        thumbnailUrl: null,
        title: null,
        stats: { views: 96000 + (seed(1) % 40000), likes: 8400, comments: 320 },
        publishedAt: new Date(now - 2 * day)
      }
    ];
  }

  // instagram
  return [
    {
      externalId: `ig_${seed(1)}`,
      externalUrl: `https://instagram.com/p/${seed(1).toString(36)}`,
      caption: "behind the scenes from yesterday's shoot ✨",
      mediaType: "image",
      thumbnailUrl: null,
      title: null,
      stats: { likes: 5400 + (seed(1) % 2000), comments: 130 },
      publishedAt: new Date(now - 3 * day)
    },
    {
      externalId: `ig_${seed(2)}`,
      externalUrl: `https://instagram.com/reel/${seed(2).toString(36)}`,
      caption: "3 products I can't stop reaching for this month 💛",
      mediaType: "reel",
      thumbnailUrl: null,
      title: null,
      stats: { views: 62000 + (seed(2) % 20000), likes: 4100, comments: 210 },
      publishedAt: new Date(now - 5 * day)
    }
  ];
}

// Exposed so the seed script can reuse the same deterministic demo pipeline.
export { buildDemoMedia, DEMO_TONES };
export { buildDemoMedia as buildMockMedia, DEMO_TONES as MOCK_TONES };
export function isSyncedSource(value: string): value is SyncSource {
  return value === "instagram" || value === "tiktok" || value === "youtube";
}
