import { render } from "hono/jsx/dom";

import { Client } from "./Client";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = document.getElementById("root")!;
render(<Client />, root);
