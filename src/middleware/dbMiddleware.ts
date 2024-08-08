import { createMiddleware } from "hono/factory";

import { getDb } from "../db";
import type { HonoEnv } from "../types";

/**
 * Middleware to add the database instance to the context.
 */
export const dbMiddleware = createMiddleware<HonoEnv, "*">(async (c, next) => {
  const db = getDb(c.env.DATABASE_URL);
  c.set("db", db);
  await next();
});
