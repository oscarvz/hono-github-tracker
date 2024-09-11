import { AppShell, Group, NavLink, Space, Tabs, Text } from "@mantine/core";
import { usePrevious } from "@mantine/hooks";
import { IconBrandGithub } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getReposWithEvents } from "../rpc";
import type { AdminDashboardProps } from "../types";
import { EventsTable } from "./EventsTable";
import { UsersTable } from "./UsersTable";

export function AdminDashboard({ repositories, params }: AdminDashboardProps) {
  const [repoId, setRepoId] = useState(params?.repoId || repositories[0].id);
  const [activeTab, setActiveTab] = useState(params?.activeTab || "users");
  const previousRepoId = usePrevious(repoId);

  const { data } = useQuery({
    queryKey: ["repos", repoId],
    queryFn: getReposWithEvents(repoId?.toString()),
    initialData: { repositories },
    staleTime: (query) => {
      const fiveMinutes = 60 * 5 * 1000;
      if (!previousRepoId) {
        return fiveMinutes;
      }

      const isSameRepo = query.queryKey.includes(previousRepoId);
      return isSameRepo ? fiveMinutes : 0;
    },
  });

  useEffect(() => {
    const url = new URL(window.location.href);

    if (repoId) {
      url.searchParams.set("repoId", repoId.toString());
    }

    if (activeTab) {
      url.searchParams.set("activeTab", activeTab);
    }

    window.history.replaceState(null, "", url.toString());
  }, [repoId, activeTab]);

  const users =
    data?.repositories.find(({ id }) => id === repoId)?.users ||
    data?.repositories.at(0)?.users;

  const events =
    data?.repositories.find(({ id }) => id === repoId)?.events ||
    data?.repositories.at(0)?.events;

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
        <Space h="lg" />
        {repositories.map(({ fullName, id }) => (
          <NavLink
            key={id}
            label={fullName}
            leftSection={<IconBrandGithub size="1rem" stroke={1.5} />}
            variant="light"
            active={id === repoId}
            onClick={() => setRepoId(id)}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Space h="lg" />
        <Tabs
          value={activeTab}
          onChange={(tab) => tab && setActiveTab(tab)}
          defaultValue="users"
        >
          <Tabs.List>
            <Tabs.Tab key="users" value="users">
              Users
            </Tabs.Tab>
            <Tabs.Tab key="events" value="events">
              Events
            </Tabs.Tab>
          </Tabs.List>

          <Space h="lg" />

          <Tabs.Panel value="users">
            {users && <UsersTable users={users} />}
          </Tabs.Panel>

          <Tabs.Panel value="events">
            {events && <EventsTable events={events} />}
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
}
