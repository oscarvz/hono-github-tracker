import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { useEffect } from "react";

import { Dashboard } from "./Dashboard";
import type { ClientComponent } from "./types";

export function App(props: ClientComponent) {
  // Remove the data-props attribute after hydration
  useEffect(() => {
    const rootElement = document.getElementById("root");
    rootElement?.removeAttribute("data-props");
  }, []);

  return (
    <MantineProvider defaultColorScheme="auto">
      <Component {...props} />
    </MantineProvider>
  );
}

function Component({ type, props }: ClientComponent) {
  switch (type) {
    case "dashboard":
      return <Dashboard {...props} />;
    // case "adminDashboard":
    //   return <AdminDashboard {...props} />;
    default:
      return null;
  }
}
