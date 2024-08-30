import { Table, type TableData } from "@mantine/core";
import { useMemo } from "react";

import type { AdminDashboardProps } from "../types";

type UsersTableProps = Pick<AdminDashboardProps, "repositories"> & {
  repoId?: number;
};

export function EventsTable({ repositories, repoId }: UsersTableProps) {
  const eventsTableData: TableData = useMemo(() => {
    const events =
      repositories.find(({ id }) => id === repoId)?.events ||
      repositories[0].events;

    return {
      caption: "Events",
      head: ["User ID", "Date", "Event", "Action"],
      body: events.map(({ userId, createdAt, eventAction, eventName }) => {
        const date = createdAt ? new Date(createdAt).toDateString() : "";
        return [userId, date, eventName, eventAction];
      }),
    };
  }, [repoId, repositories]);

  return (
    <Table data={eventsTableData} striped highlightOnHover withTableBorder />
  );
}
