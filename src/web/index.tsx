import { Hono } from "hono";

import type { AdminDashboardProps, DashboardProps } from "../client";
import { App } from "../client/App";
import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv, RepositoriesWithEvents } from "../types";

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

// TODO: Add authentication middleware
web.get("/admin", async (c) => {
  const db = c.var.db;
  const getRepositoriesWithEvents = c.var.getRepositoriesWithEvents;
  const repoIdParam = c.req.query("repoId");
  const activeTabParam = c.req.query("activeTab");

  let storedRepositories: RepositoriesWithEvents = [];

  const repoId = repoIdParam
    ? Number.parseInt(repoIdParam, 10)
    : await db.query.repositories
        .findFirst({ columns: { id: true } })
        .then((repo) => repo?.id);

  if (repoId) {
    storedRepositories = await getRepositoriesWithEvents(repoId);
  }

  const props: AdminDashboardProps = {
    repositories: storedRepositories,
    params: {
      repoId,
      activeTab: activeTabParam,
    },
  };

  return c.render(<App type="adminDashboard" props={props} />, {
    title: "Admin Dashboard",
    clientComponent: {
      type: "adminDashboard",
      props,
    },
  });
});

export default web;
