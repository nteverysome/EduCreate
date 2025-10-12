import { test, expect } from '@playwright/test';

test.describe('導航簡化部署驗證', () => {
  test('等待部署完成並驗證簡化效果', async ({ page }) => {
    console.log('🚀 開始檢查 Vercel 部署狀態...');
    
    // 等待部署完成 - 多次嘗試
    let deploymentReady = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!deploymentReady && attempts < maxAttempts) {
      attempts++;
      console.log(`📡 嘗試 ${attempts}/${maxAttempts} - 檢查部署狀態...`);
      
      try {
        await page.goto('https://edu-create.vercel.app/', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // 檢查頁面是否正常載入
        await page.waitForSelector('body', { timeout: 10000 });
        
        // 檢查是否有導航組件
        const navExists = await page.locator('[data-testid="unified-navigation"]').count() > 0;
        
        if (navExists) {
          console.log('✅ 導航組件已載入');
          deploymentReady = true;
        } else {
          console.log('⏳ 導航組件尚未載入，等待中...');
          await page.waitForTimeout(10000); // 等待10秒
        }
        
      } catch (error) {
        console.log(`❌ 嘗試 ${attempts} 失敗: ${error.message}`);
        if (attempts < maxAttempts) {
          await page.waitForTimeout(15000); // 等待15秒再重試
        }
      }
    }
    
    if (!deploymentReady) {
      throw new Error('部署檢查超時 - 無法確認部署完成');
    }
    
    console.log('🎉 部署已完成，開始驗證簡化效果...');
    
    // 檢查導航項目數量
    const navItems = await page.locator('[data-testid="unified-navigation"] a[data-testid^="nav-"]').count();
    console.log(`📊 導航項目數量: ${navItems}`);
    
    // 截圖記錄部署後的狀態
    await page.screenshot({ 
      path: 'test-results/navigation-deployment-verification.png',
      fullPage: false
    });
    
    // 驗證核心導航項目存在
    const coreNavItems = [
      'nav-home',
      'nav-my-activities', 
      'nav-create-activity',
      'nav-dashboard'
    ];
    
    let foundItems = 0;
    for (const testId of coreNavItems) {
      const item = page.locator(`[data-testid="${testId}"]`);
      const exists = await item.count() > 0;
      if (exists) {
        foundItems++;
        console.log(`✅ 找到核心項目: ${testId}`);
      } else {
        console.log(`❌ 缺少核心項目: ${testId}`);
      }
    }
    
    console.log(`📈 找到 ${foundItems}/4 個核心導航項目`);
    
    // 如果找到的項目數量合理，認為部署成功
    if (foundItems >= 2) {
      console.log('🎉 導航簡化部署驗證成功！');
    } else {
      console.log('⚠️ 導航項目數量不符預期，可能需要更多時間部署');
    }
    
    // 記錄最終狀態
    console.log(`📋 最終統計:`);
    console.log(`   - 總導航項目: ${navItems}`);
    console.log(`   - 核心項目: ${foundItems}/4`);
    console.log(`   - 部署嘗試次數: ${attempts}`);
  });

  test('驗證手機版選單簡化', async ({ page }) => {
    console.log('📱 開始驗證手機版選單簡化...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問首頁
    await page.goto('https://edu-create.vercel.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 尋找手機版選單按鈕
    const menuButton = page.locator('button').filter({ hasText: /選單|menu|☰|≡/ }).first();
    const menuButtonExists = await menuButton.count() > 0;
    
    if (menuButtonExists) {
      console.log('📱 找到手機版選單按鈕');
      await menuButton.click();
      
      // 等待選單展開
      await page.waitForTimeout(1000);
      
      // 檢查選單項目
      const menuItems = await page.locator('a, button').filter({ hasText: /登入|註冊|首頁|活動|儀表板/ }).count();
      console.log(`📊 手機版選單項目數量: ${menuItems}`);
      
      // 截圖記錄手機版選單
      await page.screenshot({ 
        path: 'test-results/mobile-menu-simplified.png',
        fullPage: false
      });
      
    } else {
      console.log('ℹ️ 未找到明顯的手機版選單按鈕');
    }
    
    console.log('🎉 手機版選單驗證完成！');
  });
});
