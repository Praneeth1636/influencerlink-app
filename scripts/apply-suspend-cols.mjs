import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) {
  console.error("No DATABASE_URL/DIRECT_URL");
  process.exit(1);
}
const sql = neon(url);

async function ensureColumn(table, column, type) {
  const rows =
    await sql`select 1 from information_schema.columns where table_name = ${table} and column_name = ${column}`;
  if (rows.length) {
    console.log(`SKIP ${table}.${column} (already exists)`);
    return;
  }
  await sql.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`);
  console.log(`ADDED ${table}.${column}`);
}

await ensureColumn("users", "suspended_at", "timestamp with time zone");
await ensureColumn("users", "suspended_reason", "text");
