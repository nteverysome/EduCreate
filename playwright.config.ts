import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置文件
 * 用於 EduCreate Google 認證測試
 */
export default defineConfig({
  testDir: './tests',
  
  /* 並行運行測試 */
  fullyParallel: true,
  
  /* 在 CI 環境中失敗時不重試，本地環境重試一次 */
  retries: process.env.CI ? 2 : 1,
  
  /* 並行工作進程數量 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 測試報告配置 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  /* 全局測試配置 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:3000',
    
    /* 收集失敗測試的追蹤信息 */
    trace: 'on-first-retry',
    
    /* 截圖配置 */
    screenshot: 'on',

    /* 視頻錄製 */
    video: 'on',
    
    /* 瀏覽器上下文配置 */
    viewport: { width: 1280, height: 720 },
    
    /* 忽略 HTTPS 錯誤 */
    ignoreHTTPSErrors: true,
    
    /* 用戶代理 */
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    /* 額外的 HTTP 頭 */
    extraHTTPHeaders: {
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
    },
    
    /* 超時設置 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 測試項目配置 */
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

    /* 移動端測試 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* 平板測試 */
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* 本地開發服務器配置 - 暫時禁用 */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3002',
  //   reuseExistingServer: true,
  //   timeout: 60000,
  // },

  /* 輸出目錄 */
  outputDir: 'test-results/',
  
  /* 測試超時 */
  timeout: 30000,
  
  /* 期望超時 */
  expect: {
    timeout: 5000,
  },
  
  /* 全局設置和清理 */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});
