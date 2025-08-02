import { test, expect } from '@playwright/test';

/**
 * 測試雲朵是否從最右邊邊界開始生成
 */

test.describe('雲朵位置測試', () => {
  
  test('確認雲朵從最右邊邊界開始生成', async ({ page }) => {
    console.log('🔍 檢查雲朵是否從最右邊邊界開始生成');
    
    // 監聽控制台日誌
    const cloudPositions: number[] = [];
    page.on('console', msg => {
      const text = msg.text();
      
      // 檢查雲朵生成位置
      if (text.includes('☁️ 使用雲朵紋理') && text.includes('位置:')) {
        const match = text.match(/位置:\s*(\d+)/);
        if (match) {
          const xPosition = parseInt(match[1]);
          cloudPositions.push(xPosition);
          console.log('🎮 雲朵生成位置 x:', xPosition);
        }
      }
      
      // 檢查雲朵移動位置
      if (text.includes('☁️ 雲朵') && text.includes('x=')) {
        const match = text.match(/x=(\d+)/);
        if (match) {
          const xPosition = parseInt(match[1]);
          if (xPosition > 1300) {
            console.log('🎮 雲朵當前位置 x:', xPosition);
          }
        }
      }
    });
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 6 秒讓雲朵生成...');
    await page.waitForTimeout(6000);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/cloud-position-test.png',
      fullPage: true 
    });
    
    console.log('📊 雲朵生成位置統計:');
    console.log(`  - 總生成數量: ${cloudPositions.length}`);
    
    if (cloudPositions.length > 0) {
      const minX = Math.min(...cloudPositions);
      const maxX = Math.max(...cloudPositions);
      const avgX = Math.round(cloudPositions.reduce((a, b) => a + b, 0) / cloudPositions.length);
      
      console.log(`  - 最小 x 位置: ${minX}`);
      console.log(`  - 最大 x 位置: ${maxX}`);
      console.log(`  - 平均 x 位置: ${avgX}`);
      
      // 檢查是否從右邊邊界開始 (應該是 1350 左右)
      if (minX >= 1300) {
        console.log('✅ 雲朵確實從最右邊邊界開始生成');
      } else {
        console.log('❌ 雲朵沒有從最右邊邊界開始生成');
      }
      
      // 驗證雲朵從右邊邊界開始
      expect(minX).toBeGreaterThanOrEqual(1300);
      
    } else {
      console.log('❌ 沒有檢測到雲朵生成');
      expect(cloudPositions.length).toBeGreaterThan(0);
    }
    
    console.log('✅ 雲朵位置測試完成');
  });

});
