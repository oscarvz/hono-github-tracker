import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const repositories = pgTable("repositories", {
  id: integer("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  stargazersCount: integer("stargazers_count").notNull().default(0),
  watchersCount: integer("watchers_count").notNull().default(0),
});

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

export const events = pgTable(
  "events",
  {
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
  },
  (t) => ({
    uniqueEvent: unique().on(t.userId, t.repoId, t.eventName, t.eventAction),
  }),
);

export const repositoriesEvents = relations(repositories, ({ many }) => ({
  events: many(events),
}));

export const usersEvents = relations(users, ({ many }) => ({
  events: many(events),
}));

export const eventsUser = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export type Repository = typeof repositories.$inferSelect;
export type RepositoryInsert = typeof repositories.$inferInsert;
export type UserInsert = typeof users.$inferInsert;
export type EventInsert = typeof events.$inferInsert;
