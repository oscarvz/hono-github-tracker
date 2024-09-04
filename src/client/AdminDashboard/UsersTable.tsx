import { Table, type TableData } from "@mantine/core";
import { useMemo } from "react";

import type { User } from "../../db";

type UsersTableProps = {
  users: Array<User>;
};

export function UsersTable({ users }: UsersTableProps) {
  const usersTableData: TableData | undefined = useMemo(() => {
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
  }, [users]);

  return (
    <Table data={usersTableData} striped highlightOnHover withTableBorder />
  );
}
