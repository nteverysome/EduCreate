import { test, expect } from '@playwright/test';

test.describe('Vercel 部署狀態檢查', () => {
  
  test('檢查 Vercel 部署頁面的最新狀態', async ({ page }) => {
    console.log('🔍 檢查 Vercel 部署頁面...');
    
    // 訪問 Vercel 部署頁面
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('📄 已訪問 Vercel 部署頁面');
    
    // 截圖記錄當前狀態
    await page.screenshot({ 
      path: `test-results/vercel-deployments-page.png`,
      fullPage: true 
    });
    
    // 檢查是否需要登入
    const loginButton = page.locator('text=Sign In').or(page.locator('text=Login'));
    if (await loginButton.isVisible()) {
      console.log('⚠️ Vercel 頁面需要登入，無法檢查部署狀態');
      console.log('💡 建議：直接在瀏覽器中檢查 Vercel 部署頁面');
      return;
    }
    
    // 查找最新的部署項目
    console.log('🔍 查找最新的部署項目...');
    
    // 查找部署列表
    const deploymentItems = page.locator('[data-testid="deployment-item"], .deployment-item, .deployment-row');
    const deploymentCount = await deploymentItems.count();
    
    console.log(`找到 ${deploymentCount} 個部署項目`);
    
    if (deploymentCount > 0) {
      // 檢查前3個部署項目的狀態
      for (let i = 0; i < Math.min(3, deploymentCount); i++) {
        const deployment = deploymentItems.nth(i);
        
        // 嘗試獲取部署信息
        const deploymentText = await deployment.textContent();
        console.log(`部署 ${i + 1}: ${deploymentText?.substring(0, 100)}...`);
        
        // 檢查是否有成功、失敗或進行中的狀態
        const isSuccess = await deployment.locator('text=Ready').or(deployment.locator('text=Success')).isVisible();
        const isFailed = await deployment.locator('text=Failed').or(deployment.locator('text=Error')).isVisible();
        const isBuilding = await deployment.locator('text=Building').or(deployment.locator('text=Queued')).isVisible();
        
        if (isSuccess) {
          console.log(`  ✅ 部署 ${i + 1}: 成功`);
        } else if (isFailed) {
          console.log(`  ❌ 部署 ${i + 1}: 失敗`);
        } else if (isBuilding) {
          console.log(`  🔄 部署 ${i + 1}: 進行中`);
        } else {
          console.log(`  ❓ 部署 ${i + 1}: 狀態未知`);
        }
      }
    }
    
    // 查找是否有新的部署正在進行
    const buildingDeployment = page.locator('text=Building').or(
      page.locator('text=Queued').or(
        page.locator('text=In Progress')
      )
    );
    
    const hasBuildingDeployment = await buildingDeployment.isVisible();
    
    if (hasBuildingDeployment) {
      console.log('🔄 發現正在進行的部署');
      
      // 等待一段時間看是否完成
      console.log('⏳ 等待部署完成...');
      await page.waitForTimeout(30000); // 等待30秒
      
      // 重新檢查狀態
      await page.reload();
      await page.waitForTimeout(3000);
      
      const stillBuilding = await buildingDeployment.isVisible();
      if (!stillBuilding) {
        console.log('✅ 部署已完成');
      } else {
        console.log('🔄 部署仍在進行中');
      }
      
      // 再次截圖
      await page.screenshot({ 
        path: `test-results/vercel-deployments-after-wait.png`,
        fullPage: true 
      });
    } else {
      console.log('ℹ️ 沒有發現正在進行的部署');
    }
    
    // 檢查最新提交是否已部署
    console.log('\n🔍 檢查最新提交是否已部署...');
    
    // 查找包含最新提交 hash 的部署
    const latestCommitHash = 'da62e65'; // 我們的最新提交
    const commitDeployment = page.locator(`text=${latestCommitHash}`);
    
    if (await commitDeployment.isVisible()) {
      console.log(`✅ 找到最新提交 ${latestCommitHash} 的部署`);
      
      // 檢查這個部署的狀態
      const commitDeploymentRow = commitDeployment.locator('..').locator('..');
      const commitIsSuccess = await commitDeploymentRow.locator('text=Ready').or(commitDeploymentRow.locator('text=Success')).isVisible();
      const commitIsFailed = await commitDeploymentRow.locator('text=Failed').or(commitDeploymentRow.locator('text=Error')).isVisible();
      const commitIsBuilding = await commitDeploymentRow.locator('text=Building').or(commitDeploymentRow.locator('text=Queued')).isVisible();
      
      if (commitIsSuccess) {
        console.log(`  ✅ 最新提交部署成功`);
      } else if (commitIsFailed) {
        console.log(`  ❌ 最新提交部署失敗`);
      } else if (commitIsBuilding) {
        console.log(`  🔄 最新提交正在部署`);
      } else {
        console.log(`  ❓ 最新提交部署狀態未知`);
      }
    } else {
      console.log(`⚠️ 未找到最新提交 ${latestCommitHash} 的部署`);
      console.log('💡 可能部署還沒有觸發，或者使用了不同的提交 hash');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/vercel-deployments-final.png`,
      fullPage: true 
    });
    
    console.log('\n📋 Vercel 部署狀態檢查完成');
  });

  test('檢查網站是否反映最新更改', async ({ page }) => {
    console.log('🔍 檢查網站是否反映最新更改...');
    
    // 設置手機視窗
    await page.setViewportSize({ width: 375, height: 812 });
    
    // 訪問主頁
    await page.goto('https://edu-create.vercel.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📱 已訪問主頁');
    
    // 打開手機版選單
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], button:has-text("☰"), .md\\:hidden button').first();
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(2000);
      
      console.log('🔓 已打開手機版選單');
      
      // 截圖當前狀態
      await page.screenshot({ 
        path: `test-results/current-mobile-menu-state.png`,
        fullPage: true 
      });
      
      // 檢查是否有用戶登入
      const loginButton = page.locator('.md\\:hidden').locator('text=登入');
      const isLoggedOut = await loginButton.isVisible();
      
      if (isLoggedOut) {
        console.log('ℹ️ 用戶未登入，無法檢查用戶管理功能');
        console.log('💡 用戶管理功能只在登入後顯示');
      } else {
        console.log('✅ 用戶已登入，檢查用戶管理功能...');
        
        // 檢查用戶管理功能
        const userFunctions = [
          '編輯個人資訊', '管理付款', '語言和位置', '社區', '聯繫方式', '價格計劃'
        ];
        
        let foundFunctions = 0;
        for (const func of userFunctions) {
          const functionItem = page.locator(`.md\\:hidden`).locator(`text=${func}`);
          if (await functionItem.isVisible()) {
            console.log(`  ✅ 找到: ${func}`);
            foundFunctions++;
          } else {
            console.log(`  ❌ 缺少: ${func}`);
          }
        }
        
        console.log(`用戶管理功能: ${foundFunctions}/${userFunctions.length}`);
        
        if (foundFunctions > 0) {
          console.log('🎉 最新更改已生效！');
        } else {
          console.log('⚠️ 最新更改可能還沒有生效');
        }
      }
      
      // 檢查主要導航功能（這些應該總是可見的）
      const mainNavItems = ['首頁', '我的活動', '功能儀表板', '創建活動'];
      let foundMainItems = 0;
      
      for (const item of mainNavItems) {
        const navItem = page.locator(`.md\\:hidden`).locator(`text=${item}`);
        if (await navItem.isVisible()) {
          foundMainItems++;
        }
      }
      
      console.log(`主要導航功能: ${foundMainItems}/${mainNavItems.length}`);
      
      if (foundMainItems === mainNavItems.length) {
        console.log('✅ 網站基本功能正常');
      } else {
        console.log('⚠️ 網站可能有問題');
      }
    } else {
      console.log('❌ 未找到手機版選單按鈕');
    }
    
    console.log('\n📋 網站狀態檢查完成');
  });
});
