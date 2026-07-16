// Playwright config intentionally uses JS so TypeScript compilation doesn't
// require Playwright packages at build time.

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const PORT = 3001;
const baseURL = `http://127.0.0.1:${PORT}`;

const config = {
  testDir: "tests/e2e",
  timeout: 120 * 1000,
  expect: { timeout: 15 * 1000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    // Production server on a separate port so it can run beside `next dev`.
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
};

module.exports = config;
