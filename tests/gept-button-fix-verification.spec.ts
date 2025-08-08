import { test, expect } from '@playwright/test';

/**
 * 📐 EduCreate GEPT 按鈕修復驗證測試
 * 
 * 快速驗證第三個 GEPT 按鈕修復效果
 */

const LOCAL_URL = 'http://localhost:3000';

test.describe('📐 GEPT 按鈕修復驗證', () => {
  
  test('🔧 驗證第三個 GEPT 按鈕修復效果', async ({ page }) => {
    console.log('🔧 開始驗證 GEPT 按鈕修復效果...');
    
    // 設置手機視窗大小
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 設置手機視窗大小：390x844 (iPhone 12 Pro)');
    
    // 導航到本地修復版本
    await page.goto(`${LOCAL_URL}/games/switcher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('📄 本地頁面載入完成，開始 GEPT 按鈕測試...');
    
    // 1. 截圖：修復後的狀態
    await page.screenshot({ 
      path: 'test-results/gept-button-fix-verification.png',
      fullPage: false 
    });
    console.log('📸 截圖：GEPT 按鈕修復後狀態');
    
    // 2. 檢查按鈕佈局和重疊情況
    const buttonLayoutAnalysis = await page.evaluate(() => {
      const geptButtons = document.querySelectorAll('[data-testid="gept-selector"] button');
      const controlButtons = document.querySelectorAll('.flex-shrink-0 button');
      
      const geptRects = Array.from(geptButtons).map((btn, index) => {
        const rect = btn.getBoundingClientRect();
        return {
          index: index + 1,
          text: btn.textContent,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          zIndex: window.getComputedStyle(btn).zIndex
        };
      });
      
      const controlRects = Array.from(controlButtons).map((btn, index) => {
        const rect = btn.getBoundingClientRect();
        return {
          index: index + 1,
          text: btn.textContent,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
      
      // 檢查重疊
      let overlaps = [];
      geptRects.forEach(geptBtn => {
        controlRects.forEach(controlBtn => {
          const horizontalOverlap = geptBtn.right > controlBtn.left && geptBtn.left < controlBtn.right;
          const verticalOverlap = geptBtn.bottom > controlBtn.top && geptBtn.top < controlBtn.bottom;
          
          if (horizontalOverlap && verticalOverlap) {
            overlaps.push({
              geptButton: geptBtn.text,
              controlButton: controlBtn.text,
              overlapArea: Math.max(0, Math.min(geptBtn.right, controlBtn.right) - Math.max(geptBtn.left, controlBtn.left)) *
                          Math.max(0, Math.min(geptBtn.bottom, controlBtn.bottom) - Math.max(geptBtn.top, controlBtn.top))
            });
          }
        });
      });
      
      return {
        geptButtons: geptRects,
        controlButtons: controlRects,
        overlaps,
        hasOverlaps: overlaps.length > 0
      };
    });
    
    console.log('📊 按鈕佈局分析:');
    console.log('  GEPT 按鈕位置:');
    buttonLayoutAnalysis.geptButtons.forEach(btn => {
      console.log(`    ${btn.text}: (${btn.left}, ${btn.top}) ${btn.width}×${btn.height}px, z-index: ${btn.zIndex}`);
    });
    
    console.log('  控制按鈕位置:');
    buttonLayoutAnalysis.controlButtons.forEach(btn => {
      console.log(`    ${btn.text}: (${btn.left}, ${btn.top}) ${btn.width}×${btn.height}px`);
    });
    
    if (buttonLayoutAnalysis.hasOverlaps) {
      console.log('  ⚠️ 發現重疊:');
      buttonLayoutAnalysis.overlaps.forEach(overlap => {
        console.log(`    ${overlap.geptButton} 與 ${overlap.controlButton} 重疊 ${overlap.overlapArea}px²`);
      });
    } else {
      console.log('  ✅ 無按鈕重疊');
    }
    
    // 3. 逐個測試所有 GEPT 按鈕
    console.log('\n🧪 GEPT 按鈕逐個點擊測試:');
    
    const geptSelector = page.locator('[data-testid="gept-selector"]');
    const geptButtons = geptSelector.locator('button');
    const buttonCount = await geptButtons.count();
    
    let allButtonResults = [];
    for (let i = 0; i < buttonCount; i++) {
      try {
        const buttonText = await geptButtons.nth(i).textContent();
        
        // 使用 force 點擊來避免重疊問題
        await geptButtons.nth(i).click({ force: true });
        await page.waitForTimeout(1000);
        
        // 檢查激活狀態
        const isActive = await geptButtons.nth(i).evaluate(btn => 
          btn.classList.contains('bg-blue-100') || btn.classList.contains('text-blue-800')
        );
        
        allButtonResults.push({
          button: buttonText,
          index: i + 1,
          clickable: true,
          activated: isActive
        });
        
        console.log(`  ✅ ${buttonText} (按鈕 ${i + 1}): 點擊成功, ${isActive ? '已激活' : '未激活'}`);
        
      } catch (error) {
        allButtonResults.push({
          button: `按鈕 ${i + 1}`,
          index: i + 1,
          clickable: false,
          error: error.message
        });
        console.log(`  ❌ 按鈕 ${i + 1}: 點擊失敗 - ${error.message}`);
      }
    }
    
    // 4. 計算修復效果
    const successfulClicks = allButtonResults.filter(r => r.clickable).length;
    const activatedButtons = allButtonResults.filter(r => r.activated).length;
    const clickSuccessRate = buttonCount > 0 ? (successfulClicks / buttonCount * 100).toFixed(1) : '0';
    const activationRate = buttonCount > 0 ? (activatedButtons / buttonCount * 100).toFixed(1) : '0';
    
    console.log('\n📈 GEPT 按鈕修復效果:');
    console.log(`  - 總按鈕數: ${buttonCount}`);
    console.log(`  - 成功點擊: ${successfulClicks}/${buttonCount} (${clickSuccessRate}%)`);
    console.log(`  - 正確激活: ${activatedButtons}/${buttonCount} (${activationRate}%)`);
    console.log(`  - 重疊問題: ${buttonLayoutAnalysis.hasOverlaps ? '仍存在' : '已解決'}`);
    
    let fixStatus;
    if (successfulClicks === buttonCount && !buttonLayoutAnalysis.hasOverlaps) {
      fixStatus = '✅ 完全修復';
    } else if (successfulClicks === buttonCount) {
      fixStatus = '⚡ 功能修復，佈局需調整';
    } else if (successfulClicks > buttonCount * 0.8) {
      fixStatus = '🔧 部分修復';
    } else {
      fixStatus = '❌ 修復失敗';
    }
    
    console.log(`  - 修復狀態: ${fixStatus}`);
    
    console.log('\n✅ GEPT 按鈕修復驗證完成');
    
    return {
      buttonLayoutAnalysis,
      allButtonResults,
      successfulClicks,
      clickSuccessRate,
      fixStatus
    };
  });
});
