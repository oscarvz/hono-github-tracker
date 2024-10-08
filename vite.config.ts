import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";
import react from "@vitejs/plugin-react";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";

const entry = "./src/index.ts";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      build: {
        rollupOptions: {
          input: "./src/client/index.tsx",
          output: {
            entryFileNames: "assets/[name]-[hash].js",
          },
        },
        copyPublicDir: false,
        cssMinify: "lightningcss",
        emptyOutDir: true,
        manifest: true,
      },
      css: {
        transformer: "lightningcss",
        devSourcemap: true,
        lightningcss: {
          targets: browserslistToTargets([">= 0.25%"]),
        },
      },
      plugins: [react()],
    };
  }

  return {
    server: {
      port: 8787,
    },
    ssr: {
      external: ["@mantine/core", "@mantine/hooks", "react-dom", "react"],
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
        entry,
      }),
      pages({ entry }),
    ],
  };
});
