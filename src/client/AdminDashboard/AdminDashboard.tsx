import { AppShell, Group, NavLink, Space, Tabs, Text } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { type InferRequestType, hc } from "hono/client";
import { useEffect, useState } from "react";

import type { RepoApi } from "../../api";
import type { AdminDashboardProps } from "../types";
import { EventsTable } from "./EventsTable";
import { UsersTable } from "./UsersTable";

const repositoriesClient = hc<RepoApi>("/api/repositories");
const getter = repositoriesClient[":id"].$get;

function getReposWithEvents(params: InferRequestType<typeof getter>) {
  return async () => {
    try {
      const reposWithEvents = await getter(params);
      const events = await reposWithEvents.json();
      return events;
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };
}

export function AdminDashboard({ repositories, params }: AdminDashboardProps) {
  const [repoId, setRepoId] = useState(params?.repoId || repositories[0].id);
  const [activeTab, setActiveTab] = useState(params?.activeTab || "users");

  const { data } = useQuery({
    queryKey: ["repos", activeTab, repoId],
    queryFn: getReposWithEvents({ param: { id: repoId?.toString() || "" } }),
    initialData: { repositories },
    staleTime: (query) => {
      const activeRepo = query.state.data?.repositories.find(
        ({ id }) => id === repoId,
      );

      const hasEmptyData =
        activeRepo?.events.length === 0 || activeRepo?.users.length === 0;

      return hasEmptyData ? 0 : 60 * 1000;
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

  const events =
    data?.repositories.find(({ id }) => id === repoId)?.events ||
    data?.repositories.at(0)?.events ||
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
            <UsersTable
              repoId={repoId}
              repositories={data?.repositories || []}
            />
          </Tabs.Panel>

          <Tabs.Panel value="events">
            <EventsTable events={events} />
          </Tabs.Panel>
        </Tabs>
      </AppShell.Main>
    </AppShell>
  );
}
