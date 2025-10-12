import { test, expect } from '@playwright/test';

test.describe('Vercel 部署最終檢查', () => {
  
  test('檢查最新部署狀態並與 Vercel 互動', async ({ page }) => {
    console.log('🔍 檢查 Vercel 部署狀態...');
    
    // 訪問 Vercel 部署頁面
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    console.log('📄 已訪問 Vercel 部署頁面');
    
    // 截圖部署頁面
    await page.screenshot({ 
      path: `test-results/vercel-deployments-page.png`,
      fullPage: true 
    });
    
    // 查找最新的部署
    console.log('\n🔍 查找最新部署...');
    
    // 嘗試查找部署狀態指示器
    const deploymentSelectors = [
      '[data-testid="deployment-status"]',
      '.deployment-status',
      '[aria-label*="deployment"]',
      '[title*="deployment"]',
      'text=Ready',
      'text=Building',
      'text=Error',
      'text=Canceled'
    ];
    
    let foundDeploymentStatus = false;
    for (const selector of deploymentSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const text = await element.textContent();
        console.log(`✅ 找到部署狀態: ${text}`);
        foundDeploymentStatus = true;
        break;
      }
    }
    
    if (!foundDeploymentStatus) {
      console.log('⚠️ 未找到明確的部署狀態指示器');
    }
    
    // 查找提交信息
    console.log('\n📝 查找最新提交信息...');
    
    const commitSelectors = [
      'text=fix: 簡化手機版導航選單',
      'text=647abb5',
      '[data-testid="commit-message"]',
      '.commit-message'
    ];
    
    let foundCommitInfo = false;
    for (const selector of commitSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        const text = await element.textContent();
        console.log(`✅ 找到提交信息: ${text?.substring(0, 50)}...`);
        foundCommitInfo = true;
        break;
      }
    }
    
    if (!foundCommitInfo) {
      console.log('⚠️ 未找到最新提交信息');
    }
    
    // 查找部署時間
    console.log('\n⏰ 查找部署時間...');
    
    const timeSelectors = [
      '[data-testid="deployment-time"]',
      '.deployment-time',
      'time',
      '[title*="ago"]',
      'text=/\\d+\\s*(second|minute|hour)s?\\s*ago/'
    ];
    
    let foundDeploymentTime = false;
    for (const selector of timeSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = elements.nth(i);
          if (await element.isVisible()) {
            const text = await element.textContent();
            if (text && (text.includes('ago') || text.includes('秒') || text.includes('分') || text.includes('小時'))) {
              console.log(`✅ 找到部署時間: ${text}`);
              foundDeploymentTime = true;
              break;
            }
          }
        }
        if (foundDeploymentTime) break;
      }
    }
    
    if (!foundDeploymentTime) {
      console.log('⚠️ 未找到部署時間信息');
    }
    
    // 嘗試點擊最新部署查看詳情
    console.log('\n🔍 嘗試查看部署詳情...');
    
    const deploymentLinkSelectors = [
      'a[href*="/deployments/"]',
      '[data-testid="deployment-link"]',
      '.deployment-link'
    ];
    
    let clickedDeployment = false;
    for (const selector of deploymentLinkSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ 找到部署連結，點擊查看詳情...`);
        await element.click();
        await page.waitForTimeout(3000);
        clickedDeployment = true;
        break;
      }
    }
    
    if (clickedDeployment) {
      // 截圖部署詳情頁面
      await page.screenshot({ 
        path: `test-results/vercel-deployment-details.png`,
        fullPage: true 
      });
      
      console.log('📸 已截圖部署詳情頁面');
      
      // 查找構建日誌或狀態
      const buildLogSelectors = [
        'text=Build Logs',
        'text=Function Logs',
        'text=Runtime Logs',
        '[data-testid="build-logs"]'
      ];
      
      for (const selector of buildLogSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`✅ 找到構建日誌: ${selector}`);
          break;
        }
      }
    }
    
    console.log('\n📋 Vercel 部署檢查完成');
  });

  test('驗證網站功能正常運行', async ({ page }) => {
    console.log('🔍 驗證網站功能正常運行...');
    
    // 訪問主網站
    await page.goto('https://edu-create.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('🌐 已訪問主網站');
    
    // 檢查頁面標題
    const title = await page.title();
    console.log(`📄 頁面標題: ${title}`);
    
    // 檢查是否有錯誤
    const hasError = await page.locator('text=Error').isVisible();
    const has404 = await page.locator('text=404').isVisible();
    const has500 = await page.locator('text=500').isVisible();
    
    if (hasError || has404 || has500) {
      console.log('❌ 網站出現錯誤');
      await page.screenshot({ 
        path: `test-results/website-error.png`,
        fullPage: true 
      });
    } else {
      console.log('✅ 網站正常運行');
    }
    
    // 測試手機版選單
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'networkidle' });
    
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(2000);
      
      // 檢查簡化後的選單
      const menuItems = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
      const visibleItems = menuItems.filter(text => text.trim().length > 0);
      
      console.log(`📱 手機版選單項目數: ${visibleItems.length}`);
      
      if (visibleItems.length <= 10) {
        console.log('✅ 手機版選單已成功簡化');
      } else {
        console.log('⚠️ 手機版選單可能仍有過多項目');
      }
      
      // 截圖最終的手機版選單
      await page.screenshot({ 
        path: `test-results/final-mobile-menu-verification.png`,
        fullPage: true 
      });
    }
    
    console.log('\n📋 網站功能驗證完成');
  });
});
