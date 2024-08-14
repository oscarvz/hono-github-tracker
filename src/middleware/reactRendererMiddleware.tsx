import { reactRenderer } from "@hono/react-renderer";
import type { Manifest } from "vite";

export const reactRendererMiddleware = reactRenderer(
  ({ children, title }) => {
    const documentTitle = `Github Tracker${title ? ` | ${title}` : ""}`;

    // Borrowed from Honox's link component
    // https://github.com/honojs/honox/blob/main/src/server/components/link.tsx
    const assetImportTags = (() => {
      if (import.meta.env.PROD) {
        const manifestRoot = import.meta.glob<{ default: Manifest }>(
          "/dist/.vite/manifest.json",
          {
            eager: true,
          },
        );

        const manifest = Object.values(manifestRoot).at(0)?.default;
        if (!manifest) {
          return null;
        }

        return Object.values(manifest).reduce<Array<React.ReactNode>>(
          (importTags, manifestChunk) => {
            if (manifestChunk.css) {
              const cssTags = manifestChunk.css.map((css) => (
                <link key={css} rel="stylesheet" href={css} />
              ));
              importTags.push(cssTags);
            }

            if (manifestChunk.isEntry) {
              const scriptTag = (
                <script type="module" src={manifestChunk.file} />
              );
              importTags.push(scriptTag);
            }

            return importTags;
          },
          [],
        );
      }
    })();

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>{documentTitle}</title>

          {import.meta.env.PROD ? (
            assetImportTags
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
