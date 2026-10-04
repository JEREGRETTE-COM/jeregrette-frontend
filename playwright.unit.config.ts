import { defineConfig } from "@playwright/test";

/**
 * Pure functions only: no browser, no `next dev`, no backend. Playwright is
 * reused as the runner because it is already installed and reads the "@/"
 * paths from tsconfig.
 */
export default defineConfig({
  testDir: "./unit",
  reporter: "list",
});
