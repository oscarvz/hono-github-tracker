import { Hono } from "hono";

import { events, users } from "../db";
import { githubApiMiddleware, githubWebhooksMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const api = new Hono<HonoEnv>();

api.use("/ghwh", githubApiMiddleware);
api.use("/ghwh", githubWebhooksMiddleware);

api.post("/ghwh", async (c) => {
  const db = c.var.db;
  const webhooks = c.var.webhooks;
  const fetchUserById = c.var.fetchUserById;

  webhooks.on(["star.created", "watch.started"], async ({ payload, name }) => {
    const userId = payload.sender.id;
    const user = await fetchUserById(userId);

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

    try {
      await db.insert(events).values({
        eventAction: payload.action,
        eventName: name,
        repoId: payload.repository.id,
        userId,
      });
    } catch (error) {
      return c.text(`Error inserting event: ${error}`, 500);
    }
  });
});

export default api;
