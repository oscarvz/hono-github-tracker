import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { events, type EventInsert, repositories, users } from "../db";
import {
  githubApiMiddleware,
  githubWebhooksMiddleware,
  jwtMiddleware,
} from "../middleware";
import type { HonoEnv } from "../types";
import { loginApi } from "./loginApi";

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
  "/github/:owner/:repo",
  zValidator("param", z.object({ owner: z.string(), repo: z.string() })),
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
        await db.insert(events).values(stargazerEvents).onConflictDoNothing();
      }

      const watcherEvents: Array<EventInsert> = watchers.users.map((user) => ({
        eventName: "watch",
        eventAction: "started",
        repoId: id,
        userId: user.id,
      }));
      if (watcherEvents.length > 0) {
        await db.insert(events).values(watcherEvents).onConflictDoNothing();
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

const repoApi = new Hono<HonoEnv>().get(
  "/:id",
  jwtMiddleware,
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const getRepositoriesWithEvents = c.var.getRepositoriesWithEvents;
    const repoIdParam = c.req.param("id");
    const repoId = Number.parseInt(repoIdParam, 10);

    try {
      const repositories = await getRepositoriesWithEvents(repoId);
      return c.json({ repositories }, 200);
    } catch (error) {
      return c.text(`Error fetching repository: ${error}`, 500);
    }
  },
);

const eventsApi = new Hono<HonoEnv>().delete(
  "/:id",
  jwtMiddleware,
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const db = c.var.db;
    const eventIdParam = c.req.param("id");
    const eventId = Number.parseInt(eventIdParam, 10);

    try {
      await db.delete(events).where(eq(events.id, eventId));
      return c.text("Event deleted", 200);
    } catch (error) {
      return c.text(`Error deleting event: ${error}`, 500);
    }
  },
);

api.route("/login", loginApi);
api.route("/repositories", repoApi);
api.route("/events", eventsApi);

export type LoginApi = typeof loginApi;
export type RepoApi = typeof repoApi;
export type EventsApi = typeof eventsApi;

export default api;
