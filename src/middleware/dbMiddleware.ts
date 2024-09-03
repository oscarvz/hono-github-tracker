import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";

import * as schema from "../db";
import type { Db, GetRepositoriesWithEvents, HonoEnv } from "../types";

let db: Db | undefined;

function getDbInstance(url: string) {
  if (!db) {
    const sql = neon(url);
    db = drizzle(sql, { schema });
  }

  return db;
}

/**
 * Middleware to add the database instance to the context.
 */
export const dbMiddleware = createMiddleware<HonoEnv, "*">(async (c, next) => {
  const db = getDbInstance(c.env.DATABASE_URL);

  const getRepositoriesWithEvents: GetRepositoriesWithEvents = async (
    repoId: number,
  ) => {
    try {
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

      const repositories = repositoriesWithEvents.map((repository) => {
        const users = repository.events.reduce<Array<schema.User>>(
          (users, { user }) => {
            const containsUser = users.some(({ id }) => id === user.id);
            return containsUser ? users : users.concat(user);
          },
          [],
        );

        return {
          ...repository,
          users,
        };
      });

      return repositories;
    } catch (error) {
      throw new Error(`Error fetching repository: ${error}`);
    }
  };

  c.set("db", db);
  c.set("getRepositoriesWithEvents", getRepositoriesWithEvents);

  await next();
});
