import { Hono } from "hono";

import { events, repositories, users } from "../db";
import { githubApiMiddleware, githubWebhooksMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const api = new Hono<HonoEnv>();

api.use("*", githubApiMiddleware);
api.use("/ghwh", githubWebhooksMiddleware);

api.post("/ghwh", async (c) => {
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

api.get("/stargazers/:owner/:repo", async (c) => {
  const db = c.var.db;
  const fetchsUsersWithInteractions = c.var.fetchUsersWithInteractions;
  const owner = c.req.param("owner");
  const repo = c.req.param("repo");

  let count = 100;
  const countQuery = c.req.query("count");
  if (countQuery) {
    count = Number.parseInt(countQuery, 10);
  }

  try {
    const { stargazers, watchers } = await fetchsUsersWithInteractions({
      count,
      owner,
      repo,
    });

    const usersWithInteractions = stargazers.users.concat(watchers.users);
    await db.insert(users).values(usersWithInteractions).onConflictDoNothing({
      target: users.id,
    });

    return c.text("Updated stargazers and watchers!");
  } catch (error) {
    return c.text(`Error fetching and storing stargazers: ${error}`, 500);
  }
});

export default api;
