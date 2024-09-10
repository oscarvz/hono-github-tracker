import { Octokit } from "@octokit/core";
import { createMiddleware } from "hono/factory";

import type { FetchStargazers, FetchUserById, HonoEnv } from "../types";

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
    const githubToken = c.env.GITHUB_API_TOKEN;
    const octokit = getOctokitInstance(githubToken);

    const fetchStargazers: FetchStargazers = async ({ owner, repo }) => {
      try {
        const { data } = await octokit.request(
          "GET /repos/{owner}/{repo}/stargazers",
          { owner, repo },
        );

        console.log("Stargazers", data);
        return data;
      } catch (error) {
        throw new Error(`Github API: error fetching stargazers: ${error}`);
      }
    };

    const fetchUserById: FetchUserById = async (id) => {
      try {
        const { data } = await octokit.request("GET /user/{id}", { id });
        return data;
      } catch (error) {
        throw new Error(`Github API: error fetching user by id: ${error}`);
      }
    };

    c.set("fetchStarGazers", fetchStargazers);
    c.set("fetchUserById", fetchUserById);

    await next();
  },
);
