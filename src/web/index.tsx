import { Hono } from "hono";

import { Dashboard } from "../client/Dashboard";
import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use("*", reactRendererMiddleware);

web.get("/", (c) => {
  const title = "Dashboard";
  const greeting = "welcome!";

  return c.render(<Dashboard greeting={greeting} />, {
    title,
    clientComponent: {
      type: "dashboard",
      props: { greeting },
    },
  });
});

export default web;
