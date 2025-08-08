import { test, expect } from '@playwright/test';

/**
 * 📱 EduCreate 手機版 UI 改進測試
 * 
 * 測試手機模式下 GEPT 選擇器重疊問題的解決方案
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📱 手機版 UI 改進測試', () => {
  
  test('🔧 測試手機版 GEPT 選擇器重疊問題解決', async ({ page }) => {
    console.log('🔧 開始測試手機版 UI 改進效果...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到本地改進版本
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始手機版 UI 分析...');
    
    // 1. 截圖：手機版 UI 改進後的狀態
    await page.screenshot({ 
      path: 'test-results/mobile-ui-improvement-after.png',
      fullPage: false 
    });
    console.log('📸 截圖：手機版 UI 改進後狀態');
    
    // 2. 檢查手機模式下的元素可見性
    const mobileUIAnalysis = await page.evaluate(() => {
      // 檢查桌面版 GEPT 選擇器是否隱藏
      const desktopGeptSelector = document.querySelector('.gept-selector.hidden.md\\:flex');
      const desktopGeptVisible = desktopGeptSelector ? window.getComputedStyle(desktopGeptSelector).display !== 'none' : false;
      
      // 檢查手機版當前等級顯示
      const mobileGeptDisplay = document.querySelector('.md\\:hidden .text-blue-800');
      const mobileGeptVisible = mobileGeptDisplay ? window.getComputedStyle(mobileGeptDisplay).display !== 'none' : false;
      
      // 檢查更多選項按鈕
      const moreOptionsButton = document.querySelector('button[title="更多選項"]');
      const moreOptionsVisible = moreOptionsButton ? window.getComputedStyle(moreOptionsButton).display !== 'none' : false;
      
      // 檢查控制按鈕
      const controlButtons = document.querySelectorAll('.flex-shrink-0 button');
      const controlButtonsInfo = Array.from(controlButtons).map((btn, index) => {
        const rect = btn.getBoundingClientRect();
        return {
          index: index + 1,
          text: btn.textContent?.trim() || btn.getAttribute('title') || `按鈕 ${index + 1}`,
          visible: window.getComputedStyle(btn).display !== 'none',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
      
      // 檢查是否還有重疊
      let hasOverlaps = false;
      for (let i = 0; i < controlButtonsInfo.length - 1; i++) {
        for (let j = i + 1; j < controlButtonsInfo.length; j++) {
          const btn1 = controlButtonsInfo[i];
          const btn2 = controlButtonsInfo[j];
          if (btn1.visible && btn2.visible) {
            const horizontalOverlap = btn1.right > btn2.left && btn1.left < btn2.right;
            if (horizontalOverlap) {
              hasOverlaps = true;
              break;
            }
          }
        }
        if (hasOverlaps) break;
      }
      
      return {
        desktopGeptVisible,
        mobileGeptVisible,
        moreOptionsVisible,
        controlButtonsInfo,
        hasOverlaps,
        totalVisibleButtons: controlButtonsInfo.filter(btn => btn.visible).length
      };
    });
    
    console.log('📊 手機版 UI 分析:');
    console.log(`  - 桌面版 GEPT 選擇器可見: ${mobileUIAnalysis.desktopGeptVisible ? '是' : '否'}`);
    console.log(`  - 手機版 GEPT 顯示可見: ${mobileUIAnalysis.mobileGeptVisible ? '是' : '否'}`);
    console.log(`  - 更多選項按鈕可見: ${mobileUIAnalysis.moreOptionsVisible ? '是' : '否'}`);
    console.log(`  - 控制按鈕總數: ${mobileUIAnalysis.totalVisibleButtons}`);
    console.log(`  - 是否還有重疊: ${mobileUIAnalysis.hasOverlaps ? '是' : '否'}`);
    
    console.log('  控制按鈕詳情:');
    mobileUIAnalysis.controlButtonsInfo.forEach(btn => {
      if (btn.visible) {
        console.log(`    ${btn.text}: ${btn.width}×${btn.height}px at (${btn.left}, ${btn.right})`);
      }
    });
    
    // 3. 測試更多選項按鈕功能
    console.log('\n🧪 更多選項按鈕功能測試:');
    
    const moreOptionsButton = page.locator('button[title="更多選項"]');
    const moreOptionsVisible = await moreOptionsButton.isVisible();
    
    let moreOptionsWorking = false;
    if (moreOptionsVisible) {
      try {
        await moreOptionsButton.click();
        await page.waitForTimeout(1000);
        
        // 檢查彈出選單是否出現
        const popup = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
        const popupVisible = await popup.isVisible();
        
        if (popupVisible) {
          console.log('  ✅ 更多選項按鈕: 點擊成功，彈出選單顯示');
          
          // 截圖：彈出選單狀態
          await page.screenshot({ 
            path: 'test-results/mobile-gept-popup-menu.png',
            fullPage: false 
          });
          console.log('  📸 截圖：GEPT 彈出選單');
          
          moreOptionsWorking = true;
        } else {
          console.log('  ❌ 更多選項按鈕: 點擊後彈出選單未顯示');
        }
      } catch (error) {
        console.log(`  ❌ 更多選項按鈕: 點擊失敗 - ${error.message}`);
      }
    } else {
      console.log('  ❌ 更多選項按鈕: 不可見');
    }
    
    // 4. 測試彈出選單中的 GEPT 功能
    let geptPopupFunctional = false;
    if (moreOptionsWorking) {
      console.log('\n🎯 彈出選單 GEPT 功能測試:');
      
      try {
        const geptButtons = page.locator('[data-testid="gept-selector"] button');
        const buttonCount = await geptButtons.count();
        
        console.log(`  - 彈出選單中 GEPT 按鈕數量: ${buttonCount}`);
        
        if (buttonCount > 0) {
          // 測試第一個按鈕
          const firstButtonText = await geptButtons.first().textContent();
          await geptButtons.first().click();
          await page.waitForTimeout(1000);
          
          // 檢查選單是否關閉
          const popupStillVisible = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').isVisible();
          
          if (!popupStillVisible) {
            console.log(`  ✅ ${firstButtonText}: 點擊成功，選單自動關閉`);
            geptPopupFunctional = true;
          } else {
            console.log(`  ⚠️ ${firstButtonText}: 點擊成功但選單未關閉`);
          }
        }
      } catch (error) {
        console.log(`  ❌ 彈出選單 GEPT 測試失敗: ${error.message}`);
      }
    }
    
    // 5. 檢查手機版當前等級顯示更新
    const currentLevelDisplay = await page.evaluate(() => {
      const levelElement = document.querySelector('.md\\:hidden .text-blue-800');
      return levelElement ? levelElement.textContent?.trim() : null;
    });
    
    console.log(`\n📱 當前等級顯示: ${currentLevelDisplay || '未找到'}`);
    
    // 6. 測試桌面模式兼容性
    console.log('\n🖥️ 桌面模式兼容性測試:');
    
    // 切換到桌面視窗大小
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(1000);
    
    const desktopCompatibility = await page.evaluate(() => {
      const desktopGeptSelector = document.querySelector('.gept-selector.hidden.md\\:flex');
      const mobileGeptDisplay = document.querySelector('.md\\:hidden');
      const moreOptionsButton = document.querySelector('button[title="更多選項"]');
      
      return {
        desktopGeptVisible: desktopGeptSelector ? window.getComputedStyle(desktopGeptSelector).display !== 'none' : false,
        mobileGeptHidden: mobileGeptDisplay ? window.getComputedStyle(mobileGeptDisplay).display === 'none' : true,
        moreOptionsHidden: moreOptionsButton ? window.getComputedStyle(moreOptionsButton).display === 'none' : true
      };
    });
    
    console.log(`  - 桌面版 GEPT 選擇器顯示: ${desktopCompatibility.desktopGeptVisible ? '是' : '否'}`);
    console.log(`  - 手機版 GEPT 顯示隱藏: ${desktopCompatibility.mobileGeptHidden ? '是' : '否'}`);
    console.log(`  - 更多選項按鈕隱藏: ${desktopCompatibility.moreOptionsHidden ? '是' : '否'}`);
    
    // 截圖：桌面模式
    await page.screenshot({ 
      path: 'test-results/desktop-mode-compatibility.png',
      fullPage: false 
    });
    console.log('  📸 截圖：桌面模式兼容性');
    
    // 7. 整體評估
    const uiImprovementScore = [
      !mobileUIAnalysis.desktopGeptVisible, // 手機模式下桌面版 GEPT 隱藏
      mobileUIAnalysis.mobileGeptVisible, // 手機版等級顯示可見
      mobileUIAnalysis.moreOptionsVisible, // 更多選項按鈕可見
      !mobileUIAnalysis.hasOverlaps, // 無重疊問題
      moreOptionsWorking, // 更多選項功能正常
      geptPopupFunctional, // 彈出選單功能正常
      desktopCompatibility.desktopGeptVisible, // 桌面模式正常
      desktopCompatibility.moreOptionsHidden // 桌面模式下手機按鈕隱藏
    ].filter(Boolean).length;
    
    const totalCriteria = 8;
    const improvementPercentage = (uiImprovementScore / totalCriteria * 100).toFixed(1);
    
    console.log('\n🎯 手機版 UI 改進總評:');
    console.log(`  - 手機模式 GEPT 隱藏: ${!mobileUIAnalysis.desktopGeptVisible ? '✅' : '❌'}`);
    console.log(`  - 手機版等級顯示: ${mobileUIAnalysis.mobileGeptVisible ? '✅' : '❌'}`);
    console.log(`  - 更多選項按鈕: ${mobileUIAnalysis.moreOptionsVisible ? '✅' : '❌'}`);
    console.log(`  - 重疊問題解決: ${!mobileUIAnalysis.hasOverlaps ? '✅' : '❌'}`);
    console.log(`  - 更多選項功能: ${moreOptionsWorking ? '✅' : '❌'}`);
    console.log(`  - 彈出選單功能: ${geptPopupFunctional ? '✅' : '❌'}`);
    console.log(`  - 桌面模式兼容: ${desktopCompatibility.desktopGeptVisible ? '✅' : '❌'}`);
    console.log(`  - 響應式切換: ${desktopCompatibility.moreOptionsHidden ? '✅' : '❌'}`);
    console.log(`  - 🏆 總體改進評分: ${improvementPercentage}% (${uiImprovementScore}/${totalCriteria})`);
    
    if (parseFloat(improvementPercentage) >= 90) {
      console.log('🎉 手機版 UI 改進完美成功！');
    } else if (parseFloat(improvementPercentage) >= 75) {
      console.log('✅ 手機版 UI 改進表現優秀！');
    } else if (parseFloat(improvementPercentage) >= 60) {
      console.log('⚡ 手機版 UI 改進良好，需微調');
    } else {
      console.log('⚠️ 手機版 UI 改進需要進一步調整');
    }
    
    console.log('\n✅ 手機版 UI 改進測試完成');
    
    return {
      mobileUIAnalysis,
      moreOptionsWorking,
      geptPopupFunctional,
      desktopCompatibility,
      improvementPercentage: parseFloat(improvementPercentage)
    };
  });
});
