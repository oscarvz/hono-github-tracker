import { render } from "hono/jsx/dom";

import { App } from "./App";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

render(<App />, root);
