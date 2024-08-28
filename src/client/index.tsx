import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { App } from "./App";
import type { ClientComponent } from "./types";

const rootElement = document.getElementById("root");
const propsData = rootElement?.getAttribute("data-props");
if (!rootElement || !propsData) {
  throw new Error("Root element not found");
}

const clientComponent: ClientComponent = JSON.parse(propsData);

hydrateRoot(
  rootElement,
  <StrictMode>
    <App {...clientComponent} />
  </StrictMode>,
);
