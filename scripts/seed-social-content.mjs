// Seed mock connected platforms + synced social posts so the feed shows a
// proof stream. Inserts creator_platforms rows for each creator (idempotent),
// then upserts mock IG/TikTok/YouTube posts via the same shape the real sync
// pipeline uses. Re-runnable.
//
// Run: node --env-file=.env.local scripts/seed-social-content.mjs

import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) {
  console.error("No DATABASE_URL/DIRECT_URL");
  process.exit(1);
}
const sql = neon(url);

const creators = await sql`select id, handle from creators order by created_at`;
if (creators.length === 0) {
  console.log("No creators — nothing to seed.");
  process.exit(0);
}

// Each creator gets instagram + youtube (+ tiktok for variety).
const PLATFORMS = ["instagram", "youtube", "tiktok"];

function seedNum(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const day = 24 * 60 * 60 * 1000;
const now = Date.now();

function mockMedia(source, handle) {
  const n = (k) => seedNum(`${source}:${handle}:${k}`);
  if (source === "youtube") {
    return [
      {
        externalId: `yt_${n(1)}`,
        externalUrl: `https://youtube.com/watch?v=${n(1).toString(36)}`,
        caption: "New video is live — the full breakdown of my 2026 setup.",
        mediaType: "video",
        title: "My 2026 Creator Setup — Everything I Use",
        stats: { views: 41200 + (n(1) % 9000), likes: 2100, comments: 180 },
        publishedAt: new Date(now - 1 * day)
      },
      {
        externalId: `yt_${n(2)}`,
        externalUrl: `https://youtube.com/watch?v=${n(2).toString(36)}`,
        caption: "Honest review — is it worth the hype? Watch to the end.",
        mediaType: "video",
        title: "Honest Review: The Product Everyone's Talking About",
        stats: { views: 28800 + (n(2) % 9000), likes: 1600, comments: 240 },
        publishedAt: new Date(now - 6 * day)
      }
    ];
  }
  if (source === "tiktok") {
    return [
      {
        externalId: `tt_${n(1)}`,
        externalUrl: `https://tiktok.com/@${handle}/video/${n(1)}`,
        caption: "the morning routine that actually stuck 🌅 #grwm",
        mediaType: "short",
        title: null,
        stats: { views: 96000 + (n(1) % 40000), likes: 8400, comments: 320 },
        publishedAt: new Date(now - 2 * day)
      }
    ];
  }
  return [
    {
      externalId: `ig_${n(1)}`,
      externalUrl: `https://instagram.com/p/${n(1).toString(36)}`,
      caption: "behind the scenes from yesterday's shoot ✨",
      mediaType: "image",
      title: null,
      stats: { likes: 5400 + (n(1) % 2000), comments: 130 },
      publishedAt: new Date(now - 3 * day)
    },
    {
      externalId: `ig_${n(2)}`,
      externalUrl: `https://instagram.com/reel/${n(2).toString(36)}`,
      caption: "3 products I can't stop reaching for this month 💛",
      mediaType: "reel",
      title: null,
      stats: { views: 62000 + (n(2) % 20000), likes: 4100, comments: 210 },
      publishedAt: new Date(now - 5 * day)
    }
  ];
}

let platformsInserted = 0;
let postsUpserted = 0;

for (const creator of creators) {
  for (const platform of PLATFORMS) {
    const existing = await sql`
      select 1 from creator_platforms
      where creator_id = ${creator.id} and platform = ${platform} limit 1`;
    if (existing.length === 0) {
      await sql`
        insert into creator_platforms (id, creator_id, platform, external_id, external_handle, access_token, last_synced_at)
        values (${randomUUID()}, ${creator.id}, ${platform}, ${`${platform}_${seedNum(creator.handle)}`}, ${creator.handle}, ${"mock_token"}, ${new Date()})`;
      platformsInserted += 1;
    }

    for (const item of mockMedia(platform, creator.handle)) {
      const mediaJson = JSON.stringify([
        {
          kind: "social",
          source: platform,
          mediaType: item.mediaType,
          thumbnailUrl: null,
          title: item.title,
          stats: item.stats,
          publishedAt: item.publishedAt.toISOString()
        }
      ]);
      await sql`
        insert into posts (author_type, author_id, body, media_json, type, visibility, source, external_url, external_id, created_at)
        values ('creator', ${creator.id}, ${item.caption}, ${mediaJson}::jsonb, 'content_drop', 'public', ${platform}, ${item.externalUrl}, ${item.externalId}, ${item.publishedAt})
        on conflict (source, external_id) do update
          set body = excluded.body, media_json = excluded.media_json, external_url = excluded.external_url, updated_at = now()`;
      postsUpserted += 1;
    }
  }
}

console.log(`platforms inserted: ${platformsInserted}`);
console.log(`synced posts upserted: ${postsUpserted}`);
console.log("Done.");
