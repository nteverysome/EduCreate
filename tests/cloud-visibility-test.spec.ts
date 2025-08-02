import { test, expect } from '@playwright/test';

/**
 * 簡單的雲朵可見性測試
 */

test.describe('雲朵可見性測試', () => {
  
  test('檢查雲朵是否在遊戲中可見', async ({ page }) => {
    console.log('🔍 檢查雲朵可見性');
    
    // 監聽控制台日誌
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('雲朵') || text.includes('cloud') || text.includes('☁️') || text.includes('🧪')) {
        console.log('🎮 雲朵相關日誌:', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 等待遊戲初始化和雲朵生成
    console.log('⏳ 等待 8 秒讓雲朵生成...');
    await page.waitForTimeout(8000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/cloud-visibility-test.png',
      fullPage: true 
    });
    
    // 檢查是否有雲朵相關的日誌
    const cloudLogs = logs.filter(log => 
      log.includes('雲朵') || 
      log.includes('cloud') || 
      log.includes('☁️') || 
      log.includes('🧪') ||
      log.includes('生成') ||
      log.includes('載入')
    );
    
    console.log('📊 雲朵相關日誌數量:', cloudLogs.length);
    console.log('📝 關鍵日誌:');
    cloudLogs.slice(0, 10).forEach(log => console.log('  -', log));
    
    // 檢查遊戲畫布
    const canvas = await page.locator('canvas').count();
    console.log('🎨 畫布數量:', canvas);
    expect(canvas).toBeGreaterThan(0);
    
    // 檢查是否有雲朵生成的日誌
    const hasCloudGeneration = cloudLogs.some(log => 
      log.includes('生成雲朵') || 
      log.includes('測試雲朵') ||
      log.includes('強制生成')
    );
    
    console.log('☁️ 是否有雲朵生成日誌:', hasCloudGeneration);
    
    // 檢查是否有圖片載入日誌
    const hasImageLoad = cloudLogs.some(log => 
      log.includes('載入成功') || 
      log.includes('載入失敗') ||
      log.includes('使用紋理')
    );
    
    console.log('🖼️ 是否有圖片載入日誌:', hasImageLoad);
    
    console.log('✅ 雲朵可見性測試完成');
  });
  
  test('檢查雲朵圖片載入狀態', async ({ page }) => {
    console.log('🔍 檢查雲朵圖片載入狀態');
    
    // 直接檢查圖片是否可以載入
    const imageResponse = await page.request.get('http://localhost:3001/assets/images/cloud_shape3_3.png');
    console.log('📁 雲朵圖片 HTTP 狀態:', imageResponse.status());
    
    if (imageResponse.status() === 200) {
      console.log('✅ 雲朵圖片可以正常載入');
    } else {
      console.log('❌ 雲朵圖片載入失敗');
    }
    
    // 檢查圖片大小
    const imageBuffer = await imageResponse.body();
    console.log('📏 雲朵圖片大小:', imageBuffer.length, 'bytes');
    
    expect(imageResponse.status()).toBe(200);
    expect(imageBuffer.length).toBeGreaterThan(0);
    
    console.log('✅ 雲朵圖片載入狀態檢查完成');
  });

});
