import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { getDb } from "../db";
import { getUserInfo } from "./userHandler";

type EnvVars = {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
};

const app = new Hono<{ Bindings: EnvVars }>();

app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/user", async (c) => {
  try {
    const info = await getUserInfo("evanshortiss", c.env.GITHUB_TOKEN);
    console.log(info);
    return c.json(info);
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

export default app;
