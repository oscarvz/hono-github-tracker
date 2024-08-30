import { Table, type TableData } from "@mantine/core";
import { useMemo } from "react";

import type { AdminDashboardProps } from "../types";

type UsersTableProps = Pick<AdminDashboardProps, "repositories"> & {
  repoId?: number;
};

export function UsersTable({ repoId, repositories }: UsersTableProps) {
  const usersTableData: TableData = useMemo(() => {
    const users =
      repositories.find(({ id }) => id === repoId)?.users ||
      repositories[0].users;

    return {
      caption: "Users",
      head: [
        "Handle",
        "Name",
        "Location",
        "Role",
        "Email",
        "Twitter",
        "Company",
      ],
      body: users.map(
        ({
          handle,
          name,
          location,
          role,
          emailAddress,
          twitterHandle,
          company,
        }) => [
          handle,
          name,
          location,
          role,
          emailAddress,
          twitterHandle,
          company,
        ],
      ),
    };
  }, [repoId, repositories]);

  return (
    <Table data={usersTableData} striped highlightOnHover withTableBorder />
  );
}
