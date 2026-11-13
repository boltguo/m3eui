import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "m3eui/tokens",
        replacement: resolve(__dirname, "packages/m3eui/src/tokens/index.ts"),
      },
      {
        find: "m3eui/i18n",
        replacement: resolve(__dirname, "packages/m3eui/src/i18n/index.ts"),
      },
      {
        find: "m3eui/config",
        replacement: resolve(__dirname, "packages/m3eui/src/config.ts"),
      },
      {
        find: "m3eui/primitives",
        replacement: resolve(__dirname, "packages/m3eui/src/primitives.ts"),
      },
      {
        find: "m3eui/cli",
        replacement: resolve(__dirname, "packages/m3eui/src/cli/index.ts"),
      },
      {
        find: "m3eui",
        replacement: resolve(__dirname, "packages/m3eui/src/index.ts"),
      },
    ],
  },
  test: {
    include: ["packages/**/*.test.ts", "packages/**/*.test.tsx"],
  },
});
