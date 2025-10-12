import { test, expect } from '@playwright/test';

test.describe('Vercel 部署頁面即時互動', () => {
  
  test('與 Vercel 部署頁面進行即時互動和部署觸發', async ({ page }) => {
    console.log('🚀 開始與 Vercel 部署頁面進行即時互動...');
    
    // 設置較長的超時時間
    test.setTimeout(300000); // 5分鐘
    
    // 訪問 Vercel 部署頁面
    await page.goto('https://vercel.com/minamisums-projects/edu-create/deployments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('📄 已訪問 Vercel 部署頁面');
    
    // 截圖記錄初始狀態
    await page.screenshot({ 
      path: `test-results/vercel-initial-page.png`,
      fullPage: true 
    });
    
    // 檢查是否需要登入
    console.log('🔐 檢查登入狀態...');
    
    const signInButton = page.locator('text=Sign In').or(
      page.locator('text=Login').or(
        page.locator('text=Log in').or(
          page.locator('[data-testid="login-button"]')
        )
      )
    );
    
    const isLoginRequired = await signInButton.isVisible();
    
    if (isLoginRequired) {
      console.log('⚠️ 需要登入 Vercel 帳戶');
      console.log('🔑 嘗試尋找登入選項...');
      
      // 截圖登入頁面
      await page.screenshot({ 
        path: `test-results/vercel-login-required.png`,
        fullPage: true 
      });
      
      // 檢查是否有 GitHub 登入選項
      const githubLoginButton = page.locator('text=Continue with GitHub').or(
        page.locator('text=Sign in with GitHub').or(
          page.locator('[data-testid="github-login"]')
        )
      );
      
      if (await githubLoginButton.isVisible()) {
        console.log('✅ 找到 GitHub 登入選項');
        console.log('💡 注意：自動化測試無法完成實際登入流程');
        console.log('📝 建議：手動登入後重新運行測試');
      }
      
      // 嘗試查找其他登入方式
      const emailInput = page.locator('input[type="email"]').or(
        page.locator('input[placeholder*="email"]')
      );
      
      if (await emailInput.isVisible()) {
        console.log('📧 找到郵箱登入表單');
        console.log('💡 可以嘗試使用郵箱登入（需要提供憑證）');
      }
      
      return; // 無法繼續，需要登入
    }
    
    console.log('✅ 已登入或無需登入');
    
    // 查找部署列表
    console.log('🔍 查找部署列表...');
    
    // 等待頁面完全載入
    await page.waitForTimeout(3000);
    
    // 嘗試多種選擇器來找到部署項目
    const deploymentSelectors = [
      '[data-testid="deployment-item"]',
      '.deployment-item',
      '.deployment-row',
      '[data-testid="deployment"]',
      '.deployment',
      'tr[data-testid*="deployment"]',
      'div[data-testid*="deployment"]'
    ];
    
    let deploymentItems = null;
    let deploymentCount = 0;
    
    for (const selector of deploymentSelectors) {
      deploymentItems = page.locator(selector);
      deploymentCount = await deploymentItems.count();
      
      if (deploymentCount > 0) {
        console.log(`✅ 使用選擇器 "${selector}" 找到 ${deploymentCount} 個部署項目`);
        break;
      }
    }
    
    if (deploymentCount === 0) {
      console.log('⚠️ 未找到部署項目，嘗試查找其他元素...');
      
      // 查找可能的部署相關文字
      const deploymentTexts = [
        'Ready', 'Building', 'Failed', 'Queued', 'Canceled',
        'Production', 'Preview', 'Development'
      ];
      
      for (const text of deploymentTexts) {
        const textElement = page.locator(`text=${text}`);
        const textCount = await textElement.count();
        if (textCount > 0) {
          console.log(`找到 ${textCount} 個包含 "${text}" 的元素`);
        }
      }
      
      // 截圖當前頁面狀態
      await page.screenshot({ 
        path: `test-results/vercel-no-deployments-found.png`,
        fullPage: true 
      });
      
      // 嘗試查找 "Deploy" 或 "Redeploy" 按鈕
      console.log('🔍 查找部署按鈕...');
      
      const deployButtons = page.locator('text=Deploy').or(
        page.locator('text=Redeploy').or(
          page.locator('text=New Deployment').or(
            page.locator('[data-testid*="deploy"]')
          )
        )
      );
      
      const deployButtonCount = await deployButtons.count();
      
      if (deployButtonCount > 0) {
        console.log(`✅ 找到 ${deployButtonCount} 個部署按鈕`);
        
        // 截圖部署按鈕
        await deployButtons.first().screenshot({ 
          path: `test-results/vercel-deploy-button.png`
        });
        
        console.log('🚀 嘗試點擊部署按鈕...');
        
        try {
          await deployButtons.first().click();
          await page.waitForTimeout(3000);
          
          console.log('✅ 成功點擊部署按鈕');
          
          // 截圖點擊後的狀態
          await page.screenshot({ 
            path: `test-results/vercel-after-deploy-click.png`,
            fullPage: true 
          });
          
          // 查找確認對話框或部署選項
          const confirmButton = page.locator('text=Confirm').or(
            page.locator('text=Deploy').or(
              page.locator('text=Start Deployment')
            )
          );
          
          if (await confirmButton.isVisible()) {
            console.log('✅ 找到確認按鈕');
            await confirmButton.click();
            console.log('🚀 已確認部署');
            
            // 等待部署開始
            await page.waitForTimeout(5000);
            
            // 截圖部署開始後的狀態
            await page.screenshot({ 
              path: `test-results/vercel-deployment-started.png`,
              fullPage: true 
            });
          }
          
        } catch (error) {
          console.log(`❌ 點擊部署按鈕失敗: ${error}`);
        }
      } else {
        console.log('❌ 未找到部署按鈕');
      }
    } else {
      // 有部署項目，檢查狀態
      console.log('📊 檢查部署項目狀態...');
      
      for (let i = 0; i < Math.min(5, deploymentCount); i++) {
        const deployment = deploymentItems.nth(i);
        
        try {
          const deploymentText = await deployment.textContent();
          console.log(`部署 ${i + 1}: ${deploymentText?.substring(0, 150)}...`);
          
          // 檢查狀態
          const isReady = await deployment.locator('text=Ready').isVisible();
          const isBuilding = await deployment.locator('text=Building').isVisible();
          const isFailed = await deployment.locator('text=Failed').isVisible();
          const isQueued = await deployment.locator('text=Queued').isVisible();
          
          let status = '未知';
          if (isReady) status = '✅ 成功';
          else if (isBuilding) status = '🔄 構建中';
          else if (isFailed) status = '❌ 失敗';
          else if (isQueued) status = '⏳ 排隊中';
          
          console.log(`  狀態: ${status}`);
          
          // 檢查是否包含我們的提交
          const hasOurCommit = deploymentText?.includes('da62e65') || 
                              deploymentText?.includes('統一手機版和桌面版用戶選單功能');
          
          if (hasOurCommit) {
            console.log(`  🎯 這是我們的提交！`);
            
            // 截圖這個部署項目
            await deployment.screenshot({ 
              path: `test-results/vercel-our-deployment-${i}.png`
            });
          }
          
        } catch (error) {
          console.log(`❌ 檢查部署 ${i + 1} 時出錯: ${error}`);
        }
      }
    }
    
    // 查找最新提交的部署
    console.log('\n🔍 查找最新提交 da62e65 的部署...');
    
    const commitHash = 'da62e65';
    const commitDeployment = page.locator(`text=${commitHash}`);
    
    if (await commitDeployment.isVisible()) {
      console.log(`✅ 找到提交 ${commitHash} 的部署`);
      
      // 截圖這個部署
      await commitDeployment.screenshot({ 
        path: `test-results/vercel-commit-deployment.png`
      });
      
      // 檢查狀態
      const parentRow = commitDeployment.locator('..').locator('..');
      const isReady = await parentRow.locator('text=Ready').isVisible();
      const isBuilding = await parentRow.locator('text=Building').isVisible();
      const isFailed = await parentRow.locator('text=Failed').isVisible();
      
      if (isReady) {
        console.log('🎉 最新提交已成功部署！');
      } else if (isBuilding) {
        console.log('🔄 最新提交正在部署中...');
        
        // 等待部署完成
        console.log('⏳ 等待部署完成...');
        
        for (let i = 0; i < 12; i++) { // 等待最多6分鐘
          await page.waitForTimeout(30000); // 每30秒檢查一次
          await page.reload();
          await page.waitForTimeout(3000);
          
          const stillBuilding = await parentRow.locator('text=Building').isVisible();
          const nowReady = await parentRow.locator('text=Ready').isVisible();
          const nowFailed = await parentRow.locator('text=Failed').isVisible();
          
          if (nowReady) {
            console.log('🎉 部署完成！');
            break;
          } else if (nowFailed) {
            console.log('❌ 部署失敗');
            break;
          } else if (!stillBuilding) {
            console.log('❓ 部署狀態改變，但不是預期的狀態');
            break;
          }
          
          console.log(`⏳ 仍在構建中... (${i + 1}/12)`);
        }
      } else if (isFailed) {
        console.log('❌ 最新提交部署失敗');
      }
    } else {
      console.log(`⚠️ 未找到提交 ${commitHash} 的部署`);
      console.log('💡 可能需要手動觸發部署');
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: `test-results/vercel-final-state.png`,
      fullPage: true 
    });
    
    console.log('\n📋 Vercel 部署頁面互動完成');
  });
});
