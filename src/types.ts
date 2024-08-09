import type { Endpoints } from "@octokit/types";
import type { Webhooks } from "@octokit/webhooks";

import type { Db } from "./db";

type GithubUserResponse = Endpoints["GET /users/{username}"]["response"];
export type GithubUser = GithubUserResponse["data"];
export type GithubUserId = GithubUser["id"];

type Variables = {
  webhooks: Webhooks;
  db: Db;
  fetchUserById: (id: GithubUserId) => Promise<GithubUser>;
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
