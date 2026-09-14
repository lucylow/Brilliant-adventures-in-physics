import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "@shared", replacement: path.join(root, "shared") },
      { find: /^@\//, replacement: `${root}/` },
      { find: /^react-native$/, replacement: path.join(root, "tests/mocks/react-native.ts") },
    ],
  },
  test: {
    environment: "node",
  },
});
