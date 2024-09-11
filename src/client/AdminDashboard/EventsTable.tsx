import { Checkbox, Table } from "@mantine/core";
import { useState } from "react";

import type { Event } from "../../db";

type EventstableProps = {
  events: Array<Event>;
};

export function EventsTable({ events }: EventstableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const rows = events.map(
    ({ id, eventName, eventAction, createdAt, userId }, index) => (
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
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{userId}</Table.Td>
        <Table.Td>{new Date(createdAt).toDateString()}</Table.Td>
        <Table.Td>{eventName}</Table.Td>
        <Table.Td>{eventAction}</Table.Td>
      </Table.Tr>
    ),
  );

  return (
    <Table
      striped
      highlightOnHover
      withTableBorder
      stickyHeader
      stickyHeaderOffset={60}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th /> {/* TODO: Checkbox to handle event actions */}
          <Table.Th>#</Table.Th>
          <Table.Th>User ID</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th>Event</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
