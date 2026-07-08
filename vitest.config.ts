import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    passWithNoTests: true,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  css: {
    // Root postcss.config.mjs uses Next.js's string-plugin shorthand
    // (`plugins: ["@tailwindcss/postcss"]`), which only Next's own
    // postcss-loader understands. Vite's own PostCSS loader would try
    // to auto-discover and load that same file and crash on the
    // string-form plugin list, so override with an empty inline config
    // to bypass file-based auto-detection during tests.
    postcss: {},
  },
});
