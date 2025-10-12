import { test, expect } from '@playwright/test';

test.describe('Vercel 部署狀況檢查', () => {
  const vercelUrl = 'https://vercel.com/minamisums-projects/edu-create/deployments';
  
  test('檢查 Vercel 部署頁面並分析失敗原因', async ({ page }) => {
    console.log('🚀 開始檢查 Vercel 部署狀況...');
    
    // 導航到 Vercel 部署頁面
    await page.goto(vercelUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 截圖 - 初始頁面
    await page.screenshot({ 
      path: 'test-results/vercel-deployments-initial.png',
      fullPage: true 
    });
    
    console.log('📸 已截圖初始頁面');
    
    // 檢查是否需要登入
    const loginButton = page.locator('button:has-text("Log in"), a:has-text("Log in"), button:has-text("Continue with"), a:has-text("Sign Up")');
    const isLoginRequired = await loginButton.first().isVisible();
    
    if (isLoginRequired) {
      console.log('🔐 檢測到需要登入 Vercel');
      
      // 截圖登入頁面
      await page.screenshot({ 
        path: 'test-results/vercel-login-required.png',
        fullPage: true 
      });
      
      // 嘗試查找登入選項
      const emailButton = page.locator('button:has-text("Continue with Email"), input[type="email"]');
      const githubButton = page.locator('button:has-text("Continue with GitHub"), a:has-text("GitHub")');
      const googleButton = page.locator('button:has-text("Continue with Google"), a:has-text("Google")');
      
      console.log('🔍 可用的登入選項：');
      if (await emailButton.first().isVisible()) {
        console.log('  ✅ Email 登入可用');
      }
      if (await githubButton.first().isVisible()) {
        console.log('  ✅ GitHub 登入可用');
      }
      if (await googleButton.first().isVisible()) {
        console.log('  ✅ Google 登入可用');
      }
      
      // 記錄頁面內容以供分析
      const pageContent = await page.locator('body').textContent();
      console.log('📄 頁面內容摘要：', pageContent?.substring(0, 500) + '...');
      
      test.skip('需要登入才能查看部署狀況');
      return;
    }
    
    console.log('✅ 無需登入，繼續檢查部署狀況');
    
    // 等待部署列表載入
    await page.waitForTimeout(5000);
    
    // 查找部署狀態指示器
    const deploymentItems = page.locator('[data-testid*="deployment"], .deployment-item, [class*="deployment"]');
    const deploymentCount = await deploymentItems.count();
    
    console.log(`📊 找到 ${deploymentCount} 個部署項目`);
    
    if (deploymentCount > 0) {
      // 檢查最新部署的狀態
      const latestDeployment = deploymentItems.first();
      
      // 查找狀態指示器
      const statusElements = [
        'text=Failed', 'text=Error', 'text=Building', 'text=Ready', 'text=Success',
        '[data-testid*="status"]', '.status', '[class*="status"]',
        'text=失敗', 'text=錯誤', 'text=建置中', 'text=就緒', 'text=成功'
      ];
      
      for (const selector of statusElements) {
        const statusElement = page.locator(selector).first();
        if (await statusElement.isVisible()) {
          const statusText = await statusElement.textContent();
          console.log(`🎯 部署狀態：${statusText}`);
          break;
        }
      }
      
      // 截圖部署列表
      await page.screenshot({ 
        path: 'test-results/vercel-deployments-list.png',
        fullPage: true 
      });
      
      // 嘗試點擊最新部署查看詳情
      try {
        await latestDeployment.click();
        await page.waitForTimeout(3000);
        
        // 截圖部署詳情
        await page.screenshot({ 
          path: 'test-results/vercel-deployment-details.png',
          fullPage: true 
        });
        
        // 查找錯誤信息
        const errorSelectors = [
          'text=Error', 'text=Failed', '.error', '[class*="error"]',
          'text=錯誤', 'text=失敗', '[data-testid*="error"]'
        ];
        
        for (const selector of errorSelectors) {
          const errorElements = page.locator(selector);
          const errorCount = await errorElements.count();
          
          if (errorCount > 0) {
            console.log(`❌ 找到 ${errorCount} 個錯誤信息：`);
            
            for (let i = 0; i < Math.min(errorCount, 5); i++) {
              const errorText = await errorElements.nth(i).textContent();
              console.log(`  ${i + 1}. ${errorText}`);
            }
          }
        }
        
        // 查找建置日誌
        const logSelectors = [
          'text=Build Logs', 'text=Logs', '.logs', '[class*="log"]',
          'text=建置日誌', 'text=日誌', '[data-testid*="log"]'
        ];
        
        for (const selector of logSelectors) {
          const logElement = page.locator(selector).first();
          if (await logElement.isVisible()) {
            console.log('📋 找到建置日誌區域');
            
            try {
              await logElement.click();
              await page.waitForTimeout(2000);
              
              // 截圖日誌內容
              await page.screenshot({ 
                path: 'test-results/vercel-build-logs.png',
                fullPage: true 
              });
              
            } catch (error) {
              console.log('⚠️ 無法點擊日誌區域:', error);
            }
            break;
          }
        }
        
      } catch (error) {
        console.log('⚠️ 無法點擊部署項目:', error);
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'test-results/vercel-final-state.png',
      fullPage: true 
    });
    
    console.log('✅ Vercel 部署檢查完成');
  });

  test('嘗試訪問 EduCreate 網站檢查實際狀況', async ({ page }) => {
    console.log('🌐 檢查 EduCreate 網站實際狀況...');
    
    const siteUrls = [
      'https://edu-create.vercel.app',
      'https://edu-create.vercel.app/create/shimozurdo-game'
    ];
    
    for (const url of siteUrls) {
      console.log(`🔍 檢查 ${url}`);
      
      try {
        const response = await page.goto(url);
        const status = response?.status();
        
        console.log(`📊 HTTP 狀態碼: ${status}`);
        
        if (status && status >= 200 && status < 400) {
          console.log('✅ 網站可正常訪問');
          
          // 等待頁面載入
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          // 截圖
          const filename = url.replace(/[^a-zA-Z0-9]/g, '-');
          await page.screenshot({ 
            path: `test-results/site-check-${filename}.png`,
            fullPage: true 
          });
          
          // 檢查頁面內容
          const title = await page.title();
          const bodyText = await page.locator('body').textContent();
          
          console.log(`📄 頁面標題: ${title}`);
          console.log(`📝 頁面內容長度: ${bodyText?.length || 0} 字符`);
          
          // 檢查是否有錯誤信息
          const errorTexts = ['Error', '錯誤', 'Not Found', '404', '500', 'Internal Server Error'];
          const hasError = errorTexts.some(errorText => 
            title.includes(errorText) || bodyText?.includes(errorText)
          );
          
          if (hasError) {
            console.log('❌ 頁面包含錯誤信息');
          } else {
            console.log('✅ 頁面內容正常');
          }
          
        } else {
          console.log(`❌ 網站訪問異常，狀態碼: ${status}`);
          
          // 截圖錯誤頁面
          const filename = url.replace(/[^a-zA-Z0-9]/g, '-');
          await page.screenshot({ 
            path: `test-results/site-error-${filename}.png`,
            fullPage: true 
          });
        }
        
      } catch (error) {
        console.log(`❌ 訪問 ${url} 時發生錯誤:`, error);
      }
      
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ 網站狀況檢查完成');
  });
});
