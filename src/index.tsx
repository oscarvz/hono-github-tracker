// import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { getDb } from "../db";
import { getUserInfo, storeUserInfo } from "./userHandler";

type EnvVars = {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
};

const app = new Hono<{ Bindings: EnvVars }>();

// app.use("/api*", createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// only for testing the UserHandler and the insert into the db
app.get("/user", async (c) => {
  try {
    const userInfo = await getUserInfo("evanshortiss", c.env.GITHUB_TOKEN);
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

export default app;
