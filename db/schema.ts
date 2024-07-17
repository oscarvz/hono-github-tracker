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

  // Required fields
  githubUserId: integer("github_user_id").notNull(),
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

export const eventTypeEnum = pgEnum("event_type", [
  "fork",
  "issue",
  "pull_request",
  "star",
]);

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.githubUserId, { onDelete: "cascade" }),
  githubRepo: integer("github_repo").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  eventID: integer("event_id"),
  action: text("action"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersInteractions = relations(users, ({ many }) => ({
  interactions: many(interactions),
}));

export const interactionsUser = relations(interactions, ({ one }) => ({
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
}));
