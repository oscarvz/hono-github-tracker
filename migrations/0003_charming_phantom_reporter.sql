ALTER TYPE "event_type" ADD VALUE 'star.created';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE 'star.deleted';--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "event_id";