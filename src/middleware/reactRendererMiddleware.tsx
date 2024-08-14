import { reactRenderer } from "@hono/react-renderer";
import type { Manifest } from "vite";

export const reactRendererMiddleware = reactRenderer(
  ({ children, title }) => {
    const documentTitle = `Github Tracker${title ? ` | ${title}` : ""}`;

    // Borrowed from Honox's link component
    // https://github.com/honojs/honox/blob/main/src/server/components/link.tsx
    const cssModulesStyles = (() => {
      if (import.meta.env.PROD) {
        const manifestRoot = import.meta.glob<{ default: Manifest }>(
          "/dist/.vite/manifest.json",
          {
            eager: true,
          },
        );

        const manifest = Object.values(manifestRoot).find((v) => v.default);
        if (!manifest) {
          return null;
        }

        const cssModules = Object.values(manifest.default).find(
          ({ css }) => css,
        );
        if (!cssModules || !cssModules.css) {
          return null;
        }

        return cssModules.css.map((css) => (
          <link key={css} rel="stylesheet" href={css} />
        ));
      }
    })();

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>{documentTitle}</title>

          {import.meta.env.PROD ? (
            <>
              <script type="module" src="/static/client.js" />
              {cssModulesStyles}
            </>
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
