ALTER TABLE "events" DROP CONSTRAINT "events_user_id_repo_id_event_name_event_action_unique";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_action" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_event_action_event_name_repo_id_user_id_unique" UNIQUE("event_action","event_name","repo_id","user_id");