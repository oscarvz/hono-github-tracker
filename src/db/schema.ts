import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const repositories = pgTable("repositories", {
  id: integer("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  stargazersCount: integer("stargazers_count").notNull().default(0),
  watchersCount: integer("watchers_count").notNull().default(0),
});
const repositoriesSchema = createSelectSchema(repositories, {
  createdAt: z.string() /* Because JSON serializing */,
});
export type Repository = z.infer<typeof repositoriesSchema>;

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  avatar: text("avatar").notNull(),
  handle: text("handle").notNull(),
  company: text("company"),
  emailAddress: text("email_address"),
  location: text("location"),
  role: text("role"),
  name: text("name"),
  twitterHandle: text("twitter_handle"),
});
const usersSchema = createSelectSchema(users, {
  createdAt: z.string() /* Because JSON serializing */,
});
export type User = z.infer<typeof usersSchema>;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repoId: integer("repo_id")
    .notNull()
    .references(() => repositories.id, {
      onDelete: "cascade",
    }),
  eventId: integer("event_id"),
  eventName: text("event_name").notNull(),
  eventAction: text("event_action").notNull(),
});
const eventsSchema = createSelectSchema(events, {
  createdAt: z.string() /* Because JSON serializing */,
});
export type Event = z.infer<typeof eventsSchema>;

export const repositoriesRelations = relations(repositories, ({ many }) => ({
  events: many(events),
}));

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  repository: one(repositories, {
    fields: [events.repoId],
    references: [repositories.id],
  }),
}));
