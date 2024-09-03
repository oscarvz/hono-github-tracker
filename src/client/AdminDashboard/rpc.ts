import { type InferRequestType, hc } from "hono/client";

import type { RepoApi } from "../../api";
import type { AdminDashboardProps } from "../types";

const repositoriesClient = hc<RepoApi>("/api/repositories");
const repositoriesGetter = repositoriesClient[":id"].$get;

export function getReposWithEvents(
  params: InferRequestType<typeof repositoriesGetter>,
) {
  return async () => {
    try {
      const response = await repositoriesGetter(params);
      /*
        biome-ignore lint/suspicious/noExplicitAny: HACK: `createdAt` doesn't
        get inferred correctly
      */
      const repositories: any = await response.json();
      return repositories as Pick<AdminDashboardProps, "repositories">;
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };
}
