import type { Endpoints } from "@octokit/types";
import type { Webhooks } from "@octokit/webhooks";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import type * as schema from "./db";

export type Db = NeonHttpDatabase<typeof schema>;

type Variables = {
  webhooks: Webhooks;
  db: Db;
  getRepositoriesWithEvents: GetRepositoriesWithEvents;
  fetchUserById: FetchUserById;
  fetchRepoWithUsersAndEvents: FetchRepoWithUsersAndEvents;
};

type EnvVars = {
  DATABASE_URL: string;
  GITHUB_API_TOKEN: string;
  GITHUB_BEARER_TOKEN: string;
  GITHUB_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
};

export type HonoEnv = {
  Variables: Variables;
  Bindings: EnvVars;
};

type GithubUser = Endpoints["GET /users/{username}"]["response"]["data"];

export type FetchUserById = (id: GithubUser["id"]) => Promise<GithubUser>;

export type RepositoriesWithEvents = Array<
  Pick<schema.Repository, "id" | "fullName"> & {
    events: Array<schema.Event>;
    users: Array<schema.User>;
  }
>;

export type GetRepositoriesWithEvents = (
  id: schema.Repository["id"],
) => Promise<RepositoriesWithEvents>;

export type FetchRepoWithUsersAndEvents = ({
  owner,
  repo,
  count,
}: {
  owner: string;
  repo: string;
  count: number;
}) => Promise<
  schema.RepositoryInsert & {
    stargazers: { users: Array<schema.UserInsert> };
    watchers: {
      totalCount: number;
      users: Array<schema.UserInsert>;
    };
  }
>;

// Octokit isn't exporting this particular type, so we extract it from the
// `verifyAndReceive` method.
export type WebhookEventName = Parameters<
  InstanceType<typeof Webhooks>["verifyAndReceive"]
>[number]["name"];
