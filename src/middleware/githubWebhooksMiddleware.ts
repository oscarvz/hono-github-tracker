import { Webhooks } from "@octokit/webhooks";
import { createMiddleware } from "hono/factory";

import { type HonoEnv, isWebhookEventName } from "../types";

let webhooks: Webhooks | undefined;

function getWebhooksInstance(secret: string) {
  if (!webhooks) {
    webhooks = new Webhooks({ secret });
  }

  return webhooks;
}

/**
 * Middleware to verify and handle Github Webhook requests. It exposes the
 * `webhooks` object on the context.
 */
export const githubWebhooksMiddleware = createMiddleware<HonoEnv, "/ghws">(
  async (c, next) => {
    const secret = c.env.GITHUB_WEBHOOK_SECRET;
    const webhooks = getWebhooksInstance(secret);

    c.set("webhooks", webhooks);

    await next();

    const id = c.req.header("x-github-delivery");
    const signature = c.req.header("x-hub-signature-256");
    const name = c.req.header("x-github-event");

    const isEventName = isWebhookEventName(name);
    if (!(id && isEventName && signature)) {
      return c.text("Invalid request", 403);
    }

    const payload = await c.req.text();

    try {
      await webhooks.verifyAndReceive({
        id,
        name,
        signature,
        payload,
      });
      return c.text("Webhook received & verified", 201);
    } catch (error) {
      return c.text(`Failed to verify Github Webhook request: ${error}`, 400);
    }
  },
);
