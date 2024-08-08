// import { createHonoMiddleware } from "@fiberplane/hono";
import { Hono } from "hono";

import { api } from "./api";
import { dbMiddleware } from "./middleware";
import type { HonoEnv } from "./types";
import { web } from "./web";

const app = new Hono<HonoEnv>();

// app.use(createHonoMiddleware(app));
app.use(dbMiddleware);

app.route("/", web);
app.route("/api", api);

export default app;
