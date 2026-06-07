import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure game-logic tests run in Node. Component tests opt into jsdom
    // per-file with `// @vitest-environment jsdom`.
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.{ts,tsx}"],
  },
});
