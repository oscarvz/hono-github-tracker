import { Hono } from "hono";
import { createHonoMiddleware } from "@fiberplane/hono";
import { getDb } from "../db";

const app = new Hono<{ Bindings: { DATABASE_URL: string } }>();

app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
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
