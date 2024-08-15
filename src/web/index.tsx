import { Hono } from "hono";

import { App } from "../client/App";
import { reactRendererMiddleware } from "../middleware";
import type { HonoEnv } from "../types";

const web = new Hono<HonoEnv>();

web.use("*", reactRendererMiddleware);

web.get("/", (c) => {
  const title = "Dashboard";
  const props = "welcome!";

  return c.render(<App greeting={props} />, {
    title,
    clientProps: props,
  });
});

export default web;
