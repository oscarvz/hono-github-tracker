import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      esbuild: {
        jsxImportSource: "hono/jsx/dom",
      },
      build: {
        rollupOptions: {
          input: "./src/client/index.tsx",
          output: {
            entryFileNames: "static/client.js",
          },
        },
        emptyOutDir: false,
        copyPublicDir: false,
      },
    };
  }

  return {
    server: {
      port: 8787,
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "_worker.js",
        },
      },
    },
    plugins: [
      devServer({
        adapter: cloudflareAdapter,
        entry: "./src/index.tsx",
      }),
      pages(),
    ],
  };
});
