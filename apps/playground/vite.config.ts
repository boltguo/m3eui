import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "m3eui/styles.css",
        replacement: resolve(__dirname, "../../packages/m3eui/src/styles/m3e.css"),
      },
      {
        find: "m3eui/tokens",
        replacement: resolve(__dirname, "../../packages/m3eui/src/tokens/index.ts"),
      },
      {
        find: "m3eui/i18n",
        replacement: resolve(__dirname, "../../packages/m3eui/src/i18n/index.ts"),
      },
      {
        find: "m3eui/config",
        replacement: resolve(__dirname, "../../packages/m3eui/src/config.ts"),
      },
      {
        find: "m3eui/primitives",
        replacement: resolve(__dirname, "../../packages/m3eui/src/primitives.ts"),
      },
      {
        find: "m3eui",
        replacement: resolve(__dirname, "../../packages/m3eui/src/index.ts"),
      },
    ],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/packages/m3eui/src/tokens/")) {
            return "m3eui-tokens";
          }
          if (id.includes("/packages/m3eui/")) {
            return "m3eui";
          }
          if (id.includes("node_modules/shiki") || id.includes("node_modules/@shikijs/")) {
            return "vendor-shiki";
          }
          if (id.includes("node_modules/@base-ui/")) {
            return "vendor-base-ui";
          }
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/scheduler") ||
            id.includes("node_modules/cookie") ||
            id.includes("node_modules/set-cookie-parser")
          ) {
            return "vendor-react";
          }
          return undefined;
        },
      },
    },
  },
});
