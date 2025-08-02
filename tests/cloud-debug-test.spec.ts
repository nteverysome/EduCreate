import { test, expect } from '@playwright/test';

/**
 * 調試雲朵移動問題
 */

test.describe('雲朵調試測試', () => {
  
  test('詳細調試雲朵移動狀態', async ({ page }) => {
    console.log('🔍 詳細調試雲朵移動');
    
    // 監聽所有控制台日誌
    const allLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      allLogs.push(text);
      
      // 輸出雲朵相關的所有日誌
      if (text.includes('雲朵') || text.includes('cloud') || text.includes('☁️') || 
          text.includes('🔧') || text.includes('🔄') || text.includes('🗑️') ||
          text.includes('velocity') || text.includes('position')) {
        console.log('🎮', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 20 秒觀察雲朵移動...');
    await page.waitForTimeout(20000);
    
    // 截圖最終狀態
    await page.screenshot({ 
      path: 'test-results/cloud-debug-final.png',
      fullPage: true 
    });
    
    // 分析日誌
    const cloudUpdateLogs = allLogs.filter(log => log.includes('雲朵更新檢查'));
    const cloudPositionLogs = allLogs.filter(log => log.includes('velocity='));
    const cloudCleanupLogs = allLogs.filter(log => log.includes('清理離開螢幕'));
    
    console.log('📊 調試統計:');
    console.log(`  - 更新檢查: ${cloudUpdateLogs.length} 次`);
    console.log(`  - 位置日誌: ${cloudPositionLogs.length} 次`);
    console.log(`  - 清理事件: ${cloudCleanupLogs.length} 次`);
    
    // 輸出最後幾個位置日誌
    console.log('📍 最後的雲朵位置:');
    cloudPositionLogs.slice(-5).forEach(log => console.log('  -', log));
    
    console.log('✅ 雲朵調試測試完成');
  });

});
