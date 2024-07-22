import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { handleGitHubEvent } from "./githubEventHandler";
import { dbMiddleware, githubWebhooksMiddleware } from "./middleware";
import type { GithubEvent, HonoEnv } from "./types";
import { getUserInfo, storeUserInfo } from "./userHandler";

const app = new Hono<HonoEnv>();

app.use(createHonoMiddleware(app));
app.use(dbMiddleware);
app.use("/ghwh", githubWebhooksMiddleware);

app.post("/ghwh", async (c) => {
  const webhooks = c.get("webhooks");

  // TODO: Handle star events
  webhooks.on("star.created", async () => {});
});

app.get("/", (c) => c.text("Hello Hono!"));

// only for testing the UserHandler and the insert into the db
app.get("/user", async (c) => {
  try {
    const userInfo = await getUserInfo(36015705, c.env.GITHUB_TOKEN);
    const user = userInfo.user;
    await storeUserInfo(user, c.env.DATABASE_URL);
    return c.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return c.json({ error: "Failed to fetch user info" }, 500);
  }
});

app.get("/users", async (c) => {
  const db = c.var.db;
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

app.post("/githubWebhook", async (c) => {
  const header = c.req.header();
  const body = await c.req.json();

  const userGithubId = body.sender.id;

  try {
    const userInfo = await getUserInfo(userGithubId, c.env.GITHUB_TOKEN);
    console.log(userInfo);
    const userId = await storeUserInfo(userInfo.user, c.env.DATABASE_URL);

    const event: GithubEvent = {
      createdBy: userId,
      type: header["x-github-event"],
      action: body.action,
      repo: body.repository.id,
    };

    await handleGitHubEvent(event, body, c.env.DATABASE_URL);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return c.json({ error: "Failed to fetch user info" }, 500);
  }

  return c.html("Yeah");
});

export default app;
