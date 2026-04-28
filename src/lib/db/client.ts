import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

function getDb(): Db {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  cached = drizzle(neon(url), { schema });
  return cached;
}

// Lazy proxy: defers neon() until the first DB call so build-time page-data
// collection does not require DATABASE_URL to be present.
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  }
});
