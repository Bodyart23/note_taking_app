/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('vitest').UserConfig} */
const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
  },
};
