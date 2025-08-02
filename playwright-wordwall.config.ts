import { defineConfig, devices } from '@playwright/test';

/**
 * 專門用於檢測 Wordwall 的 Playwright 配置
 * 不依賴本地服務器
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'https://wordwall.net',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 不需要 webServer 配置，因為我們要檢測外部網站
});
