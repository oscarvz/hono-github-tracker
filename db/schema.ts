import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users_table", {
  id: serial("id").primaryKey(),

  // Required fields
  githubAvatar: text("github_avatar").notNull(),
  githubHandle: text("github_handle").notNull(),
  name: text("name").notNull(),

  // Optional fields
  company: text("company"),
  emailAddress: text("email_address"),
  location: text("location"),
  role: text("role"),
  twitterHandle: text("twitter_handle"),
});

const interactionEnum = pgEnum("interaction", [
  "star",
  "fork",
  "issue",
  "pull_request",
]);

export const interactions = pgTable("engagements_table", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  githubRepo: text("github_repo").notNull(),
  interaction: interactionEnum("interaction").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
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
