import { instrument } from "@fiberplane/hono-otel";
import { Hono } from "hono";

import api from "./api";
import { dbMiddleware } from "./middleware";
import type { HonoEnv } from "./types";
import web from "./web";

const app = new Hono<HonoEnv>();

app.use(dbMiddleware);

app.route("/", web);
app.route("/api", api);

export default instrument(app);
