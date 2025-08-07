import { test, expect } from '@playwright/test';

/**
 * 🔍 EduCreate 組件可見性深度調試測試
 * 
 * 專門用於調試為什麼 data-testid 選擇器找不到組件
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('🔍 組件可見性深度調試', () => {
  
  test('🔍 深度分析組件渲染狀況', async ({ page }) => {
    console.log('🔍 開始深度調試組件可見性問題...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 等待頁面完全載入
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // 增加等待時間
    
    console.log('📄 頁面載入完成，開始分析 DOM 結構...');
    
    // 1. 檢查頁面基本信息
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('📄 頁面標題:', pageTitle);
    console.log('🔗 頁面 URL:', pageUrl);
    
    // 2. 檢查是否有 JavaScript 錯誤
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    // 3. 分析整個頁面的 DOM 結構
    const bodyHTML = await page.evaluate(() => {
      return document.body.innerHTML.substring(0, 2000); // 只取前2000字符避免過長
    });
    console.log('🏗️ 頁面 DOM 結構 (前2000字符):', bodyHTML);
    
    // 4. 尋找所有可能的遊戲切換器相關元素
    console.log('🔍 搜尋遊戲切換器相關元素...');
    
    // 檢查各種可能的選擇器
    const selectors = [
      '[data-testid="game-switcher"]',
      '.game-switcher',
      '.game-switcher-container',
      '[class*="game-switcher"]',
      '[class*="GameSwitcher"]'
    ];
    
    for (const selector of selectors) {
      const elements = await page.locator(selector).count();
      console.log(`🎯 選擇器 "${selector}": 找到 ${elements} 個元素`);
      
      if (elements > 0) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        const boundingBox = await element.boundingBox().catch(() => null);
        console.log(`   - 可見性: ${isVisible}`);
        console.log(`   - 位置: ${boundingBox ? `${boundingBox.x},${boundingBox.y} ${boundingBox.width}x${boundingBox.height}` : '無法獲取'}`);
      }
    }
    
    // 5. 檢查 GEPT 選擇器
    console.log('📚 搜尋 GEPT 選擇器相關元素...');
    const geptSelectors = [
      '[data-testid="gept-selector"]',
      '.gept-selector',
      '[class*="gept"]'
    ];
    
    for (const selector of geptSelectors) {
      const elements = await page.locator(selector).count();
      console.log(`📚 選擇器 "${selector}": 找到 ${elements} 個元素`);
    }
    
    // 6. 檢查遊戲容器
    console.log('🎮 搜尋遊戲容器相關元素...');
    const containerSelectors = [
      '[data-testid="game-container"]',
      '.game-container',
      '.game-iframe-container',
      'iframe'
    ];
    
    for (const selector of containerSelectors) {
      const elements = await page.locator(selector).count();
      console.log(`🎮 選擇器 "${selector}": 找到 ${elements} 個元素`);
    }
    
    // 7. 檢查所有包含 "game" 的 class
    const gameClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="game"]');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        textContent: el.textContent?.substring(0, 50) || ''
      }));
    });
    console.log('🎮 所有包含 "game" 的元素:', gameClasses);
    
    // 8. 檢查所有 data-testid 屬性
    const testIds = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        testId: el.getAttribute('data-testid'),
        className: el.className,
        visible: el.offsetParent !== null
      }));
    });
    console.log('🏷️ 所有 data-testid 元素:', testIds);
    
    // 9. 檢查 React 組件是否正確載入
    const reactElements = await page.evaluate(() => {
      // 檢查是否有 React 相關的屬性
      const reactProps = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
      return {
        reactRoot: reactProps.length,
        hasReact: typeof window.React !== 'undefined',
        hasNextJS: typeof window.__NEXT_DATA__ !== 'undefined'
      };
    });
    console.log('⚛️ React 載入狀況:', reactElements);
    
    // 10. 截圖記錄當前狀態
    await page.screenshot({ 
      path: 'test-results/component-visibility-debug.png',
      fullPage: true 
    });
    
    // 11. 檢查 CSS 載入狀況
    const cssInfo = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      return stylesheets.map(sheet => ({
        href: sheet.href,
        rules: sheet.cssRules ? sheet.cssRules.length : 'blocked'
      }));
    });
    console.log('🎨 CSS 載入狀況:', cssInfo);
    
    // 12. 檢查是否有載入錯誤
    console.log('❌ JavaScript 錯誤:', jsErrors);
    
    console.log('✅ 組件可見性深度調試完成');
  });
  
  test('🔍 檢查組件渲染時機', async ({ page }) => {
    console.log('⏰ 檢查組件渲染時機...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 監聽 DOM 變化
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    
    // 分階段檢查組件出現
    const checkTimes = [1000, 2000, 3000, 5000, 8000];
    
    for (const time of checkTimes) {
      await page.waitForTimeout(time);
      
      const gameSwitcher = await page.locator('[data-testid="game-switcher"]').count();
      const geptSelector = await page.locator('[data-testid="gept-selector"]').count();
      const gameContainer = await page.locator('[data-testid="game-container"]').count();
      
      console.log(`⏰ ${time}ms 後:`, {
        gameSwitcher,
        geptSelector,
        gameContainer
      });
      
      if (gameSwitcher > 0 || geptSelector > 0 || gameContainer > 0) {
        console.log(`✅ 在 ${time}ms 時發現組件！`);
        break;
      }
    }
    
    console.log('✅ 組件渲染時機檢查完成');
  });
  
  test('🔍 檢查生產環境 vs 開發環境差異', async ({ page }) => {
    console.log('🌐 檢查生產環境 vs 開發環境差異...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 檢查生產環境
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const prodInfo = await page.evaluate(() => ({
      url: window.location.href,
      userAgent: navigator.userAgent,
      hasServiceWorker: 'serviceWorker' in navigator,
      isProduction: process?.env?.NODE_ENV === 'production',
      buildId: window.__NEXT_DATA__?.buildId || 'unknown'
    }));
    
    console.log('🌐 生產環境信息:', prodInfo);
    
    // 檢查網絡請求
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('🌐 網絡請求 (前10個):', requests.slice(0, 10));
    
    console.log('✅ 環境差異檢查完成');
  });
});
