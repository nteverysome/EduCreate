import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Playwright 全局設置
 * 在所有測試運行前執行
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 開始 Playwright 測試設置...');

  // 創建測試結果目錄
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
    console.log('📁 創建測試結果目錄:', testResultsDir);
  }

  // 創建截圖目錄
  const screenshotsDir = path.join(testResultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📸 創建截圖目錄:', screenshotsDir);
  }

  // 檢查環境變量
  console.log('🔧 檢查環境配置...');
  const requiredEnvVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn('⚠️  缺少環境變量:', missingVars.join(', '));
    console.log('ℹ️  這些環境變量對基本功能測試不是必需的');
  } else {
    console.log('✅ 環境變量配置完整');
  }

  // 等待服務器啟動
  console.log('⏳ 等待開發服務器啟動...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!serverReady && attempts < maxAttempts) {
    try {
      const response = await page.goto('http://localhost:3003', {
        waitUntil: 'networkidle',
        timeout: 5000
      });
      
      if (response && response.status() === 200) {
        serverReady = true;
        console.log('✅ 開發服務器已就緒');
      }
    } catch (error) {
      attempts++;
      console.log(`⏳ 等待服務器啟動... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!serverReady) {
    console.error('❌ 開發服務器啟動失敗');
    throw new Error('開發服務器在指定時間內未能啟動');
  }

  // 檢查關鍵頁面（跳過 API 端點檢查）
  console.log('🔍 檢查關鍵頁面...');
  const keyPages = [
    '/',
    '/dashboard',
    '/universal-game'
  ];

  for (const pagePath of keyPages) {
    try {
      const response = await page.goto(`http://localhost:3003${pagePath}`, { timeout: 10000 });
      if (response && response.status() === 200) {
        console.log(`✅ ${pagePath} - OK`);
      } else {
        console.warn(`⚠️  ${pagePath} - 狀態碼: ${response?.status()}`);
      }
    } catch (error) {
      console.warn(`⚠️  ${pagePath} - 可能需要更多時間載入`);
    }
  }

  await browser.close();

  // 記錄測試開始時間
  const testStartTime = new Date().toISOString();
  fs.writeFileSync(
    path.join(testResultsDir, 'test-start-time.txt'),
    testStartTime
  );

  console.log('🎯 測試設置完成，開始運行測試...');
  console.log('📅 測試開始時間:', testStartTime);
}

export default globalSetup;
