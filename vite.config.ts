import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";
import react from "@vitejs/plugin-react";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      build: {
        rollupOptions: {
          input: "./src/client/index.tsx",
          output: {
            entryFileNames: "static/client.js",
          },
        },
        copyPublicDir: false,
        cssMinify: "lightningcss",
        manifest: true,
      },
      css: {
        transformer: "lightningcss",
        lightningcss: {
          targets: browserslistToTargets([">= 0.25%"]),
        },
      },
      plugins: [react()],
    };
  }

  return {
    ssr: {
      external: ["react", "react-dom"],
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
        entry: "./src/index.ts",
      }),
      pages({
        entry: "./src/web/index.tsx",
      }),
    ],
  };
});
