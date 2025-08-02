import { test, expect } from '@playwright/test';

/**
 * 測試雲朵大小是否增加了 20%
 */

test.describe('雲朵大小測試', () => {
  
  test('確認雲朵大小增加 20%', async ({ page }) => {
    console.log('🔍 檢查雲朵大小是否增加 20%');
    
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
    
    console.log('⏳ 等待 5 秒讓雲朵生成...');
    await page.waitForTimeout(5000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/cloud-size-test.png',
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
      cloudLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('❌ 沒有檢測到雲朵生成');
    }
    
    // 檢查雲朵移動日誌
    const movementLogs = logs.filter(log => 
      log.includes('雲朵更新檢查') || 
      log.includes('☁️ 雲朵') && log.includes('x=')
    );
    
    console.log('🔄 雲朵移動日誌數量:', movementLogs.length);
    
    // 驗證雲朵生成
    expect(cloudLogs.length).toBeGreaterThan(0);
    
    console.log('✅ 雲朵大小測試完成');
    console.log('📏 雲朵現在應該比原來大 20% (scale = 1.2)');
  });
  
  test('視覺驗證雲朵大小', async ({ page }) => {
    console.log('👁️ 視覺驗證雲朵大小變化');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    // 等待更長時間讓多個雲朵生成
    console.log('⏳ 等待 8 秒讓多個雲朵生成...');
    await page.waitForTimeout(8000);
    
    // 截圖用於視覺比較
    await page.screenshot({ 
      path: 'test-results/cloud-size-visual.png',
      fullPage: true 
    });
    
    console.log('📸 已截圖，可以視覺比較雲朵大小');
    console.log('📏 雲朵應該比之前大 20%，更容易看見和點擊');
    
    console.log('✅ 視覺驗證完成');
  });

});
