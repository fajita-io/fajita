import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit-test config. Tests target pure logic (normalization, tokens, signing,
 * masking, callback mapping, label mapping) without a database or network.
 *
 * `server-only` is a Next.js RSC guard that throws when imported outside a
 * server component. Our library modules import it defensively; in unit tests we
 * alias it to an empty module so the pure functions inside can be exercised.
 */
export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./test/stubs/server-only.ts", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    globals: false,
  },
});
