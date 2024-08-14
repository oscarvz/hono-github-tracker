import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";
import react from "@vitejs/plugin-react";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      css: {
        transformer: "lightningcss",
        lightningcss: {
          targets: browserslistToTargets([">= 0.25%"]),
        },
      },
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
        cssMinify: "lightningcss",
        cssCodeSplit: false,
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
        entry: "./src/index.ts",
      }),
    ],
  };
});
