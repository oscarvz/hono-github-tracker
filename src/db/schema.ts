import type { EmitterWebhookEventName } from "@octokit/webhooks";
import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Required fields
  githubUserId: integer("github_user_id").notNull().unique(),
  githubAvatar: text("github_avatar").notNull(),
  githubHandle: text("github_handle").notNull(),

  // Optional fields
  company: text("company"),
  emailAddress: text("email_address"),
  location: text("location"),
  role: text("role"),
  name: text("name"),
  twitterHandle: text("twitter_handle"),
});

type SupportedEventType = Extract<
  EmitterWebhookEventName,
  "star.created" | "star.deleted"
>;
type EventTypes = [SupportedEventType, ...Array<SupportedEventType>];

const eventTypes: EventTypes = ["star.created", "star.deleted"];
export const eventTypeEnum = pgEnum("event_type", eventTypes);

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  githubRepo: integer("github_repo").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  action: text("action"),
});

export const usersEvents = relations(users, ({ many }) => ({
  interactions: many(events),
}));

export const eventUser = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));
