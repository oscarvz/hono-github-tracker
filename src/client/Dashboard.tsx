import { AppShell, Skeleton } from "@mantine/core";

import type { DashboardProps } from "./types";

export function Dashboard({ latestStar }: DashboardProps) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header p="md">Github Tracker</AppShell.Header>
      <AppShell.Navbar p="md">
        Navbar
        {Array(15)
          .fill(0)
          .map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {latestStar ? <>Latest star: {latestStar}</> : "Nothing to see here"}
      </AppShell.Main>
    </AppShell>
  );
}
