import { defineConfig, devices } from '@playwright/test';

/**
 * 獨立的 Playwright 配置 - 用於直接測試 Vite + Phaser 3 遊戲
 * 不依賴 Next.js 服務器和 global-setup
 */
export default defineConfig({
  testDir: './tests',
  
  /* 並行運行測試 */
  fullyParallel: true,
  
  /* 在 CI 上失敗時禁止重試 */
  forbidOnly: !!process.env.CI,
  
  /* 在 CI 上重試失敗的測試 */
  retries: process.env.CI ? 2 : 0,
  
  /* 選擇並行工作進程數量 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 報告器配置 */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  /* 全局測試配置 */
  use: {
    /* 基礎 URL - 指向 Vite + Phaser 3 遊戲 */
    baseURL: 'http://localhost:3001',
    
    /* 在失敗時收集追蹤 */
    trace: 'on-first-retry',
    
    /* 截圖配置 */
    screenshot: 'only-on-failure',
    
    /* 視頻錄製 */
    video: 'retain-on-failure',
    
    /* 瀏覽器上下文選項 */
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    /* 延長超時時間以適應遊戲載入 */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* 配置測試項目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],

  /* 輸出目錄 */
  outputDir: 'test-results/',
  
  /* 測試超時 */
  timeout: 60000,
  
  /* 期望超時 */
  expect: {
    timeout: 10000,
  },
});
