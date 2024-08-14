import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createMiddleware } from "hono/factory";

import * as schema from "../db";
import type { Db, HonoEnv } from "../types";

let databaseInstance: Db | undefined;

/**
 * Middleware to add the database instance to the context.
 */
export const dbMiddleware = createMiddleware<HonoEnv, "*">(async (c, next) => {
  const db = databaseInstance
    ? databaseInstance
    : drizzle(neon(c.env.DATABASE_URL), { schema });

  c.set("db", db);

  await next();
});
