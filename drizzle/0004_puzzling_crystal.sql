CREATE TYPE "public"."creator_payout_status" AS ENUM('pending', 'onboarding', 'active', 'restricted');--> statement-breakpoint
CREATE TABLE "creator_payout_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"stripe_account_id" text NOT NULL,
	"country" text NOT NULL,
	"status" "creator_payout_status" DEFAULT 'pending' NOT NULL,
	"details_submitted" boolean DEFAULT false NOT NULL,
	"charges_enabled" boolean DEFAULT false NOT NULL,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"default_currency" text DEFAULT 'usd' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_payout_accounts_creator_id_unique" UNIQUE("creator_id"),
	CONSTRAINT "creator_payout_accounts_stripe_account_id_unique" UNIQUE("stripe_account_id")
);
--> statement-breakpoint
ALTER TABLE "creator_payout_accounts" ADD CONSTRAINT "creator_payout_accounts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;