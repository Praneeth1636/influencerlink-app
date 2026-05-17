CREATE TYPE "public"."brief_payment_status" AS ENUM('pending', 'authorized', 'captured', 'released', 'refunded', 'failed');--> statement-breakpoint
CREATE TABLE "brief_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"platform_fee_cents" integer NOT NULL,
	"creator_payout_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" "brief_payment_status" DEFAULT 'pending' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"stripe_transfer_id" text,
	"captured_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brief_payments_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "brief_payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "brief_payments_stripe_transfer_id_unique" UNIQUE("stripe_transfer_id")
);
--> statement-breakpoint
ALTER TABLE "brief_payments" ADD CONSTRAINT "brief_payments_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief_payments" ADD CONSTRAINT "brief_payments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief_payments" ADD CONSTRAINT "brief_payments_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief_payments" ADD CONSTRAINT "brief_payments_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brief_payments_brand_idx" ON "brief_payments" USING btree ("brand_id","status");--> statement-breakpoint
CREATE INDEX "brief_payments_creator_idx" ON "brief_payments" USING btree ("creator_id","status");