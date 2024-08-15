import type { Props } from "@hono/react-renderer";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { App } from "./App";

const rootElement = document.getElementById("root");
const propsData = rootElement?.getAttribute("data-props");
if (!rootElement || !propsData) {
  throw new Error("Root element not found");
}

// TODO: Validate the props data
const props: Props["clientProps"] = JSON.parse(propsData);

hydrateRoot(
  rootElement,
  <StrictMode>
    <App greeting={props} />
  </StrictMode>,
);
