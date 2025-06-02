import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

// Załaduj zmienne środowiskowe z .env.local
config({ path: ".env.local" });

export default defineConfig({
  testDir: "./e2e",
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture screenshot after each test failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    // Regular tests that require a web server
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /(example|auth|protected)\.spec\.ts/,
    },
    // Standalone tests that don't require a web server
    {
      name: "chromium-standalone",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /standalone\.spec\.ts/,
    },
    {
      name: "firefox-standalone",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /standalone\.spec\.ts/,
    },
    {
      name: "webkit-standalone",
      use: { ...devices["Desktop Safari"] },
      testMatch: /standalone\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.STANDALONE_TESTS
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
});
