import { type InferRequestType, hc } from "hono/client";

import type { RepoApi } from "../../api";
import type { AdminDashboardProps } from "../types";

const repositoriesClient = hc<RepoApi>("/api/repositories");
const repositoriesGetter = repositoriesClient[":id"].$get;

export function getReposWithEvents(
  id: InferRequestType<typeof repositoriesGetter>["param"]["id"],
) {
  return async () => {
    try {
      const response = await repositoriesGetter({ param: { id } });
      /*
        biome-ignore lint/suspicious/noExplicitAny: HACK: `createdAt` doesn't
        get inferred correctly: it returns it as a string instead of a Date.
        Though, it technically is a string after parsing JSON, it breaks the
        general type sharing of the schema for front- and back-end.
      */
      const repositories: any = await response.json();
      return repositories as Pick<AdminDashboardProps, "repositories">;
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };
}
