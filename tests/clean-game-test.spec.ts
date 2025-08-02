import { test, expect } from '@playwright/test';

/**
 * 測試遊戲是否乾淨，沒有紅色測試元素
 */

test.describe('乾淨遊戲測試', () => {
  
  test('確認沒有紅色測試元素', async ({ page }) => {
    console.log('🔍 檢查遊戲是否乾淨，沒有紅色測試元素');
    
    // 監聽控制台日誌
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      
      // 檢查是否有紅色測試相關的日誌
      if (text.includes('紅色') || text.includes('測試雲朵') || text.includes('🔴') || text.includes('🧪')) {
        console.log('🎮 測試相關日誌:', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 8 秒觀察遊戲...');
    await page.waitForTimeout(8000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/clean-game-test.png',
      fullPage: true 
    });
    
    // 檢查是否有紅色測試相關的日誌
    const redTestLogs = logs.filter(log => 
      log.includes('🔴 創建簡單紅色方塊測試') ||
      log.includes('🧪 強制生成測試雲朵') ||
      log.includes('紅色方塊') ||
      log.includes('測試雲朵')
    );
    
    console.log('🔴 紅色測試日誌數量:', redTestLogs.length);
    
    if (redTestLogs.length > 0) {
      console.log('❌ 發現紅色測試元素:');
      redTestLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('✅ 沒有發現紅色測試元素，遊戲乾淨');
    }
    
    // 檢查雲朵生成日誌
    const cloudLogs = logs.filter(log => 
      log.includes('生成雲朵') || 
      log.includes('☁️')
    );
    
    console.log('☁️ 雲朵相關日誌數量:', cloudLogs.length);
    console.log('📝 雲朵日誌範例:');
    cloudLogs.slice(0, 5).forEach(log => console.log('  -', log));
    
    // 驗證沒有紅色測試元素
    expect(redTestLogs.length).toBe(0);
    
    // 驗證仍有正常的雲朵生成
    expect(cloudLogs.length).toBeGreaterThan(0);
    
    console.log('✅ 乾淨遊戲測試完成');
  });

});
