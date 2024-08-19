import { Hono } from "hono";

import { Dashboard } from "../client/Dashboard";
import type { DashboardProps } from "../client/types";
import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use("*", reactRendererMiddleware);

web.get("/", async (c) => {
  const db = c.var.db;

  // FIXME: Investigate why this breaks in production build
  const userWithLatestStar = await db.query.users.findFirst({
    with: {
      interactions: {
        where: ({ eventType }, { eq }) => eq(eventType, "star.created"),
        orderBy: ({ createdAt }, { asc }) => asc(createdAt),
      },
    },
  });

  const props: DashboardProps = {
    latestStar: userWithLatestStar?.githubHandle,
  };

  return c.render(<Dashboard {...props} />, {
    title: "Dashboard",
    clientComponent: {
      type: "dashboard",
      props,
    },
  });
});

export default web;
