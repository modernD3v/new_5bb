CREATE TYPE "public"."ski_pass" AS ENUM('epic', 'ikon', 'indy');--> statement-breakpoint
CREATE TABLE "mountain_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mountain_id" uuid NOT NULL,
	"pass" "ski_pass" NOT NULL,
	"tier_note" text,
	"season" text NOT NULL,
	"source_url" text,
	"verified_at" date
);
--> statement-breakpoint
CREATE TABLE "seed_runs" (
	"key" text PRIMARY KEY NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mountains" ADD COLUMN "opening_date" date;--> statement-breakpoint
ALTER TABLE "mountains" ADD COLUMN "closing_date" date;--> statement-breakpoint
ALTER TABLE "mountain_passes" ADD CONSTRAINT "mountain_passes_mountain_id_mountains_id_fk" FOREIGN KEY ("mountain_id") REFERENCES "public"."mountains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mountain_passes_mountain_pass_season_uidx" ON "mountain_passes" USING btree ("mountain_id","pass","season");