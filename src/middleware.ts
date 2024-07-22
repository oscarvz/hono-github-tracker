import { Webhooks } from "@octokit/webhooks";
import { createMiddleware } from "hono/factory";

import type { HonoEnv } from "./types";

/**
 * Middleware to verify and handle Github Webhook requests. It exposes the
 * `webhooks` object on the context.
 */
export const githubWebhooksMiddleware = createMiddleware<HonoEnv>(
  async (c, next) => {
    const secret = c.env.GITHUB_WEBHOOK_SECRET;
    const webhooks = new Webhooks({ secret });

    c.set("webhooks", webhooks);
    await next();

    /* biome-ignore lint/suspicious/noExplicitAny: type not exposed by
       octokit/webhooks */
    const name = c.req.header("x-github-event") as any;
    const signature = c.req.header("x-hub-signature-256");
    const id = c.req.header("x-request-id");
    if (!id || !name || !signature) {
      return c.text("Invalid headers", 400);
    }
    const payload = await c.req.text();

    try {
      await webhooks.verifyAndReceive({
        id,
        name,
        signature,
        payload,
      });
      return c.text("OK");
    } catch (error) {
      return c.text(`Failed to verify Github Webhook request: ${error}`, 400);
    }
  },
);
