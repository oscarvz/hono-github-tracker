DO $$ BEGIN
 CREATE TYPE "public"."interaction" AS ENUM('fork', 'issue', 'pull_request', 'star');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"github_repo" text NOT NULL,
	"interaction" "interaction" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_avatar" text NOT NULL,
	"github_handle" text NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"email_address" text,
	"location" text,
	"role" text,
	"twitter_handle" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
