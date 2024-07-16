import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";

let db: NeonHttpDatabase<typeof schema> | undefined;

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
