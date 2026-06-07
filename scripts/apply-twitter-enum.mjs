import { neon } from "@neondatabase/serverless";
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL");
  process.exit(1);
}
const sql = neon(url);
const rows = await sql`select 1 from pg_enum where enumlabel = 'twitter' and enumtypid = 'public.platform'::regtype`;
if (rows.length) {
  console.log("SKIP — twitter already in platform enum");
} else {
  await sql.query(`ALTER TYPE "public"."platform" ADD VALUE 'twitter'`);
  console.log("ADDED twitter to platform enum");
}
