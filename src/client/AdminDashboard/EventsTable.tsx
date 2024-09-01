import { Checkbox, Table } from "@mantine/core";
import { hc } from "hono/client";
import { useState } from "react";

import type { EventsApi } from "../../api";
import type { Event } from "../../db";

type EventstableProps = {
  events: Array<Event>;
};

const eventsClient = hc<EventsApi>("/api/events");

export function EventsTable({ events }: EventstableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleOnDelete = async (id: number) => {
    try {
      await eventsClient[":id"].$delete({
        param: { id: id.toString() },
      });
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
          <button type="button" onClick={() => handleOnDelete(id)}>
            delete
          </button>
        </Table.Td>
      </Table.Tr>
    ),
  );

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th />
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
