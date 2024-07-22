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
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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

type EventTypes = [EmitterWebhookEventName, ...Array<EmitterWebhookEventName>];

const eventTypes: EventTypes = ["star.created", "star.deleted"];
export const eventTypeEnum = pgEnum("event_type", eventTypes);

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  githubRepo: integer("github_repo").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  action: text("action"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({
  // Omit `createdAt` for inserting as it's inserted by default
  createdAt: true,
});

export const selectEventsSchema = createSelectSchema(events);
export const insertEventsSchema = createInsertSchema(events).omit({
  // Omit `createdAt` for inserting as it's inserted by default
  createdAt: true,
});
