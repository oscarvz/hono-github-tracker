CREATE TABLE IF NOT EXISTS "repositories" (
	"id" integer PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"description" text,
	"stargazers_count" integer DEFAULT 0 NOT NULL,
	"watchers_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "event_type" TO "event_action";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "github_avatar" TO "avatar";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "github_handle" TO "handle";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_github_user_id_unique";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_action" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "repo_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_id" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_name" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_repo_id_repositories_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "github_repo";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "action";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "github_user_id";