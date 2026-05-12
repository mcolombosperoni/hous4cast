import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  css: { postcss: {} },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
