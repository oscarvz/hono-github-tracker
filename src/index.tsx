import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { getDb } from "../db";
import { getUserInfo, storeUserInfo } from "./userHandler";
import { User } from "./user";
import WEBHOOKS, { Webhooks } from "@octokit/webhooks";
import SCHEMA from "@octokit/webhooks-schemas";
import { time } from "drizzle-orm/mysql-core";
import { handleGitHubEvent } from "./githubEventHandler";
import { GithubEvent } from "./githubEvent";

type EnvVars = {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
};

const app = new Hono<{ Bindings: EnvVars }>();

app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
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
