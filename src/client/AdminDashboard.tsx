import {
  AppShell,
  Group,
  NavLink,
  Space,
  Table,
  type TableData,
  Tabs,
  Text,
} from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import type { AdminDashboardProps } from "./types";

export function AdminDashboard({ repositories, params }: AdminDashboardProps) {
  const [repoId, setRepoId] = useState(params?.repoId || null);
  const [activeTab, setActiveTab] = useState<string | null>(
    params?.activeTab || "events",
  );

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!repoId) {
      const repoId = repositories[0].id;
      setRepoId(repoId);
    }

    if (repoId) {
      url.searchParams.set("repoId", repoId.toString());
    }

    if (activeTab) {
      url.searchParams.set("activeTab", activeTab);
    }

    window.history.replaceState(null, "", url.toString());
  }, [repoId, activeTab, repositories]);

  const eventsTableData: TableData = useMemo(() => {
    const events =
      repositories.find(({ id }) => id === repoId)?.events ||
      repositories[0].events;

    return {
      caption: "Events",
      head: ["User ID", "Date", "Event", "Action"],
      body: events.map(({ userId, createdAt, eventAction, eventName }) => {
        const date = createdAt ? new Date(createdAt).toDateString() : "unknown";
        return [userId, date, eventName, eventAction];
      }),
    };
  }, [repoId, repositories]);

  const usersTableData: TableData = useMemo(() => {
    const users =
      repositories.find(({ id }) => id === repoId)?.users ||
      repositories[0].users;

    return {
      caption: "Users",
      head: [
        "Company",
        "Email",
        "Handle",
        "Location",
        "Name",
        "Role",
        "Twitter",
      ],
      body: users.map(
        ({
          company,
          emailAddress,
          handle,
          location,
          name,
          role,
          twitterHandle,
        }) => [
          company,
          emailAddress,
          handle,
          location,
          name,
          role,
          twitterHandle,
        ],
      ),
    };
  }, [repoId, repositories]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm" }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Text size="lg" fw="bold">
            Hono Github Tracker
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        Repositories
        {repositories.map(({ fullName, id }) => (
          <NavLink
            key={id}
            label={fullName}
            leftSection={<IconBrandGithub size="1rem" stroke={1.5} />}
            variant="subtle"
            active={id === repoId}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        Events
        <Space h="lg" />
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab key="events" value="events">
              Events
            </Tabs.Tab>
            <Tabs.Tab key="users" value="users">
              Users
            </Tabs.Tab>
          </Tabs.List>

          <Space h="lg" />

          <Tabs.Panel value="events">
            <Table
              data={eventsTableData}
              striped
              highlightOnHover
              withTableBorder
            />
          </Tabs.Panel>

          <Tabs.Panel value="users">
            <Table
              data={usersTableData}
              striped
              highlightOnHover
              withTableBorder
            />
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
}
