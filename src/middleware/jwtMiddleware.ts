import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";

import type { HonoEnv } from "../types";

export const jwtMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const jwtMiddleWare = jwt({
    secret: c.env.JWT_SECRET,
    cookie: "token",
  });

  return jwtMiddleWare(c, next);
});
