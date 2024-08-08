import type { Endpoints } from "@octokit/types";
import type { Webhooks } from "@octokit/webhooks";

import type { Db } from "./db";

export type GithubUser = Endpoints["GET /users/{username}"]["response"];

type Variables = {
  webhooks: Webhooks;
  db: Db;
  fetchUserById: (id: number) => Promise<GithubUser>;
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
