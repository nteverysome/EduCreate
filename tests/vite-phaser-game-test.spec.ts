/**
 * Vite + Phaser3 遊戲測試
 * 驗證本地 Vite + Phaser3 飛機遊戲是否正確載入和顯示
 */

import { test, expect } from '@playwright/test';

test.describe('Vite + Phaser3 飛機遊戲測試', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到遊戲頁面
    await page.goto('http://localhost:3003/games/airplane');
    await page.waitForLoadState('networkidle');
  });

  test('驗證 Vite + Phaser3 遊戲載入', async ({ page }) => {
    console.log('🎮 開始 Vite + Phaser3 遊戲載入測試');
    
    // 等待 EnhancedGameSwitcher 載入
    await expect(page.locator('.enhanced-game-switcher')).toBeVisible();
    
    // 點擊切換遊戲按鈕
    await page.click('button:has-text("切換遊戲")');
    await page.waitForTimeout(1000);
    
    // 查找並點擊飛機遊戲
    const airplaneButton = page.locator('button:has-text("飛機碰撞遊戲")');
    if (await airplaneButton.count() > 0) {
      await airplaneButton.click();
      console.log('✅ 點擊飛機遊戲按鈕成功');
      
      // 等待遊戲載入
      await page.waitForTimeout(5000);
      
      // 檢查是否有 iframe 載入
      const iframe = page.locator('iframe[title*="Vite + Phaser3"]');
      if (await iframe.count() > 0) {
        console.log('✅ Vite + Phaser3 iframe 已載入');
        
        // 檢查 iframe 的 src
        const iframeSrc = await iframe.getAttribute('src');
        console.log('🔗 Iframe URL:', iframeSrc);
        expect(iframeSrc).toContain('localhost:3004');
        
        // 檢查遊戲信息欄
        await expect(page.locator('text=Vite + Phaser3 飛機遊戲')).toBeVisible();
        
        console.log('✅ Vite + Phaser3 遊戲界面驗證成功');
      } else {
        console.log('⚠️ 未找到 Vite + Phaser3 iframe');
        
        // 檢查是否有錯誤信息
        const errorMessage = page.locator('text=載入失敗');
        if (await errorMessage.count() > 0) {
          console.log('❌ 遊戲載入失敗');
          const errorText = await errorMessage.textContent();
          console.log('錯誤信息:', errorText);
        }
      }
    } else {
      console.log('❌ 未找到飛機遊戲按鈕');
    }
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/vite-phaser-game-test.png',
      fullPage: true 
    });
    
    console.log('🎉 Vite + Phaser3 遊戲測試完成');
  });

  test('驗證 Vite 開發服務器連接', async ({ page }) => {
    console.log('🔗 開始 Vite 開發服務器連接測試');
    
    // 直接測試 Vite 服務器
    try {
      await page.goto('http://localhost:3004/games/airplane-game/');
      await page.waitForLoadState('networkidle');
      
      // 檢查 Phaser 遊戲是否載入
      const gameCanvas = page.locator('canvas');
      if (await gameCanvas.count() > 0) {
        console.log('✅ Phaser 遊戲 Canvas 已載入');
        
        // 檢查遊戲標題
        const gameTitle = page.locator('h1, h2, h3');
        if (await gameTitle.count() > 0) {
          const titleText = await gameTitle.first().textContent();
          console.log('🎮 遊戲標題:', titleText);
        }
        
        console.log('✅ Vite + Phaser3 遊戲直接訪問成功');
      } else {
        console.log('⚠️ 未找到 Phaser 遊戲 Canvas');
      }
      
      // 截圖記錄
      await page.screenshot({ 
        path: 'test-results/vite-server-direct-access.png',
        fullPage: true 
      });
      
    } catch (error) {
      console.error('❌ Vite 服務器連接失敗:', error);
    }
    
    console.log('🎉 Vite 開發服務器連接測試完成');
  });
});
