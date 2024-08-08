import { neon } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let db: Db | undefined;

/**
 * Returns the database instance. It will create a new instance if it doesn't
 * exist, or uses the same instance in the current session.
 * @param databaseUrl
 */
export function getDb(databaseUrl: string) {
  if (!db) {
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }

  return db;
}
