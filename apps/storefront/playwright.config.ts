import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:8100",
    browserName: "chromium",
    launchOptions: { executablePath: "/usr/bin/google-chrome" },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-1440",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-390",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
    },
  ],
})
