import type { GithubEvent } from "./githubEvent";
import { events, getDb } from "../db";

export const handleGitHubEvent = async (
  event: GithubEvent,
  _: JSON,
  databaseUrl: string,
) => {
  console.log("The event: ", event);
  const db = getDb(databaseUrl);

  if (event.type === "star") {
    console.log("star");

    if (event.action === "created") {
      // event.timestamp = body.starred_at
      event.timestamp = new Date();

      console.log(event);
      // console.log("A user starred your repo: ", event.repo , " at: ", event.timestamp)
    }
    if (event.action === "deleted") {
      event.timestamp = new Date();
      console.log(event);
      // console.log("a user deleted a star: ", event.repo)
    }

    await db
      .insert(events)
      .values({
        userId: event.createdBy,
        githubRepo: event.repo,
        eventType: event.type,
        eventID: event.event_id,
        action: event.action,
        createdAt: event.timestamp,
      })
      .onConflictDoNothing();
  } else if (event.type === "issues") {
    //event.event_id = body.issue.id
    event.timestamp = new Date();
    console.log("issue");
    //const timestamp = body.issue.created_at

    //    await db.insert(events).values({
    //     userId: event.createdBy,
    //     githubRepo: event.repo,
    //     eventType: "issue",
    //     eventID: event.event_id,
    //     action: event.action,
    //     createdAt: event.timestamp
    // }).onConflictDoNothing();
  } else {
    console.log("Event type ", event.type, " is not supported and handled yet");
  }
};
