import { Octokit } from "@octokit/core";
import { createMiddleware } from "hono/factory";

import type { GithubUser, HonoEnv } from "../types";

export const githubApiMiddleware = createMiddleware<HonoEnv, "ghws">(
  async (c, next) => {
    const githubToken = c.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: githubToken });

    async function fetchUserById(id: number) {
      const res = await octokit.request("GET /user/{id}", { id });
      return res as GithubUser;
    }

    c.set("fetchUserById", fetchUserById);

    await next();
  },
);
