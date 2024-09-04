import { Button, Checkbox, Table } from "@mantine/core";
import { hc } from "hono/client";
import { useState } from "react";

import type { EventsApi } from "../../api";
import type { Event } from "../../db";

type EventstableProps = {
  events: Array<Event>;
};

const eventsClient = hc<EventsApi>("/api/events");
const eventDeleter = eventsClient[":id"].$delete;

export function EventsTable({ events }: EventstableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // TODO: Add Tanstack Query mutation handler
  const deleteEvent = async (eventId: Event["id"]) => {
    const id = eventId.toString();
    try {
      await eventDeleter({ param: { id } });
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  const rows = events.map(
    ({ id, eventName, eventAction, createdAt, userId }) => (
      <Table.Tr
        key={id}
        bg={
          selectedRows.includes(id)
            ? "var(--mantine-color-blue-light)"
            : undefined
        }
      >
        <Table.Td>
          <Checkbox
            aria-label="Select row"
            checked={selectedRows.includes(id)}
            onChange={(event) =>
              setSelectedRows(
                event.currentTarget.checked
                  ? [...selectedRows, id]
                  : selectedRows.filter((selectedId) => selectedId !== id),
              )
            }
          />
        </Table.Td>
        <Table.Td>{userId}</Table.Td>
        <Table.Td>{new Date(createdAt).toDateString()}</Table.Td>
        <Table.Td>{eventName}</Table.Td>
        <Table.Td>{eventAction}</Table.Td>
        <Table.Td>
          <Button
            variant="outline"
            color="red"
            size="compact-xs"
            radius="xs"
            onClick={() => deleteEvent(id)}
          >
            Delete
          </Button>
        </Table.Td>
      </Table.Tr>
    ),
  );

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th /> {/* TODO: Checkbox to handle event actions */}
          <Table.Th>User ID</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th>Event</Table.Th>
          <Table.Th>Action</Table.Th>
          <Table.Th>DELETE</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
