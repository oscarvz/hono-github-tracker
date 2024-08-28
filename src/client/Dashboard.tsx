import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { useEffect } from "react";

import "./style.css";
import type { DashboardProps } from "./types";

export function Dashboard({ latestStar }: DashboardProps) {
  // Remove the data-props attribute after hydration
  useEffect(() => {
    const rootElement = document.getElementById("root");
    rootElement?.removeAttribute("data-props");
  }, []);

  return (
    <MantineProvider>
      <div>
        <p>
          {latestStar ? <>Latest star: {latestStar}</> : "Nothing to see here"}
        </p>
      </div>
    </MantineProvider>
  );
}
