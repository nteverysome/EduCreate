import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 手機版 UI 兼容性測試
 * 
 * 測試新的手機版 UI 與現有測試的兼容性
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📱 手機版 UI 兼容性測試', () => {
  
  test('🔧 測試手機和桌面模式下的 GEPT 功能兼容性', async ({ page }) => {
    console.log('🔧 開始測試手機版 UI 兼容性...');
    
    // 1. 測試桌面模式
    console.log('\n🖥️ 桌面模式測試:');
    await page.setViewportSize({ width: 1024, height: 768 });
    
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 桌面模式下測試 GEPT 選擇器
    const desktopGeptSelector = page.locator('[data-testid="gept-selector"]').first();
    const desktopGeptVisible = await desktopGeptSelector.isVisible();
    
    console.log(`  - 桌面版 GEPT 選擇器可見: ${desktopGeptVisible ? '是' : '否'}`);
    
    if (desktopGeptVisible) {
      const desktopButtons = desktopGeptSelector.locator('button');
      const desktopButtonCount = await desktopButtons.count();
      console.log(`  - 桌面版 GEPT 按鈕數量: ${desktopButtonCount}`);
      
      // 測試桌面版按鈕點擊
      let desktopClickSuccess = 0;
      for (let i = 0; i < desktopButtonCount; i++) {
        try {
          await desktopButtons.nth(i).click();
          await page.waitForTimeout(500);
          desktopClickSuccess++;
        } catch (error) {
          console.log(`    ❌ 桌面版按鈕 ${i + 1} 點擊失敗`);
        }
      }
      console.log(`  - 桌面版按鈕點擊成功率: ${desktopClickSuccess}/${desktopButtonCount}`);
    }
    
    // 2. 測試手機模式
    console.log('\n📱 手機模式測試:');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    // 檢查手機模式下的元素狀態
    const mobileAnalysis = await page.evaluate(() => {
      const desktopGept = document.querySelector('.gept-selector.hidden.md\\:flex');
      const mobileGeptDisplay = document.querySelector('.md\\:hidden .text-blue-800');
      const moreOptionsBtn = document.querySelector('button[title="更多選項"]');
      
      return {
        desktopGeptHidden: desktopGept ? window.getComputedStyle(desktopGept).display === 'none' : true,
        mobileGeptVisible: mobileGeptDisplay ? window.getComputedStyle(mobileGeptDisplay).display !== 'none' : false,
        moreOptionsBtnVisible: moreOptionsBtn ? window.getComputedStyle(moreOptionsBtn).display !== 'none' : false
      };
    });
    
    console.log(`  - 桌面版 GEPT 選擇器隱藏: ${mobileAnalysis.desktopGeptHidden ? '是' : '否'}`);
    console.log(`  - 手機版等級顯示可見: ${mobileAnalysis.mobileGeptVisible ? '是' : '否'}`);
    console.log(`  - 更多選項按鈕可見: ${mobileAnalysis.moreOptionsBtnVisible ? '是' : '否'}`);
    
    // 3. 測試手機模式下的 GEPT 功能（通過彈出選單）
    let mobileGeptFunctional = false;
    if (mobileAnalysis.moreOptionsBtnVisible) {
      console.log('\n🎯 手機版 GEPT 功能測試（彈出選單）:');
      
      try {
        // 點擊更多選項按鈕
        const moreOptionsButton = page.locator('button[title="更多選項"]');
        await moreOptionsButton.click();
        await page.waitForTimeout(1000);
        
        // 檢查彈出選單
        const popup = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
        const popupVisible = await popup.isVisible();
        
        if (popupVisible) {
          console.log('  ✅ 彈出選單顯示成功');
          
          // 測試彈出選單中的 GEPT 按鈕
          const popupGeptSelector = page.locator('[data-testid="gept-selector"]');
          const popupButtons = popupGeptSelector.locator('button');
          const popupButtonCount = await popupButtons.count();
          
          console.log(`  - 彈出選單 GEPT 按鈕數量: ${popupButtonCount}`);
          
          if (popupButtonCount > 0) {
            // 測試第一個按鈕
            const firstButtonText = await popupButtons.first().textContent();
            await popupButtons.first().click();
            await page.waitForTimeout(1000);
            
            // 檢查選單是否關閉
            const popupClosed = !(await popup.isVisible());
            
            if (popupClosed) {
              console.log(`  ✅ ${firstButtonText}: 點擊成功，選單關閉`);
              mobileGeptFunctional = true;
            } else {
              console.log(`  ⚠️ ${firstButtonText}: 點擊成功但選單未關閉`);
            }
          }
        } else {
          console.log('  ❌ 彈出選單未顯示');
        }
      } catch (error) {
        console.log(`  ❌ 手機版 GEPT 功能測試失敗: ${error.message}`);
      }
    }
    
    // 4. 創建適應性測試函數
    const testGeptFunctionality = async (viewport: { width: number, height: number }) => {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      const isMobile = viewport.width <= 640;
      
      if (isMobile) {
        // 手機模式：通過彈出選單測試
        try {
          const moreOptionsButton = page.locator('button[title="更多選項"]');
          await moreOptionsButton.click();
          await page.waitForTimeout(500);
          
          const popupGeptSelector = page.locator('[data-testid="gept-selector"]');
          const buttons = popupGeptSelector.locator('button');
          const buttonCount = await buttons.count();
          
          if (buttonCount > 0) {
            await buttons.first().click();
            await page.waitForTimeout(500);
            return true;
          }
        } catch (error) {
          return false;
        }
      } else {
        // 桌面模式：直接測試
        try {
          const desktopGeptSelector = page.locator('[data-testid="gept-selector"]').first();
          const buttons = desktopGeptSelector.locator('button');
          const buttonCount = await buttons.count();
          
          if (buttonCount > 0) {
            await buttons.first().click();
            await page.waitForTimeout(500);
            return true;
          }
        } catch (error) {
          return false;
        }
      }
      return false;
    };
    
    // 5. 測試多種視窗大小
    console.log('\n📐 多視窗大小兼容性測試:');
    
    const viewports = [
      { name: '手機豎屏', width: 390, height: 844 },
      { name: '手機橫屏', width: 844, height: 390 },
      { name: '平板豎屏', width: 768, height: 1024 },
      { name: '平板橫屏', width: 1024, height: 768 },
      { name: '桌面小屏', width: 1280, height: 720 },
      { name: '桌面大屏', width: 1920, height: 1080 }
    ];
    
    let compatibilityResults = [];
    for (const viewport of viewports) {
      const success = await testGeptFunctionality(viewport);
      compatibilityResults.push({
        name: viewport.name,
        size: `${viewport.width}×${viewport.height}`,
        success
      });
      console.log(`  ${success ? '✅' : '❌'} ${viewport.name} (${viewport.width}×${viewport.height}): ${success ? '功能正常' : '功能異常'}`);
    }
    
    // 6. 計算兼容性評分
    const successfulViewports = compatibilityResults.filter(r => r.success).length;
    const compatibilityScore = (successfulViewports / compatibilityResults.length * 100).toFixed(1);
    
    console.log('\n🎯 兼容性測試總評:');
    console.log(`  - 桌面模式 GEPT 功能: ${desktopGeptVisible ? '✅ 正常' : '❌ 異常'}`);
    console.log(`  - 手機模式 UI 改進: ${mobileAnalysis.moreOptionsBtnVisible ? '✅ 正常' : '❌ 異常'}`);
    console.log(`  - 手機模式 GEPT 功能: ${mobileGeptFunctional ? '✅ 正常' : '❌ 異常'}`);
    console.log(`  - 多視窗兼容性: ${successfulViewports}/${compatibilityResults.length} (${compatibilityScore}%)`);
    
    const overallCompatibility = [
      desktopGeptVisible,
      mobileAnalysis.moreOptionsBtnVisible,
      mobileGeptFunctional,
      parseFloat(compatibilityScore) >= 80
    ].filter(Boolean).length;
    
    const overallScore = (overallCompatibility / 4 * 100).toFixed(1);
    
    console.log(`  - 🏆 總體兼容性評分: ${overallScore}% (${overallCompatibility}/4)`);
    
    if (parseFloat(overallScore) >= 90) {
      console.log('🎉 手機版 UI 兼容性完美！');
    } else if (parseFloat(overallScore) >= 75) {
      console.log('✅ 手機版 UI 兼容性優秀！');
    } else if (parseFloat(overallScore) >= 60) {
      console.log('⚡ 手機版 UI 兼容性良好！');
    } else {
      console.log('⚠️ 手機版 UI 兼容性需要改進');
    }
    
    console.log('\n✅ 兼容性測試完成');
    
    return {
      desktopGeptVisible,
      mobileAnalysis,
      mobileGeptFunctional,
      compatibilityResults,
      compatibilityScore: parseFloat(compatibilityScore),
      overallScore: parseFloat(overallScore)
    };
  });
});
