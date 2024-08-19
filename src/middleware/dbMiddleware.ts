import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";

import * as schema from "../db";
import type { Db, HonoEnv } from "../types";

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
  c.set("db", db);

  await next();
});
