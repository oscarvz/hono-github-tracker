import {
  AppShell,
  Badge,
  Card,
  Grid,
  GridCol,
  Group,
  Text,
} from "@mantine/core";

import type { DashboardProps } from "./types";

export function Dashboard({ repositories }: DashboardProps) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header p="md">
        <Text size="lg" fw="bold">
          Hono Github Tracker
        </Text>
      </AppShell.Header>

      <AppShell.Main>
        <Grid align="stretch">
          {repositories.map(
            ({
              id,
              description,
              fullName,
              latestStar,
              stargazersCount,
              watchersCount,
            }) => (
              <GridCol key={id} span={4}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Text fw={500}>{fullName}</Text>

                  {description && (
                    <Text size="sm" c="dimmed">
                      {description}
                    </Text>
                  )}

                  {latestStar && (
                    <Text size="sm" c="dimmed">
                      Latest star: {latestStar}
                    </Text>
                  )}

                  <Group mt="md">
                    <Badge color="blue">{watchersCount} watchers</Badge>
                    <Badge color="yellow">{stargazersCount} stars</Badge>
                  </Group>
                </Card>
              </GridCol>
            ),
          )}
        </Grid>
      </AppShell.Main>
    </AppShell>
  );
}
