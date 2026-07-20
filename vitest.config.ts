import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Unit-test config. Pure logic tests run in node. React component tests under
 * tests/*.test.tsx opt into jsdom with a file-level vitest environment pragma.
 *
 * server-only is aliased to an empty stub so library modules that import the
 * Next.js RSC guard can still be unit-tested.
 */
export default defineConfig({
  plugins: [react()],
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
    include: [
      "src/**/*.test.ts",
      "test/**/*.test.ts",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
    ],
    globals: false,
  },
});
