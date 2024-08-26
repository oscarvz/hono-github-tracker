import { Octokit } from "@octokit/core";
import { createMiddleware } from "hono/factory";

import type { GithubUser, GithubUserId, HonoEnv } from "../types";

let octokitInstance: Octokit | undefined;

function getOctokitInstance(token: string) {
  if (!octokitInstance) {
    octokitInstance = new Octokit({ auth: token });
  }

  return octokitInstance;
}

/**
 * Middleware to interact with the Github API. It exposes the `fetchUserById`
 * function on the context.
 */
export const githubApiMiddleware = createMiddleware<HonoEnv, "ghws">(
  async (c, next) => {
    const githubToken = c.env.GITHUB_TOKEN;
    const octokit = getOctokitInstance(githubToken);

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
