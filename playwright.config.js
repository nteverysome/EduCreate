/**
 * Playwright 配置文件 - 支持視頻錄製
 */

const { devices } = require('@playwright/test');

// 動態組裝多瀏覽器專案（默認僅 chromium；以環境變數逐步啟用）
const projects = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      video: { mode: 'on', size: { width: 1280, height: 720 } },
      trace: 'on'
    }
  },
  ...(process.env.PW_ENABLE_FIREFOX ? [{
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      video: { mode: 'on', size: { width: 1280, height: 720 } },
      trace: 'on'
    }
  }] : []),
  ...(process.env.PW_ENABLE_WEBKIT ? [{
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
      video: { mode: 'on', size: { width: 1280, height: 720 } },
      trace: 'on'
    }
  }] : [])
];

module.exports = {
  testDir: './tests/e2e',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [ ['html'], ['json', { outputFile: process.env.PW_OUTPUT_DIR ? `${process.env.PW_OUTPUT_DIR}/results.json` : 'test-results/results.json' }] ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'only-on-failure',
    headless: false,
  },
  projects,
  webServer: { command: 'npm run dev', port: 3000, reuseExistingServer: !process.env.CI },
};
