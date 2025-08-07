import { test, expect } from '@playwright/test';

/**
 * 🔍 EduCreate 生產環境代碼檢查測試
 * 
 * 直接檢查生產環境中的實際代碼和資源
 */

const PRODUCTION_URL = 'https://edu-create.vercel.app';

test.describe('🔍 生產環境代碼檢查', () => {
  
  test('🔍 檢查生產環境實際代碼內容', async ({ page }) => {
    console.log('🔍 檢查生產環境實際代碼內容...');
    
    // 導航到遊戲切換器頁面
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('📄 頁面載入完成，檢查實際代碼...');
    
    // 1. 檢查頁面源代碼中是否包含我們的修改
    const pageSource = await page.content();
    
    // 檢查是否包含 data-testid 屬性
    const hasGameSwitcherTestId = pageSource.includes('data-testid="game-switcher"');
    const hasGeptSelectorTestId = pageSource.includes('data-testid="gept-selector"');
    const hasGameContainerTestId = pageSource.includes('data-testid="game-container"');
    
    console.log('🏷️ 頁面源代碼中的 data-testid 檢查:');
    console.log(`  - game-switcher: ${hasGameSwitcherTestId}`);
    console.log(`  - gept-selector: ${hasGeptSelectorTestId}`);
    console.log(`  - game-container: ${hasGameContainerTestId}`);
    
    // 檢查是否包含響應式 CSS 類別
    const hasGameSwitcherContainer = pageSource.includes('game-switcher-container');
    const hasGeptSelectorClass = pageSource.includes('gept-selector');
    const hasGameIframeContainer = pageSource.includes('game-iframe-container');
    
    console.log('🎨 頁面源代碼中的響應式 CSS 類別檢查:');
    console.log(`  - game-switcher-container: ${hasGameSwitcherContainer}`);
    console.log(`  - gept-selector class: ${hasGeptSelectorClass}`);
    console.log(`  - game-iframe-container: ${hasGameIframeContainer}`);
    
    // 2. 檢查 CSS 文件是否載入
    const cssRequests = [];
    page.on('response', response => {
      if (response.url().includes('.css') || response.url().includes('responsive-game-switcher')) {
        cssRequests.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type']
        });
      }
    });
    
    // 重新載入頁面以捕獲 CSS 請求
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 CSS 文件載入檢查:');
    console.log(`  - CSS 請求數量: ${cssRequests.length}`);
    cssRequests.forEach(req => {
      console.log(`  - ${req.url} (狀態: ${req.status})`);
    });
    
    // 3. 檢查 JavaScript 文件中是否包含我們的組件代碼
    const jsRequests = [];
    page.on('response', response => {
      if (response.url().includes('.js') && 
          (response.url().includes('GameSwitcher') || 
           response.url().includes('games') ||
           response.url().includes('switcher'))) {
        jsRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 JavaScript 文件載入檢查:');
    console.log(`  - JS 請求數量: ${jsRequests.length}`);
    jsRequests.forEach(req => {
      console.log(`  - ${req.url} (狀態: ${req.status})`);
    });
    
    // 4. 檢查 Next.js 構建信息
    const nextData = await page.evaluate(() => {
      return {
        buildId: window.__NEXT_DATA__?.buildId || 'unknown',
        page: window.__NEXT_DATA__?.page || 'unknown',
        props: Object.keys(window.__NEXT_DATA__?.props || {}),
        hasNextData: typeof window.__NEXT_DATA__ !== 'undefined'
      };
    });
    
    console.log('⚛️ Next.js 構建信息:');
    console.log(`  - Build ID: ${nextData.buildId}`);
    console.log(`  - Page: ${nextData.page}`);
    console.log(`  - Has Next Data: ${nextData.hasNextData}`);
    
    // 5. 檢查實際渲染的 HTML 結構
    const actualHTML = await page.evaluate(() => {
      const body = document.body;
      // 尋找包含 "game" 的所有元素
      const gameElements = body.querySelectorAll('[class*="game"], [id*="game"], [data-testid*="game"]');
      return Array.from(gameElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        testId: el.getAttribute('data-testid'),
        textContent: el.textContent?.substring(0, 50) || ''
      }));
    });
    
    console.log('🏗️ 實際渲染的遊戲相關元素:');
    actualHTML.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tagName} - class: "${el.className}" - testId: "${el.testId}"`);
    });
    
    // 6. 檢查網絡錯誤
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('❌ 網絡錯誤檢查:');
    if (networkErrors.length > 0) {
      networkErrors.forEach(error => {
        console.log(`  - ${error.url} (${error.status} ${error.statusText})`);
      });
    } else {
      console.log('  - 沒有發現網絡錯誤');
    }
    
    // 7. 截圖記錄當前狀態
    await page.screenshot({ 
      path: 'test-results/production-code-inspection.png',
      fullPage: true 
    });
    
    // 8. 總結檢查結果
    const deploymentStatus = {
      dataTestIds: hasGameSwitcherTestId || hasGeptSelectorTestId || hasGameContainerTestId,
      responsiveClasses: hasGameSwitcherContainer || hasGeptSelectorClass || hasGameIframeContainer,
      cssLoaded: cssRequests.length > 0,
      jsLoaded: jsRequests.length > 0,
      noNetworkErrors: networkErrors.length === 0,
      hasGameElements: actualHTML.length > 0
    };
    
    const deployedFeatures = Object.values(deploymentStatus).filter(Boolean).length;
    const totalFeatures = Object.keys(deploymentStatus).length;
    const deploymentRate = (deployedFeatures / totalFeatures) * 100;
    
    console.log('📊 生產環境部署狀態總結:');
    Object.entries(deploymentStatus).forEach(([key, value]) => {
      console.log(`  ${value ? '✅' : '❌'} ${key}`);
    });
    console.log(`🎯 部署成功率: ${deploymentRate.toFixed(1)}% (${deployedFeatures}/${totalFeatures})`);
    
    if (deploymentRate >= 80) {
      console.log('🎉 響應式設計修復已成功部署！');
    } else if (deploymentRate >= 50) {
      console.log('⚠️ 響應式設計修復部分部署，可能需要更多時間');
    } else {
      console.log('❌ 響應式設計修復尚未部署，可能存在部署問題');
    }
    
    console.log('✅ 生產環境代碼檢查完成');
  });
  
  test('🔍 檢查 Vercel 部署時間戳', async ({ page }) => {
    console.log('⏰ 檢查 Vercel 部署時間戳...');
    
    await page.goto(`${PRODUCTION_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    
    // 檢查 Vercel 相關的 meta 標籤或標頭
    const vercelInfo = await page.evaluate(() => {
      const metaTags = Array.from(document.querySelectorAll('meta'));
      const vercelMeta = metaTags.filter(tag => 
        tag.name?.includes('vercel') || 
        tag.content?.includes('vercel') ||
        tag.name?.includes('deployment')
      );
      
      return {
        metaTags: vercelMeta.map(tag => ({
          name: tag.name,
          content: tag.content,
          property: tag.getAttribute('property')
        })),
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      };
    });
    
    console.log('🌐 Vercel 部署信息:');
    if (vercelInfo.metaTags.length > 0) {
      vercelInfo.metaTags.forEach(tag => {
        console.log(`  - ${tag.name || tag.property}: ${tag.content}`);
      });
    } else {
      console.log('  - 未找到 Vercel 相關的 meta 標籤');
    }
    
    console.log(`⏰ 檢查時間: ${new Date(vercelInfo.timestamp).toISOString()}`);
    console.log('✅ Vercel 部署時間戳檢查完成');
  });
});
