import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { Dashboard } from "./Dashboard";
import { type ClientComponent, isDashboardProps } from "./types";

const rootElement = document.getElementById("root");
const propsData = rootElement?.getAttribute("data-props");
if (!rootElement || !propsData) {
  throw new Error("Root element not found");
}

const clientComponent: ClientComponent = JSON.parse(propsData);

const isDashboard = isDashboardProps(clientComponent);
if (!isDashboard) {
  throw new Error("Invalid props");
}

hydrateRoot(
  rootElement,
  <StrictMode>
    <Dashboard {...clientComponent.props} />
  </StrictMode>,
);
