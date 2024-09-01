import { Hono } from "hono";

import { eq } from "drizzle-orm";
import { events, repositories, users } from "../db";
import { githubApiMiddleware, githubWebhooksMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const api = new Hono<HonoEnv>();

api.use("/ghwh", githubApiMiddleware);
api.use("/ghwh", githubWebhooksMiddleware);

api.post("/ghwh", async (c) => {
  const db = c.var.db;
  const webhooks = c.var.webhooks;
  const fetchUserById = c.var.fetchUserById;

  webhooks.on(
    ["issues.opened", "star.created", "watch.started"],
    async ({ payload, name }) => {
      const userId = payload.sender.id;
      const user = await fetchUserById(userId);

      try {
        await db
          .insert(repositories)
          .values({
            description: payload.repository.description,
            fullName: payload.repository.full_name,
            id: payload.repository.id,
            name: payload.repository.name,
            stargazersCount: payload.repository.stargazers_count,
            watchersCount: payload.repository.watchers_count,
          })
          .onConflictDoUpdate({
            target: repositories.id,
            set: {
              stargazersCount: payload.repository.stargazers_count,
              watchersCount: payload.repository.watchers_count,
            },
          });
      } catch (error) {
        return c.text(`Error fetching repository: ${error}`, 500);
      }

      try {
        await db
          .insert(users)
          .values({
            avatar: user.avatar_url,
            company: user.company,
            emailAddress: user.email,
            handle: user.login,
            id: user.id,
            location: user.location,
            name: user.name,
            twitterHandle: user.twitter_username,
          })
          .onConflictDoNothing({ target: users.id });
      } catch (error) {
        return c.text(`Error inserting user: ${error}`, 500);
      }

      // Only issues have an event ID
      let eventId: number | undefined;
      if (name === "issues") {
        eventId = payload.issue.id;
      }

      try {
        await db.insert(events).values({
          eventId,
          eventAction: payload.action,
          eventName: name,
          repoId: payload.repository.id,
          userId,
        });
      } catch (error) {
        return c.text(`Error inserting event: ${error}`, 500);
      }
    },
  );
});

const eventsApi = new Hono<HonoEnv>().delete("/:id", async (c) => {
  const db = c.var.db;
  const eventIdParam = c.req.param("id");
  const eventId = Number.parseInt(eventIdParam, 10);

  try {
    await db.delete(events).where(eq(events.id, eventId));
    return c.text("Event deleted", 200);
  } catch (error) {
    return c.text(`Error deleting event: ${error}`, 500);
  }
});

api.route("/events", eventsApi);

export default api;

export type EventsApi = typeof eventsApi;
