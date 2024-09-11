import { type InferRequestType, hc } from "hono/client";

import type { EventsApi, LoginApi, RepoApi } from "../api";
import type { Event } from "../db";
import type { AdminDashboardProps } from "./types";

const loginClient = hc<LoginApi>("/api/login");
const loginAction = loginClient.index.$post;

export async function login({
  password,
  userName,
}: InferRequestType<typeof loginAction>["json"]) {
  try {
    const response = await loginClient.index.$post({
      json: {
        userName,
        password,
      },
    });
    const text = await response.text();
    return text;
  } catch (error) {
    throw new Error(`Error logging in: ${error}`);
  }
}

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

const eventsClient = hc<EventsApi>("/api/events");
const eventDeleter = eventsClient[":id"].$delete;

export async function deleteEvent(eventId: Event["id"]) {
  const id = eventId.toString();
  try {
    await eventDeleter({ param: { id } });
  } catch (error) {
    console.error("Error deleting event: ", error);
  }
}
