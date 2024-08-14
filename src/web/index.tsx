import { Hono } from "hono";

import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use("*", reactRendererMiddleware);

web.get("/", (c) =>
  c.render(<div id="root" />, {
    title: "Dashboard",
  }),
);

export default web;
