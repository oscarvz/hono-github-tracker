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

  webhooks.on("star.created", async ({ payload }) => {
    const userId = payload.sender.id;
    const { data } = await fetchUserById(userId);

    // TODO: As Drizzle ORM doesn't return anything when .returning() is used,
    // we can't get the id of the user that was inserted. We should probably
    // change the schema that follows Github's id as the primary key.
    await db
      .insert(users)
      .values({
        company: data.company,
        emailAddress: data.email,
        githubAvatar: data.avatar_url,
        githubHandle: data.login,
        githubUserId: data.id,
        location: data.location,
        name: data.name,
        twitterHandle: data.twitter_username,
      })
      .onConflictDoNothing({ target: users.githubUserId });

    await db.insert(events).values({
      eventType: "star.created",
      githubRepo: payload.repository.id,
      // See the TODO above; ideally this ID should returned from the insertion
      // which isn't supported. To use Github's id as the primary key, we need
      // to change the schema.
      userId,
    });
  });
});

export { api };
