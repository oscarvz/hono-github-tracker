import { reactRenderer } from "@hono/react-renderer";
import { Hono } from "hono";

import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use(
  "*",
  reactRenderer(
    ({ children }) => (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>Dashboard</title>
          {import.meta.env.PROD ? (
            <script type="module" src="/static/client.js" />
          ) : (
            <script type="module" src="/src/client/index.tsx" />
          )}
        </head>
        <body>{children}</body>
      </html>
    ),
    {
      docType: true,
    },
  ),
);

web.get("/", (c) => c.render(<div id="root" />));

export { web };
