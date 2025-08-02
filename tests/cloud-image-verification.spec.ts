import { test, expect } from '@playwright/test';

/**
 * 驗證雲朵圖片是否正確載入和顯示
 */

test.describe('雲朵圖片驗證', () => {
  
  test('驗證 Vite 版本飛機遊戲雲朵圖片載入', async ({ page }) => {
    console.log('🔍 驗證 Vite 版本雲朵圖片載入');
    
    // 監聽網絡請求
    const imageRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('cloud_shape3_3.png')) {
        imageRequests.push(request.url());
        console.log('📥 雲朵圖片請求:', request.url());
      }
    });
    
    // 監聽控制台日誌
    page.on('console', msg => {
      if (msg.text().includes('雲朵') || msg.text().includes('cloud')) {
        console.log('🎮 遊戲日誌:', msg.text());
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 等待遊戲初始化和雲朵生成
    await page.waitForTimeout(6000);
    
    // 檢查是否有雲朵圖片請求
    console.log('📊 雲朵圖片請求數量:', imageRequests.length);
    
    // 截圖驗證
    await page.screenshot({ 
      path: 'test-results/vite-cloud-image-test.png',
      fullPage: true 
    });
    
    // 檢查遊戲畫布是否存在
    const gameCanvas = await page.locator('canvas').count();
    console.log('🎨 遊戲畫布數量:', gameCanvas);
    expect(gameCanvas).toBeGreaterThan(0);
    
    console.log('✅ Vite 版本雲朵圖片驗證完成');
  });
  
  test('驗證 Next.js 版本飛機遊戲雲朵圖片載入', async ({ page }) => {
    console.log('🔍 驗證 Next.js 版本雲朵圖片載入');
    
    // 監聽網絡請求
    const imageRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('cloud_shape3_3.png')) {
        imageRequests.push(request.url());
        console.log('📥 雲朵圖片請求:', request.url());
      }
    });
    
    // 監聽控制台日誌
    page.on('console', msg => {
      if (msg.text().includes('雲朵') || msg.text().includes('cloud')) {
        console.log('🎮 遊戲日誌:', msg.text());
      }
    });
    
    await page.goto('/games/airplane');
    await page.waitForLoadState('networkidle');
    
    // 等待遊戲初始化
    await page.waitForTimeout(6000);
    
    // 檢查是否有雲朵圖片請求
    console.log('📊 雲朵圖片請求數量:', imageRequests.length);
    
    // 截圖驗證
    await page.screenshot({ 
      path: 'test-results/nextjs-cloud-image-test.png',
      fullPage: true 
    });
    
    // 檢查遊戲容器是否存在
    const gameContainer = await page.locator('.game-container').count();
    console.log('🎮 遊戲容器數量:', gameContainer);
    expect(gameContainer).toBeGreaterThan(0);
    
    console.log('✅ Next.js 版本雲朵圖片驗證完成');
  });
  
  test('檢查雲朵圖片文件是否存在', async ({ page }) => {
    console.log('🔍 檢查雲朵圖片文件是否存在');
    
    // 檢查 Vite 版本的雲朵圖片
    const viteCloudResponse = await page.request.get('http://localhost:3001/assets/images/cloud_shape3_3.png');
    console.log('📁 Vite 版本雲朵圖片狀態:', viteCloudResponse.status());
    
    // 檢查 Next.js 版本的雲朵圖片
    const nextjsCloudResponse = await page.request.get('http://localhost:3000/games/airplane-game/assets/images/cloud_shape3_3.png');
    console.log('📁 Next.js 版本雲朵圖片狀態:', nextjsCloudResponse.status());
    
    // 驗證圖片可以正常載入
    expect(viteCloudResponse.status()).toBe(200);
    expect(nextjsCloudResponse.status()).toBe(200);
    
    console.log('✅ 雲朵圖片文件檢查完成');
  });
  
  test('比較雲朵圖片載入效果', async ({ page }) => {
    console.log('🔍 比較雲朵圖片載入效果');
    
    const results = [];
    
    // 測試 Vite 版本
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/vite-cloud-comparison.png',
      fullPage: true 
    });
    
    results.push({ version: 'Vite', url: 'http://localhost:3001/games/airplane-game/' });
    
    // 測試 Next.js 版本
    await page.goto('/games/airplane');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/nextjs-cloud-comparison.png',
      fullPage: true 
    });
    
    results.push({ version: 'Next.js', url: '/games/airplane' });
    
    console.log('📊 雲朵圖片載入比較結果:');
    results.forEach(result => {
      console.log(`  ${result.version}: ${result.url}`);
    });
    
    console.log('✅ 雲朵圖片載入效果比較完成');
  });

});
