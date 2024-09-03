import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mantine/core/styles.css";
import { useEffect, useRef } from "react";

import { AdminDashboard } from "./AdminDashboard";
import { Dashboard } from "./Dashboard";
import type { ClientComponent } from "./types";

export function App(props: ClientComponent) {
  const queryClient = useRef(new QueryClient());

  // Remove the data-props attribute after hydration
  useEffect(() => {
    const rootElement = document.getElementById("root");
    rootElement?.removeAttribute("data-props");
  }, []);

  return (
    <QueryClientProvider client={queryClient.current}>
      <MantineProvider defaultColorScheme="auto">
        <Component {...props} />
      </MantineProvider>
    </QueryClientProvider>
  );
}

function Component({ type, props }: ClientComponent) {
  switch (type) {
    case "dashboard":
      return <Dashboard {...props} />;
    case "adminDashboard":
      return <AdminDashboard {...props} />;
  }
}
