import { createHonoMiddleware } from "@fiberplane/hono";
import { Webhooks } from "@octokit/webhooks";
import { Hono } from "hono";

import { getDb } from "../db";
import type { GithubEvent } from "./githubEvent";
import { handleGitHubEvent } from "./githubEventHandler";
import { getUserInfo, storeUserInfo } from "./userHandler";

type Variables = {
  webhooks: Webhooks;
};

type EnvVars = {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
};

const app = new Hono<{ Bindings: EnvVars; Variables: Variables }>();

app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use("/ghwh", async (c, next) => {
  const webhooks = new Webhooks({ secret: c.env.GITHUB_WEBHOOK_SECRET });
  const payload = await c.req.text();

  // biome-ignore lint/suspicious/noExplicitAny: type not exposed by octokit/webhooks
  const name = c.req.header("x-github-event") as any;
  const signature = c.req.header("x-hub-signature-256");
  const id = c.req.header("x-request-id");
  if (!id || !name || !signature) {
    return c.text("Missing headers", 400);
  }

  try {
    await webhooks.verifyAndReceive({
      id,
      name,
      signature,
      payload,
    });

    c.set("webhooks", webhooks);
  } catch (error) {
    // TODO: Handle error return
    console.error("error in catch", error);
  }

  await next();
});

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
  const db = getDb(c.env.DATABASE_URL);
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

        <title>The juicy bits</title>

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

// app.post("/githubWebhook", async (c)=>{

//  const webhooks = new Webhooks({
//     secret: "honk-honk-honk"

//   })

//   const body = await c.req.json();
//   const header = await c.req.header();
//   const eventType = header["x-github-event"];

//     webhooks
//       .verifyAndReceive({
//         id: header["x-request-id"],
//         name: "hello",
//         signature: header["x-hub-signature"],
//         payload: body,
//       })
//       .catch(console.error);
//   })

export default app;
