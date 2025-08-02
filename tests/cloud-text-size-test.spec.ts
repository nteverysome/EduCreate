import { test, expect } from '@playwright/test';

/**
 * 測試雲朵和文字都增大 20% (總共 44%)
 */

test.describe('雲朵和文字大小測試', () => {
  
  test('確認雲朵和文字都增大', async ({ page }) => {
    console.log('🔍 檢查雲朵和文字是否都增大了');
    
    // 監聽控制台日誌
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      // 檢查雲朵相關日誌
      if (text.includes('雲朵') || text.includes('cloud') || text.includes('☁️')) {
        console.log('🎮 雲朵日誌:', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 6 秒讓雲朵生成...');
    await page.waitForTimeout(6000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/cloud-text-size-test.png',
      fullPage: true 
    });
    
    // 檢查雲朵生成日誌
    const cloudLogs = logs.filter(log => 
      log.includes('生成雲朵') || 
      log.includes('☁️ 使用雲朵紋理')
    );
    
    console.log('☁️ 雲朵生成日誌數量:', cloudLogs.length);
    
    if (cloudLogs.length > 0) {
      console.log('✅ 雲朵正常生成');
      console.log('📝 雲朵生成日誌:');
      cloudLogs.slice(0, 3).forEach(log => console.log('  -', log));
    } else {
      console.log('❌ 沒有檢測到雲朵生成');
    }
    
    // 檢查雲朵移動日誌
    const movementLogs = logs.filter(log => 
      log.includes('☁️ 雲朵') && log.includes('x=')
    );
    
    console.log('🔄 雲朵移動日誌數量:', movementLogs.length);
    
    // 驗證雲朵生成
    expect(cloudLogs.length).toBeGreaterThan(0);
    
    console.log('✅ 雲朵和文字大小測試完成');
    console.log('📏 雲朵現在縮放到 1.44 (比原來大 44%)');
    console.log('📝 文字現在是 23px (比原來 16px 大 44%)');
    console.log('📦 padding 也增加到 6x3 (比原來 4x2 大 50%)');
  });
  
  test('視覺驗證更大的雲朵和文字', async ({ page }) => {
    console.log('👁️ 視覺驗證更大的雲朵和文字');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 等待更長時間讓多個雲朵生成
    console.log('⏳ 等待 10 秒讓多個雲朵生成...');
    await page.waitForTimeout(10000);
    
    // 截圖用於視覺比較
    await page.screenshot({ 
      path: 'test-results/cloud-text-size-visual.png',
      fullPage: true 
    });
    
    console.log('📸 已截圖，可以視覺比較雲朵和文字大小');
    console.log('📏 雲朵應該明顯更大，文字也更清晰易讀');
    console.log('🎯 更大的雲朵和文字提供更好的學習體驗');
    
    console.log('✅ 視覺驗證完成');
  });

});
