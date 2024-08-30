import { Hono } from "hono";

import type { AdminDashboardProps, DashboardProps } from "../client";
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

// TODO: Add authentication middleware
web.get("/admin", async (c) => {
  const repoId = c.req.query("repoId");
  const activeTab = c.req.query("activeTab");

  const db = c.var.db;

  const repositoriesWithEvents = await db.query.repositories.findMany({
    with: {
      events: true,
    },
  });

  const users = await db.query.users.findMany({
    with: {
      events: true,
    },
  });

  const repositories = repositoriesWithEvents.map((repo) => {
    const usersForRepo = users.filter(({ id }) =>
      repo.events.some(({ userId }) => userId === id),
    );

    return {
      ...repo,
      users: usersForRepo,
    };
  });

  let parsedRepoId: number | undefined;
  if (repoId) {
    parsedRepoId = Number.parseInt(repoId, 10);
  }

  const props: AdminDashboardProps = {
    repositories,
    params: {
      repoId: parsedRepoId,
      activeTab,
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
