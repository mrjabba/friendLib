import { defineConfig, devices } from '@playwright/test'

// For local development, we assume the dev server is already running on port 3000
// For CI, we need to start it because it's a fresh environment

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only configure webServer for CI runs - locally the server should already be running
  webServer: process.env.CI
    ? {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 300 * 1000,
      }
    : undefined,
})
