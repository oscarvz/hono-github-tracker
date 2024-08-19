import { useEffect } from "react";
import "simpledotcss/simple.min.css";

import "./style.css";
import type { DashboardProps } from "./types";

export function Dashboard({ latestStar }: DashboardProps) {
  // Remove the data-props attribute after hydration
  useEffect(() => {
    const rootElement = document.getElementById("root");
    rootElement?.removeAttribute("data-props");
  }, []);

  if (!latestStar) {
    return <p>Nothing to see here</p>;
  }

  return (
    <div>
      <p>
        {latestStar ? <>Latest star: {latestStar}</> : "Nothing to see here"}
      </p>
    </div>
  );
}
