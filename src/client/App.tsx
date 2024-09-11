import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { AdminDashboard } from "./AdminDashboard";
import { Dashboard } from "./Dashboard";
import { Login } from "./Login";
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

function Component(component: ClientComponent) {
  switch (component.type) {
    case "dashboard":
      return <Dashboard {...component.props} />;
    case "adminDashboard":
      return <AdminDashboard {...component.props} />;
    case "login":
      return <Login />;
  }
}
