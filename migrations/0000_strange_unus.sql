DO $$ BEGIN
 CREATE TYPE "public"."event_type" AS ENUM('fork', 'issue', 'pull_request', 'star');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_user_id" integer NOT NULL,
	"github_repo" integer NOT NULL,
	"event_type" "event_type" NOT NULL,
	"event_id" integer,
	"action" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_user_id" integer NOT NULL,
	"github_avatar" text NOT NULL,
	"github_handle" text NOT NULL,
	"company" text,
	"email_address" text,
	"location" text,
	"role" text,
	"name" text,
	"twitter_handle" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_github_user_id_users_github_user_id_fk" FOREIGN KEY ("github_user_id") REFERENCES "public"."users"("github_user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
