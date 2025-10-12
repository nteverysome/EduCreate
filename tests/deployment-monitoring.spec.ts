import { test, expect } from '@playwright/test';

test.describe('部署狀態持續監控', () => {
  
  test('持續監控 Vercel 部署狀態直到新部署出現', async ({ page }) => {
    console.log('🔍 開始持續監控部署狀態...');
    
    // 設置長超時時間
    test.setTimeout(600000); // 10分鐘
    
    const maxAttempts = 20; // 最多檢查20次
    const checkInterval = 30000; // 每30秒檢查一次
    
    let deploymentFound = false;
    let latestDeploymentTime = '2025-10-12T06:21:02Z'; // 已知的最新部署時間
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`\n🔍 第 ${attempt}/${maxAttempts} 次檢查部署狀態...`);
      
      try {
        // 使用 GitHub API 檢查部署
        const response = await fetch('https://api.github.com/repos/nteverysome/EduCreate/deployments?per_page=1');
        const deployments = await response.json();
        
        if (deployments && deployments.length > 0) {
          const latestDeployment = deployments[0];
          const deploymentTime = latestDeployment.created_at;
          
          console.log(`最新部署時間: ${deploymentTime}`);
          
          if (deploymentTime > latestDeploymentTime) {
            console.log('🎉 發現新的部署！');
            deploymentFound = true;
            
            // 檢查部署狀態
            const statusResponse = await fetch(`${latestDeployment.url}/statuses`);
            const statuses = await statusResponse.json();
            
            if (statuses && statuses.length > 0) {
              const latestStatus = statuses[0];
              console.log(`部署狀態: ${latestStatus.state}`);
              console.log(`部署描述: ${latestStatus.description}`);
              
              if (latestStatus.state === 'success') {
                console.log('✅ 部署成功完成！');
                break;
              } else if (latestStatus.state === 'failure') {
                console.log('❌ 部署失敗');
                break;
              } else if (latestStatus.state === 'pending') {
                console.log('🔄 部署進行中...');
              }
            }
          } else {
            console.log('⏳ 還沒有新的部署');
          }
        }
        
      } catch (error) {
        console.log(`❌ 檢查部署時出錯: ${error}`);
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ 等待 ${checkInterval/1000} 秒後再次檢查...`);
        await page.waitForTimeout(checkInterval);
      }
    }
    
    if (deploymentFound) {
      console.log('\n🎉 找到新的部署，現在測試網站功能...');
      
      // 測試網站功能
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('https://edu-create.vercel.app');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('📱 訪問網站測試功能...');
      
      // 打開手機版選單
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(2000);
        
        console.log('🔓 已打開手機版選單');
        
        // 截圖記錄部署後的狀態
        await page.screenshot({ 
          path: `test-results/mobile-menu-after-deployment.png`,
          fullPage: true 
        });
        
        // 檢查主要導航功能
        const mainNavItems = ['首頁', '我的活動', '功能儀表板', '創建活動'];
        let foundMainItems = 0;
        
        for (const item of mainNavItems) {
          const navItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
          if (await navItem.isVisible()) {
            foundMainItems++;
            console.log(`✅ 找到主要導航: ${item}`);
          }
        }
        
        console.log(`主要導航功能: ${foundMainItems}/${mainNavItems.length}`);
        
        // 檢查登入狀態
        const loginButton = page.locator('.md\\:hidden').locator('text=登入');
        const isLoggedOut = await loginButton.isVisible();
        
        if (isLoggedOut) {
          console.log('ℹ️ 用戶未登入，用戶管理功能需要登入後才能看到');
          console.log('💡 功能已實現，但需要登入狀態才能驗證');
        } else {
          console.log('✅ 用戶已登入，檢查用戶管理功能...');
          
          // 檢查用戶管理功能
          const userFunctions = [
            '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃', '登出'
          ];
          
          let foundUserItems = 0;
          for (const func of userFunctions) {
            const functionItem = page.locator(`.md\\:hidden`).locator(`text=${func}`);
            if (await functionItem.isVisible()) {
              console.log(`✅ 找到用戶功能: ${func}`);
              foundUserItems++;
            }
          }
          
          console.log(`用戶管理功能: ${foundUserItems}/${userFunctions.length}`);
          
          if (foundUserItems > 0) {
            console.log('🎉 手機版用戶選單功能部署成功！');
          }
        }
        
        if (foundMainItems === mainNavItems.length) {
          console.log('✅ 網站功能正常，部署成功');
        }
      }
      
    } else {
      console.log('\n⚠️ 在監控期間內沒有發現新的部署');
      console.log('💡 可能需要：');
      console.log('   1. 檢查 Vercel 專案設置');
      console.log('   2. 確認 GitHub webhook 配置');
      console.log('   3. 手動在 Vercel Dashboard 中觸發部署');
    }
    
    console.log('\n📋 部署監控完成');
  });

  test('檢查當前網站狀態和功能可用性', async ({ page }) => {
    console.log('🔍 檢查當前網站狀態...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問主頁
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📱 已訪問主頁');
    
    // 檢查頁面是否正常載入
    const pageTitle = await page.title();
    console.log(`頁面標題: ${pageTitle}`);
    
    // 檢查是否有錯誤
    const errorMessages = await page.locator('text=Error').or(
      page.locator('text=500').or(
        page.locator('text=404')
      )
    ).count();
    
    if (errorMessages > 0) {
      console.log('❌ 頁面可能有錯誤');
    } else {
      console.log('✅ 頁面載入正常');
    }
    
    // 打開手機版選單
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(2000);
      
      console.log('🔓 已打開手機版選單');
      
      // 截圖當前狀態
      await page.screenshot({ 
        path: `test-results/current-website-status.png`,
        fullPage: true 
      });
      
      // 統計所有可見的選單項目
      const allMenuItems = await page.locator('.md\\:hidden a, .md\\:hidden button').allTextContents();
      const visibleItems = allMenuItems.filter(text => text.trim().length > 0);
      
      console.log(`\n📊 當前手機版選單項目總數: ${visibleItems.length}`);
      console.log('前10個項目:');
      visibleItems.slice(0, 10).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.trim()}`);
      });
      
      // 檢查關鍵功能
      const keyFunctions = [
        '首頁', '我的活動', '功能儀表板', '創建活動',
        '智能排序', '活動模板', '檔案空間', '遊戲架構'
      ];
      
      let foundKeyFunctions = 0;
      for (const func of keyFunctions) {
        const functionItem = page.locator(`.md\\:hidden`).locator(`text=${func}`);
        if (await functionItem.isVisible()) {
          foundKeyFunctions++;
        }
      }
      
      console.log(`\n關鍵功能可見性: ${foundKeyFunctions}/${keyFunctions.length}`);
      
      // 檢查登入狀態
      const loginButton = page.locator('.md\\:hidden').locator('text=登入');
      const isLoggedOut = await loginButton.isVisible();
      
      console.log(`登入狀態: ${isLoggedOut ? '未登入' : '已登入'}`);
      
      if (foundKeyFunctions >= keyFunctions.length * 0.8) {
        console.log('✅ 網站核心功能正常');
      } else {
        console.log('⚠️ 部分核心功能可能有問題');
      }
      
    } else {
      console.log('❌ 未找到手機版選單按鈕，可能有問題');
    }
    
    console.log('\n📋 網站狀態檢查完成');
  });
});
