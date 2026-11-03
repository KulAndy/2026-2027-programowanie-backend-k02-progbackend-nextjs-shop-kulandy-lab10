import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "test/empty-module.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    fileParallelism: false,
    setupFiles: ["test/setup.ts"],
  },
});
