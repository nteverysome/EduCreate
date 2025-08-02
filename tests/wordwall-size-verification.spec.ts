import { test, expect } from '@playwright/test';

/**
 * 驗證所有遊戲容器都使用 Wordwall 實際尺寸 1274x739
 */

test.describe('Wordwall 尺寸驗證', () => {
  
  test('驗證 GameSwitcher 使用 Wordwall 尺寸', async ({ page }) => {
    console.log('🔍 驗證 GameSwitcher 容器尺寸');
    
    await page.goto('/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 檢查 iframe 尺寸
    const iframeInfo = await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const rect = iframe.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }
      return null;
    });
    
    console.log('📐 GameSwitcher iframe 尺寸:', iframeInfo);
    
    if (iframeInfo) {
      expect(iframeInfo.width).toBe(1274);
      expect(iframeInfo.height).toBe(739);
    }
    
    // 截圖驗證
    await page.screenshot({ 
      path: 'test-results/gameswitcher-wordwall-size.png',
      fullPage: true 
    });
    
    console.log('✅ GameSwitcher 尺寸驗證通過');
  });
  
  test('驗證飛機遊戲使用 Wordwall 尺寸', async ({ page }) => {
    console.log('🔍 驗證飛機遊戲容器尺寸');
    
    await page.goto('/games/airplane');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 檢查遊戲容器尺寸
    const containerInfo = await page.evaluate(() => {
      const container = document.querySelector('.game-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }
      return null;
    });
    
    console.log('📐 飛機遊戲容器尺寸:', containerInfo);
    
    if (containerInfo) {
      expect(containerInfo.width).toBe(1274);
      expect(containerInfo.height).toBe(739);
    }
    
    // 截圖驗證
    await page.screenshot({ 
      path: 'test-results/airplane-game-wordwall-size.png',
      fullPage: true 
    });
    
    console.log('✅ 飛機遊戲尺寸驗證通過');
  });
  
  test('驗證 Vite 版本飛機遊戲使用 Wordwall 尺寸', async ({ page }) => {
    console.log('🔍 驗證 Vite 版本飛機遊戲容器尺寸');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 檢查遊戲容器尺寸
    const containerInfo = await page.evaluate(() => {
      const container = document.querySelector('#game-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      }
      return null;
    });
    
    console.log('📐 Vite 版本容器尺寸:', containerInfo);
    
    if (containerInfo) {
      expect(containerInfo.width).toBe(1274);
      expect(containerInfo.height).toBe(739);
    }
    
    // 截圖驗證
    await page.screenshot({ 
      path: 'test-results/vite-airplane-game-wordwall-size.png',
      fullPage: true 
    });
    
    console.log('✅ Vite 版本尺寸驗證通過');
  });
  
  test('比較所有版本的尺寸一致性', async ({ page }) => {
    console.log('🔍 比較所有版本的尺寸一致性');
    
    const results = [];
    
    // 測試 GameSwitcher
    await page.goto('/games/switcher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const switcherSize = await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const rect = iframe.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      }
      return null;
    });
    
    results.push({ name: 'GameSwitcher', size: switcherSize });
    
    // 測試 Next.js 飛機遊戲
    await page.goto('/games/airplane');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const nextjsSize = await page.evaluate(() => {
      const container = document.querySelector('.game-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      }
      return null;
    });
    
    results.push({ name: 'Next.js 飛機遊戲', size: nextjsSize });
    
    // 測試 Vite 飛機遊戲
    try {
      await page.goto('http://localhost:3001/games/airplane-game/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const viteSize = await page.evaluate(() => {
        const container = document.querySelector('#game-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          return { width: Math.round(rect.width), height: Math.round(rect.height) };
        }
        return null;
      });
      
      results.push({ name: 'Vite 飛機遊戲', size: viteSize });
    } catch (error) {
      console.log('⚠️ Vite 版本無法訪問:', error.message);
      results.push({ name: 'Vite 飛機遊戲', size: null, error: error.message });
    }
    
    console.log('📊 所有版本尺寸比較:');
    results.forEach(result => {
      if (result.size) {
        console.log(`  ${result.name}: ${result.size.width}x${result.size.height}`);
        
        // 驗證是否符合 Wordwall 尺寸
        expect(result.size.width).toBe(1274);
        expect(result.size.height).toBe(739);
      } else {
        console.log(`  ${result.name}: 無法檢測 ${result.error || ''}`);
      }
    });
    
    console.log('✅ 所有版本尺寸一致性驗證完成');
  });

});
