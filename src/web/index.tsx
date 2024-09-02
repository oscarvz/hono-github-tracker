import { Hono } from "hono";

import type { AdminDashboardProps, DashboardProps } from "../client";
import { App } from "../client/App";
import type { User } from "../db";
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
  const db = c.var.db;
  const repoIdParam = c.req.query("repoId");
  const activeTabParam = c.req.query("activeTab");

  let storedRepositories: AdminDashboardProps["repositories"] = [];

  const repoId = repoIdParam
    ? Number.parseInt(repoIdParam, 10)
    : await db.query.repositories
        .findFirst({ columns: { id: true } })
        .then((repo) => repo?.id);

  if (repoId) {
    const repositoriesWithEvents = await db.query.repositories.findMany({
      columns: {
        id: true,
        fullName: true,
      },
      with: {
        events: {
          where: (events, { eq }) => eq(events.repoId, repoId),
          with: { user: true },
        },
      },
    });

    storedRepositories = repositoriesWithEvents.map((repository) => {
      const users = repository.events.reduce<Array<User>>((users, { user }) => {
        const containsUser = users.some(({ id }) => id === user.id);
        return containsUser ? users : users.concat(user);
      }, []);

      return {
        ...repository,
        users,
      };
    });
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
