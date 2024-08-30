import { AppShell, Group, NavLink, Space, Tabs, Text } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { AdminDashboardProps } from "../types";
import { EventsTable } from "./EventsTable";
import { UsersTable } from "./UsersTable";

export function AdminDashboard({ repositories, params }: AdminDashboardProps) {
  const [repoId, setRepoId] = useState(params?.repoId);
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

  const events =
    repositories.find(({ id }) => id === repoId)?.events ||
    repositories.at(0)?.events ||
    [];

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
        Wow look at all this data, izzit GDPR compliant?
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
            <EventsTable events={events} />
          </Tabs.Panel>

          <Tabs.Panel value="users">
            <UsersTable repoId={repoId} repositories={repositories} />
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
}
