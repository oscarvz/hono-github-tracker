import { Octokit } from "@octokit/core";
import { createMiddleware } from "hono/factory";

import type {
  FetchRepoWithUsersAndEvents,
  FetchUserById,
  HonoEnv,
} from "../types";

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
    const fetchRepoWithUsersAndEvents: FetchRepoWithUsersAndEvents = async ({
      owner,
      repo,
      count,
    }) => {
      try {
        const { repository } = await octokit.graphql<{
          repository: ReturnType<FetchRepoWithUsersAndEvents>;
        }>(
          `
            query lastUsersWithInteractions($owner: String!, $repo: String!, $count: Int!) {
              repository(owner: $owner, name: $repo) {
                id: databaseId,
                fullName: nameWithOwner,
                name,
                description,
                stargazerCount,
                stargazers(last: $count) {
                  users: nodes {
                    id: databaseId,
                    avatar: avatarUrl,
                    handle: login,
                    name,
                    location,
                    company,
                    email,
                    twitterUsername
                  }
                }
                watchers(last: $count) {
                  totalCount,
                  users: nodes {
                    id: databaseId,
                    avatar: avatarUrl,
                    handle: login,
                    name,
                    location,
                    company,
                    email,
                    twitterUsername
                  }
                }
              }
            }
          `,
          {
            count,
            owner,
            repo,
          },
        );
        return repository;
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

    c.set("fetchRepoWithUsersAndEvents", fetchRepoWithUsersAndEvents);
    c.set("fetchUserById", fetchUserById);

    await next();
  },
);
