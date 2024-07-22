import type { Webhooks } from "@octokit/webhooks";

import type { Db } from "./db";

type Variables = {
  webhooks: Webhooks;
  db: Db;
  fetchUserById: (userId: number) => Promise<unknown>;
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

// TODO (Oscar): Investigate if these types are redundant
export type GithubEvent = {
  createdBy: number;
  timestamp?: Date;
  type: string;
  action: string | null;
  event_id?: number | null;
  repo: number;
};

export type GithubUser = {
  gitHub_id: number;
  gitHub_handle: string;
  gitHub_avatar: string;
  name: string | null;
  company?: string | null;
  location?: string | null;
  email?: string | null;
  bio?: string | null;
  twitter_handle?: string | null;
};
