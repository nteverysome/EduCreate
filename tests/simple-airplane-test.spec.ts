/**
 * 簡單的 Airplane 遊戲測試
 * 不使用 global-setup，直接測試
 */

import { test, expect } from '@playwright/test';

test.describe('簡單 Airplane 遊戲測試', () => {
  test('檢查主頁面是否有 airplane 遊戲連結', async ({ page }) => {
    // 直接訪問主頁面
    await page.goto('http://localhost:3000');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查是否有 airplane 遊戲連結
    const airplaneLink = page.locator('[data-testid="airplane-game-link"]');
    
    try {
      await expect(airplaneLink).toBeVisible({ timeout: 10000 });
      console.log('✅ 主頁面有 airplane 遊戲連結');
    } catch (error) {
      console.log('❌ 主頁面沒有 airplane 遊戲連結');
      
      // 截圖記錄當前狀態
      await page.screenshot({ 
        path: 'test-results/homepage-no-airplane-link.png',
        fullPage: true 
      });
      
      throw error;
    }
    
    // 截圖記錄成功狀態
    await page.screenshot({ 
      path: 'test-results/homepage-with-airplane-link.png',
      fullPage: true 
    });
  });

  test('檢查 airplane 遊戲頁面是否能載入', async ({ page }) => {
    // 直接訪問 airplane 遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面標題
    try {
      await expect(page.locator('h1')).toContainText('Airplane Collision Game', { timeout: 10000 });
      console.log('✅ airplane 遊戲頁面載入成功');
    } catch (error) {
      console.log('❌ airplane 遊戲頁面載入失敗');
      
      // 截圖記錄錯誤狀態
      await page.screenshot({ 
        path: 'test-results/airplane-page-load-failed.png',
        fullPage: true 
      });
      
      throw error;
    }
    
    // 截圖記錄成功狀態
    await page.screenshot({ 
      path: 'test-results/airplane-page-loaded-success.png',
      fullPage: true 
    });
  });

  test('檢查 AirplaneCollisionGame 組件是否能載入', async ({ page }) => {
    // 訪問 airplane 遊戲頁面
    await page.goto('http://localhost:3000/games/airplane');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 等待動態組件載入
    await page.waitForTimeout(5000);
    
    // 檢查遊戲容器
    const gameContainer = page.locator('.bg-gray-900.rounded-lg');
    
    try {
      await expect(gameContainer).toBeVisible({ timeout: 10000 });
      console.log('✅ 遊戲容器載入成功');
    } catch (error) {
      console.log('❌ 遊戲容器載入失敗');
      
      // 截圖記錄錯誤狀態
      await page.screenshot({ 
        path: 'test-results/game-container-load-failed.png',
        fullPage: true 
      });
      
      throw error;
    }
    
    // 檢查是否有載入錯誤
    const errorElements = await page.locator('text=Error').count();
    console.log(`發現 ${errorElements} 個錯誤元素`);
    
    // 檢查 Phaser 是否載入
    const phaserLoaded = await page.evaluate(() => {
      return typeof window.Phaser !== 'undefined';
    });
    console.log(`Phaser 是否載入: ${phaserLoaded}`);
    
    // 截圖記錄最終狀態
    await page.screenshot({ 
      path: 'test-results/game-component-final-state.png',
      fullPage: true 
    });
  });
});
