import { reactRenderer } from "@hono/react-renderer";
import { ColorSchemeScript } from "@mantine/core";
import type { Manifest } from "vite";

export const reactRendererMiddleware = reactRenderer(
  ({ children, clientComponent, title }) => {
    const documentTitle = `Github Tracker${title ? ` | ${title}` : ""}`;
    const propsData = JSON.stringify(clientComponent);

    // Import the manifest file to get the list of built assets by Vite. This
    // is only done in production mode & when `build.manifest` is enabled in
    // vite.config.ts
    // Idea borrowed from Honox's link component:
    // https://github.com/honojs/honox/blob/main/src/server/components/link.tsx
    const assetImportTags = (() => {
      if (!import.meta.env.PROD) {
        return <script type="module" src="/src/client/index.tsx" />;
      }

      const rootManifest = import.meta.glob<{ default: Manifest }>(
        "/dist/.vite/manifest.json",
        { eager: true },
      );

      const manifest = Object.values(rootManifest).at(0)?.default;
      if (!manifest) {
        return null;
      }

      const tags = manifestChunksToTags(manifest);
      return tags;
    })();

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <title>{documentTitle}</title>

          {assetImportTags}
          <ColorSchemeScript defaultColorScheme="auto" />
        </head>

        <body>
          <div id="root" data-props={propsData}>
            {children}
          </div>
        </body>
      </html>
    );
  },
  {
    docType: true,
  },
);

function manifestChunksToTags(manifest: Manifest) {
  return Object.values(manifest).reduce<Array<React.ReactNode>>(
    (importTags, manifestChunk) => {
      const { file, css } = manifestChunk;

      const scriptTag = <script key={file} type="module" src={file} />;
      importTags.push(scriptTag);

      if (css && css.length > 0) {
        const cssTags = css.map((cssPath) => (
          <link key={cssPath} rel="stylesheet" href={cssPath} />
        ));
        importTags.push(cssTags);
      }

      return importTags;
    },
    [],
  );
}
