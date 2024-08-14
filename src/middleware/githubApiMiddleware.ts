import { Octokit } from "@octokit/core";
import { createMiddleware } from "hono/factory";

import type { GithubUser, GithubUserId, HonoEnv } from "../types";

let octokitInstance: Octokit | undefined;

export const githubApiMiddleware = createMiddleware<HonoEnv, "ghws">(
  async (c, next) => {
    const githubToken = c.env.GITHUB_TOKEN;

    const octokit = octokitInstance
      ? octokitInstance
      : new Octokit({ auth: githubToken });

    c.set("fetchUserById", async (id: GithubUserId): Promise<GithubUser> => {
      try {
        const { data } = await octokit.request("GET /user/{id}", { id });
        return data;
      } catch (error) {
        throw new Error(`Github API: error fetching user by id: ${error}`);
      }
    });

    await next();
  },
);
