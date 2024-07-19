import { render } from "hono/jsx/dom";

import { App } from "./App";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = document.getElementById("root")!;
render(<App />, root);
