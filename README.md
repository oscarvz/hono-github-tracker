# Hono Github Tracker

Measure interactions on your Github repositories! Reach out to your fans!

## Getting started

This app is using the [HONC](https://honc.dev) stack - this includes
[Neon](https://neon.tech), for which you will need to create an account for.

As we're interacting with both Github Webhooks and the Github API, you will
need to create/add an API token and [set a webhook secret](https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks#creating-a-repository-webhook) on the repo you'd like
to monitor.

> [!note]
> Make sure you configure the webhook to listen to the changes you're
> interested in, and update the array of the event listener in
> `src/api/index.ts`.

To get started locally, you will need to create a `.dev.vars` file in the root
of the project, with the following three variables:

```shell
# .dev.vars
DATABASE_URL=postgresql://neondb_owner:...
GITHUB_API_TOKEN=github_...
GITHUB_WEBHOOK_SECRET=...
```

> [!tip]
> If using `bun` feels too edgy, just use your favourite package manager.

```shell
bun install
bun dev
```

Your app will start on `localhost:8787`.

### Receiving Webhooks

To receive webhooks, you will need to expose your local server to the internet.
You could use Ngrok, VS Code Ports or any other tool you're comfortable with.

Hono Github Tracker is using FPX for local development, which has a neat feature
to [proxy Webhook requests](https://fiberplane.com/docs/features/webhooks/) to
your local development server.

To make use of FPX proxying, run FPX in a separate terminal:

```shell
bun studio
```

> [!important]
> When using any proxy tool, make sure to append the URL with `/api/ghwh`

## Dashboard

The app exposes a dashboard on `localhost:8787/` with basic information about
the repositories you're tracking.

## TODO

This app is under active (though not always fast) development. If you're running
into issues, have questions or suggestions, feel free to open an issue.

- [ ] [Authenticated dashboard](https://github.com/oscarvz/hono-github-tracker/issues/14):
      we shouldn't expose the dashboard to the public.
