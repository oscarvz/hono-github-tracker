import { and, eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import { events, type EventInsert, repositories, users } from "../db";
import { githubApiMiddleware, githubWebhooksMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const api = new Hono<HonoEnv>();

api.use("/github/*", githubApiMiddleware);
api.use("/github/webhook", githubWebhooksMiddleware);

api.post("/github/webhook", async (c) => {
  const db = c.var.db;
  const webhooks = c.var.webhooks;
  const fetchUserById = c.var.fetchUserById;

  webhooks.on(
    ["issues.opened", "star.created", "watch.started"],
    async ({ payload, name }) => {
      const userId = payload.sender.id;

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
        const user = await fetchUserById(userId);

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

api.get(
  // Params will be replaced by repo id once dashboard is implemented.
  "/github/:owner/:repo",
  bearerAuth({
    // Basic bearer token auth for now until the dashboard is implemented.
    verifyToken: async (token, c: Context<HonoEnv>) =>
      token === c.env.GITHUB_BEARER_TOKEN,
  }),
  async (c) => {
    const db = c.var.db;
    const fetchRepoWithUsersAndEvents = c.var.fetchRepoWithUsersAndEvents;
    const owner = c.req.param("owner");
    const repo = c.req.param("repo");

    const countQuery = c.req.query("count");
    const count = countQuery ? Number.parseInt(countQuery, 10) : 50;

    try {
      const {
        id,
        fullName,
        name,
        stargazers,
        watchers,
        description,
        stargazersCount,
      } = await fetchRepoWithUsersAndEvents({
        count,
        owner,
        repo,
      });

      await db
        .insert(repositories)
        .values({
          fullName,
          id,
          name,
          description,
          stargazersCount,
          watchersCount: watchers.totalCount,
        })
        .onConflictDoNothing({
          target: repositories.id,
        });

      const usersWithInteractions = stargazers.users.concat(watchers.users);
      await db.insert(users).values(usersWithInteractions).onConflictDoNothing({
        target: users.id,
      });

      const stargazerEvents: Array<EventInsert> = stargazers.users.map(
        (user) => ({
          eventName: "star",
          eventAction: "created",
          repoId: id,
          userId: user.id,
        }),
      );
      if (stargazerEvents.length > 0) {
        await db
          .insert(events)
          .values(stargazerEvents)
          .onConflictDoNothing({
            target: [repositories.id, users.id],
            where: and(
              eq(events.eventName, "star"),
              eq(events.eventAction, "created"),
            ),
          });
      }

      const watcherEvents: Array<EventInsert> = watchers.users.map((user) => ({
        eventName: "watch",
        eventAction: "started",
        repoId: id,
        userId: user.id,
      }));
      if (watcherEvents.length > 0) {
        await db
          .insert(events)
          .values(watcherEvents)
          .onConflictDoNothing({
            target: [repositories.id, users.id],
            where: and(
              eq(events.eventName, "watch"),
              eq(events.eventAction, "started"),
            ),
          });
      }

      return c.text("Updated stargazers and watchers!");
    } catch (error) {
      return c.text(
        `Error fetching and storing users and events: ${error}`,
        500,
      );
    }
  },
);

export default api;
