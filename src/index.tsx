import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { events, users } from "./db";
import {
  dbMiddleware,
  githubApiMiddleware,
  githubWebhooksMiddleware,
} from "./middleware";
import type { HonoEnv } from "./types";

const app = new Hono<HonoEnv>();

app.use(createHonoMiddleware(app));
app.use(dbMiddleware);
app.use("/ghwh", githubApiMiddleware);
app.use("/ghwh", githubWebhooksMiddleware);

app.post("/ghwh", async (c) => {
  const db = c.get("db");
  const webhooks = c.get("webhooks");
  const fetchUserById = c.get("fetchUserById");

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

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/users", async (c) => {
  const db = c.get("db");
  const users = await db.query.users.findMany();

  if (users.length > 0) {
    return c.html(
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>,
    );
  }

  return c.html(<h1>No users... yet</h1>);
});

app.get("/client", (c) =>
  c.html(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Dashboard</title>
        {import.meta.env.PROD ? (
          <script type="module" src="/static/client.js" />
        ) : (
          <script type="module" src="/src/client/index.tsx" />
        )}
      </head>
      <body>
        <div id="root" />
      </body>
    </html>,
  ),
);

export default app;
