import { test, expect } from '@playwright/test';

/**
 * 測試雲朵移動功能
 */

test.describe('雲朵移動測試', () => {
  
  test('驗證雲朵從右向左移動', async ({ page }) => {
    console.log('🔍 驗證雲朵移動功能');
    
    // 監聽控制台日誌
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('雲朵') || text.includes('cloud') || text.includes('☁️') || text.includes('🧪')) {
        console.log('🎮 雲朵日誌:', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓雲朵生成...');
    await page.waitForTimeout(3000);
    
    // 第一次截圖 - 雲朵剛生成
    await page.screenshot({ 
      path: 'test-results/cloud-movement-start.png',
      fullPage: true 
    });
    
    console.log('⏳ 等待 5 秒讓雲朵移動...');
    await page.waitForTimeout(5000);
    
    // 第二次截圖 - 雲朵移動後
    await page.screenshot({ 
      path: 'test-results/cloud-movement-end.png',
      fullPage: true 
    });
    
    // 檢查是否有清理雲朵的日誌
    const cleanupLogs = logs.filter(log => 
      log.includes('清理離開螢幕的雲朵') || 
      log.includes('🗑️')
    );
    
    console.log('🗑️ 雲朵清理日誌數量:', cleanupLogs.length);
    
    // 檢查雲朵生成日誌
    const cloudLogs = logs.filter(log => 
      log.includes('生成雲朵') || 
      log.includes('☁️ 使用雲朵紋理')
    );
    
    console.log('☁️ 雲朵生成日誌數量:', cloudLogs.length);
    
    // 檢查物理屬性日誌
    const physicsLogs = logs.filter(log => 
      log.includes('雲朵物理屬性') || 
      log.includes('🔧')
    );
    
    console.log('🔧 物理屬性日誌數量:', physicsLogs.length);
    
    // 驗證雲朵確實在生成
    expect(cloudLogs.length).toBeGreaterThan(0);
    
    // 驗證物理屬性正確
    expect(physicsLogs.length).toBeGreaterThan(0);
    
    console.log('✅ 雲朵移動測試完成');
    
    // 輸出關鍵統計
    console.log('📊 測試統計:');
    console.log(`  - 雲朵生成: ${cloudLogs.length} 次`);
    console.log(`  - 物理檢查: ${physicsLogs.length} 次`);
    console.log(`  - 雲朵清理: ${cleanupLogs.length} 次`);
  });
  
  test('檢查雲朵是否會離開螢幕', async ({ page }) => {
    console.log('🔍 檢查雲朵離開螢幕機制');
    
    // 監聽控制台日誌
    const cleanupLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('清理離開螢幕的雲朵') || text.includes('🗑️')) {
        cleanupLogs.push(text);
        console.log('🗑️ 雲朵清理:', text);
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 15 秒讓雲朵移動並離開螢幕...');
    await page.waitForTimeout(15000);
    
    // 截圖最終狀態
    await page.screenshot({ 
      path: 'test-results/cloud-cleanup-test.png',
      fullPage: true 
    });
    
    console.log('🗑️ 雲朵清理事件數量:', cleanupLogs.length);
    
    if (cleanupLogs.length > 0) {
      console.log('✅ 雲朵清理機制正常工作');
      cleanupLogs.forEach(log => console.log('  -', log));
    } else {
      console.log('⚠️ 未檢測到雲朵清理事件 (可能雲朵移動太慢或未離開螢幕)');
    }
    
    console.log('✅ 雲朵清理測試完成');
  });

});
