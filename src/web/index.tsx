import { Hono } from "hono";

import type { DashboardProps } from "../client";
import { App } from "../client/App";
import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use("*", reactRendererMiddleware);

web.get("/", async (c) => {
  const db = c.var.db;

  const repositories = await db.query.repositories.findMany();
  const props: DashboardProps = { repositories };

  return c.render(<App type="dashboard" props={props} />, {
    title: "Dashboard",
    clientComponent: {
      type: "dashboard",
      props,
    },
  });
});

export default web;
