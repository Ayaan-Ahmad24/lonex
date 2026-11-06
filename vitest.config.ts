import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
const serverOnlyMock = fileURLToPath(
  new URL("./tests/mocks/server-only.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      "@": src,
      // The real package throws outside the react-server condition.
      "server-only": serverOnlyMock,
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      // Keep integration-test uploads out of the real development media dir.
      MEDIA_STORAGE_PATH: ".data/test-media",
    },
  },
});
