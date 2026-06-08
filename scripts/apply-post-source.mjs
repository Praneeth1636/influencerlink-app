import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) {
  console.error("No DATABASE_URL/DIRECT_URL");
  process.exit(1);
}
const sql = neon(url);

// 1. Enum type
const enumExists = await sql`select 1 from pg_type where typname = 'post_source'`;
if (enumExists.length) {
  console.log("SKIP enum post_source (exists)");
} else {
  await sql.query(`CREATE TYPE "public"."post_source" AS ENUM('terrace', 'instagram', 'tiktok', 'youtube')`);
  console.log("CREATED enum post_source");
}

async function ensureColumn(table, column, type) {
  const rows =
    await sql`select 1 from information_schema.columns where table_name = ${table} and column_name = ${column}`;
  if (rows.length) {
    console.log(`SKIP ${table}.${column} (exists)`);
    return;
  }
  await sql.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`);
  console.log(`ADDED ${table}.${column}`);
}

await ensureColumn("posts", "source", `"public"."post_source" DEFAULT 'terrace' NOT NULL`);
await ensureColumn("posts", "external_url", "text");
await ensureColumn("posts", "external_id", "text");

// Unique index for upsert-on-sync (source + external_id)
const idxExists = await sql`select 1 from pg_indexes where indexname = 'posts_source_external_id_idx'`;
if (idxExists.length) {
  console.log("SKIP index posts_source_external_id_idx (exists)");
} else {
  await sql.query(`CREATE UNIQUE INDEX "posts_source_external_id_idx" ON "posts" ("source", "external_id")`);
  console.log("CREATED index posts_source_external_id_idx");
}

console.log("Done.");
