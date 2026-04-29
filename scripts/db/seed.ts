import { createSeedDatabase, seedDatabase } from "@/lib/db/seed";

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Set DIRECT_URL or DATABASE_URL before running pnpm db:seed");
}

const result = await seedDatabase(createSeedDatabase(databaseUrl));

console.log(
  [
    "Seed complete:",
    `${result.users} users`,
    `${result.creators} creators`,
    `${result.brands} brands`,
    `${result.posts} posts`,
    `${result.follows} follows`
  ].join(" ")
);
