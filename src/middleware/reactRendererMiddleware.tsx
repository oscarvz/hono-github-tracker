import { reactRenderer } from "@hono/react-renderer";

export const reactRendererMiddleware = reactRenderer(
  ({ children, title }) => {
    const documentTitle = `Github Tracker${title ? ` | ${title}` : ""}`;

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>{documentTitle}</title>

          {import.meta.env.PROD ? (
            <script type="module" src="/static/client.js" />
          ) : (
            <script type="module" src="/src/client/index.tsx" />
          )}
        </head>

        <body>{children}</body>
      </html>
    );
  },
  {
    docType: true,
  },
);
