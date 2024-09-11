import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { z } from "zod";

import type { HonoEnv } from "../types";

export const loginApi = new Hono<HonoEnv>().post(
  "/",
  zValidator(
    "json",
    z.object({
      userName: z.string(),
      password: z.string().min(8),
    }),
  ),
  async (c) => {
    const { password, userName } = c.req.valid("json");

    if (!(userName === "admin" && password === "password")) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const token = await sign({ userName }, c.env.JWT_SECRET);

    setCookie(c, "token", token, {
      maxAge: 60 * 60,
    });

    return c.text("Logged in");
  },
);
