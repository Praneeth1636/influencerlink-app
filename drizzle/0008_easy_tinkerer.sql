DO $$ BEGIN
 CREATE TYPE "public"."post_source" AS ENUM('terrace', 'instagram', 'tiktok', 'youtube');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "source" "post_source" DEFAULT 'terrace' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "external_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "external_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "posts_source_external_id_idx" ON "posts" USING btree ("source","external_id");
