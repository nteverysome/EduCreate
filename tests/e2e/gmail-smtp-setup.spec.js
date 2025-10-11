const { test, expect } = require('@playwright/test');

test.describe('Gmail SMTP 設定自動化', () => {
  test('Gmail 帳戶設定指導', async ({ page }) => {
    console.log('🚀 開始 Gmail SMTP 設定流程');
    
    // 1. 前往 Google 帳戶管理頁面
    console.log('📧 步驟 1: 前往 Google 帳戶管理');
    await page.goto('https://myaccount.google.com/');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 截圖記錄初始狀態
    await page.screenshot({ 
      path: 'gmail-setup-01-account-home.png',
      fullPage: true 
    });
    
    console.log('✅ Google 帳戶頁面已載入');
    
    // 2. 導航到安全性設定
    console.log('🔒 步驟 2: 前往安全性設定');
    
    // 尋找安全性連結
    const securityLink = page.locator('text=安全性').or(page.locator('text=Security')).first();
    
    if (await securityLink.isVisible()) {
      await securityLink.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'gmail-setup-02-security-page.png',
        fullPage: true 
      });
      
      console.log('✅ 安全性頁面已載入');
    } else {
      console.log('⚠️ 需要手動點擊安全性選項');
    }
    
    // 3. 檢查兩步驟驗證狀態
    console.log('🔐 步驟 3: 檢查兩步驟驗證');
    
    const twoFactorSection = page.locator('text=兩步驟驗證').or(page.locator('text=2-Step Verification'));
    
    if (await twoFactorSection.isVisible()) {
      await page.screenshot({ 
        path: 'gmail-setup-03-two-factor-section.png',
        fullPage: true 
      });
      
      // 點擊兩步驟驗證
      await twoFactorSection.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'gmail-setup-04-two-factor-page.png',
        fullPage: true 
      });
      
      console.log('✅ 兩步驟驗證頁面已載入');
    }
    
    // 4. 尋找應用程式密碼選項
    console.log('🔑 步驟 4: 尋找應用程式密碼');
    
    const appPasswordLink = page.locator('text=應用程式密碼').or(page.locator('text=App passwords'));
    
    if (await appPasswordLink.isVisible()) {
      await appPasswordLink.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'gmail-setup-05-app-passwords.png',
        fullPage: true 
      });
      
      console.log('✅ 應用程式密碼頁面已載入');
    } else {
      console.log('⚠️ 應用程式密碼選項不可見，可能需要先啟用兩步驟驗證');
    }
    
    // 5. 生成設定指導
    console.log('📋 生成設定指導文檔');
    
    const setupInstructions = {
      step1: '前往 Google 帳戶管理 (https://myaccount.google.com/)',
      step2: '點擊左側選單的「安全性」',
      step3: '找到「兩步驟驗證」並確保已啟用',
      step4: '在兩步驟驗證頁面找到「應用程式密碼」',
      step5: '選擇「郵件」應用程式類型',
      step6: '選擇「其他」裝置類型，輸入「EduCreate SMTP」',
      step7: '複製生成的 16 位數密碼',
      step8: '更新 .env 文件中的郵件配置'
    };
    
    console.log('📝 設定步驟:', JSON.stringify(setupInstructions, null, 2));
    
    // 最終截圖
    await page.screenshot({ 
      path: 'gmail-setup-final.png',
      fullPage: true 
    });
    
    console.log('🎉 Gmail SMTP 設定指導完成！');
  });
  
  test('生產環境配置檢查', async ({ page }) => {
    console.log('🌐 檢查生產環境配置');
    
    // 前往 Vercel 儀表板
    await page.goto('https://vercel.com/dashboard');
    
    // 等待載入
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'vercel-dashboard.png',
      fullPage: true 
    });
    
    console.log('📊 Vercel 儀表板已載入');
    console.log('🔧 需要在專案設定中添加環境變數：');
    console.log('   - EMAIL_SERVER_USER');
    console.log('   - EMAIL_SERVER_PASSWORD');
    console.log('   - EMAIL_FROM');
    
    // 尋找 EduCreate 專案
    const projectLink = page.locator('text=EduCreate').or(page.locator('text=edu-create'));
    
    if (await projectLink.isVisible()) {
      console.log('✅ 找到 EduCreate 專案');
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'vercel-project-page.png',
        fullPage: true 
      });
      
      // 尋找設定選項
      const settingsLink = page.locator('text=Settings').or(page.locator('text=設定'));
      
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ 
          path: 'vercel-settings.png',
          fullPage: true 
        });
        
        console.log('⚙️ 專案設定頁面已載入');
      }
    }
    
    console.log('🎯 生產環境配置檢查完成');
  });
});
