import { Hono } from "hono";
import { createHonoMiddleware } from "@fiberplane/hono";

const app = new Hono();

app.use(createHonoMiddleware(app));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
