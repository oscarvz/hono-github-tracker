# Hono Github Tracker

Measure interactions on your Github repositories!

## Getting started

This app is using the [HONC](https://honc.dev) stack - this includes
[Neon](https://neon.tech), for which you will need to create an account for.

As we're interacting with both Github Webhooks and the Github API, you will
need to create/add an API token and [set a webhook secret](https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks#creating-a-repository-webhook) on the repo you'd like
to monitor.

> [!note]
> Make sure you configure the webhook to listen to the changes you're
interested in, and update the array of the event listener in `src/api/index.ts`.

To get started locally, you will need to create a `.dev.vars` file in the root
of the project, with the following three variables:

```shell
# .dev.vars
DATABASE_URL=postgresql://neondb_owner:...
GITHUB_API_TOKEN=github_...
GITHUB_WEBHOOK_SECRET=...
```

```shell
bun install
bun dev
```
