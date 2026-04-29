CREATE INDEX "creator_aggregates_search_idx" ON "creator_aggregates" USING btree ("primary_niche","total_reach" DESC NULLS LAST,"weighted_engagement" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "follows_follower_created_at_idx" ON "follows" USING btree ("follower_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_thread_created_at_idx" ON "messages" USING btree ("thread_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "posts_author_created_at_idx" ON "posts" USING btree ("author_type","author_id","created_at" DESC NULLS LAST);