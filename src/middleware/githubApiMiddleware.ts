import { createMiddleware } from "hono/factory";
import { Octokit } from "@octokit/core";

import type { HonoEnv } from "../types";

export const githubApiMiddleware = createMiddleware<HonoEnv, "ghws">(
  async (c, next) => {
    const githubToken = c.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: githubToken });

    const fetchUserById = async (userId: number) => {
      const { data } = await octokit.request("GET /user/{userId}", { userId });
      return data;
    };

    c.set("fetchUserById", fetchUserById);

    await next();
  },
);
