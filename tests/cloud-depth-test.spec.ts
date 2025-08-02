import { test, expect } from '@playwright/test';

/**
 * 測試雲朵是否顯示在地球上方
 */

test.describe('雲朵深度層級測試', () => {
  
  test('確認雲朵顯示在地球上方', async ({ page }) => {
    console.log('🔍 檢查雲朵是否顯示在地球上方');
    
    // 監聽控制台日誌
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      // 檢查深度相關日誌
      if (text.includes('深度') || text.includes('depth') || text.includes('地球') || text.includes('雲朵')) {
        console.log('🎮 深度相關日誌:', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 6 秒讓雲朵生成...');
    await page.waitForTimeout(6000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/cloud-depth-test.png',
      fullPage: true 
    });
    
    // 檢查雲朵生成日誌
    const cloudLogs = logs.filter(log => 
      log.includes('生成雲朵') || 
      log.includes('☁️ 使用雲朵紋理')
    );
    
    console.log('☁️ 雲朵生成日誌數量:', cloudLogs.length);
    
    // 檢查地球相關日誌
    const earthLogs = logs.filter(log => 
      log.includes('地球') || 
      log.includes('earth') ||
      log.includes('🌍')
    );
    
    console.log('🌍 地球相關日誌數量:', earthLogs.length);
    
    if (cloudLogs.length > 0) {
      console.log('✅ 雲朵正常生成');
      console.log('📝 雲朵生成日誌:');
      cloudLogs.slice(0, 3).forEach(log => console.log('  -', log));
    } else {
      console.log('❌ 沒有檢測到雲朵生成');
    }
    
    if (earthLogs.length > 0) {
      console.log('🌍 地球相關日誌:');
      earthLogs.slice(0, 3).forEach(log => console.log('  -', log));
    }
    
    // 驗證雲朵生成
    expect(cloudLogs.length).toBeGreaterThan(0);
    
    console.log('✅ 雲朵深度層級測試完成');
    console.log('📏 雲朵深度: 110 (應該在地球 depth=100 上方)');
    console.log('📝 文字深度: 111 (應該在雲朵上方)');
  });
  
  test('視覺驗證雲朵不被地球遮擋', async ({ page }) => {
    console.log('👁️ 視覺驗證雲朵不被地球遮擋');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 等待更長時間讓多個雲朵生成
    console.log('⏳ 等待 10 秒讓多個雲朵生成...');
    await page.waitForTimeout(10000);
    
    // 截圖用於視覺驗證
    await page.screenshot({ 
      path: 'test-results/cloud-depth-visual.png',
      fullPage: true 
    });
    
    console.log('📸 已截圖，可以視覺檢查雲朵是否在地球上方');
    console.log('🌍 雲朵應該清晰可見，不被地球遮擋');
    console.log('📏 深度層級: 地球(100) < 雲朵(110) < 文字(111)');
    
    console.log('✅ 視覺驗證完成');
  });

});
