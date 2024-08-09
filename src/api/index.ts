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
    const githubUserId = payload.sender.id;
    const user = await fetchUserById(githubUserId);

    // TODO: As Drizzle ORM doesn't return anything when .returning() is used,
    // we can't get the id of the user that was inserted. We should probably
    // change the schema that follows Github's id as the primary key.
    try {
      await db
        .insert(users)
        .values({
          company: user.company,
          emailAddress: user.email,
          githubAvatar: user.avatar_url,
          githubHandle: user.login,
          githubUserId: user.id,
          location: user.location,
          name: user.name,
          twitterHandle: user.twitter_username,
        })
        .onConflictDoNothing({ target: users.githubUserId });
    } catch (error) {
      console.error("Error inserting user", error);
    }

    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.githubUserId, githubUserId),
      });

      if (user) {
        await db.insert(events).values({
          eventType: "star.created",
          githubRepo: payload.repository.id,
          // See the TODO above; ideally this ID should returned from the
          // insertion which isn't supported. To use Github's id as the primary
          // key, we need to change the schema.
          userId: user.id,
        });
      }
    } catch (error) {
      console.error("Error inserting event", error);
    }
  });
});

export { api };
