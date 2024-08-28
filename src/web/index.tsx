import { Hono } from "hono";

import { App } from "../client/App";
import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use("*", reactRendererMiddleware);

web.get("/", async (c) => {
  const db = c.var.db;

  // FIXME: Investigate why this breaks in production build
  const userWithLatestStar = await db.query.users.findFirst({
    with: {
      events: {
        where: ({ eventName, eventAction }, { and, eq }) =>
          and(eq(eventName, "star"), eq(eventAction, "created")),
        orderBy: ({ createdAt }, { asc }) => asc(createdAt),
      },
    },
  });

  const props = {
    latestStar: userWithLatestStar?.handle,
  };

  return c.render(<App type="dashboard" props={props} />, {
    title: "Dashboard",
    clientComponent: {
      type: "dashboard",
      props,
    },
  });
});

export default web;
