import type { Endpoints } from "@octokit/types";
import type { Webhooks } from "@octokit/webhooks";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import type * as schema from "./db";

export type Db = NeonHttpDatabase<typeof schema>;

type Variables = {
  webhooks: Webhooks;
  db: Db;
  fetchUserById: FetchUserById;
};

type EnvVars = {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
};

export type HonoEnv = {
  Variables: Variables;
  Bindings: EnvVars;
};

type GithubUser = Endpoints["GET /users/{username}"]["response"]["data"];

export type FetchUserById = (id: GithubUser["id"]) => Promise<GithubUser>;

// Octokit isn't exporting this particular type, so we extract it from the
// `verifyAndReceive` method.
export type WebhookEventName = Parameters<
  InstanceType<typeof Webhooks>["verifyAndReceive"]
>[number]["name"];

// Not the most robust check as we don't have an array available with all the
// possible event names, but it's enough to keep TS happy.
export function isWebhookEventName(
  header: string | undefined,
): header is WebhookEventName {
  return !!header;
}
