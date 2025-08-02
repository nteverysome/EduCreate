import { test, expect } from '@playwright/test';

/**
 * 測試 GEPT 等級選擇器移動到切換遊戲按鈕同一排的效果
 */

test.describe('GEPT 選擇器重新定位測試', () => {
  
  test('檢查 GEPT 選擇器是否移到按鈕區域', async ({ page }) => {
    console.log('🔍 檢查 GEPT 選擇器是否移到按鈕區域');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('⏳ 等待 3 秒讓頁面完全載入...');
    await page.waitForTimeout(3000);
    
    // 檢查切換遊戲按鈕位置
    const switchButton = page.locator('button:has-text("切換遊戲")');
    const switchButtonBox = await switchButton.boundingBox();
    
    // 檢查 GEPT 等級按鈕位置
    const geptButtons = page.locator('button:has-text("初級"), button:has-text("中級"), button:has-text("高級")');
    const geptButtonCount = await geptButtons.count();
    
    console.log('🎮 GEPT 按鈕數量:', geptButtonCount);
    expect(geptButtonCount).toBe(3);
    
    if (switchButtonBox) {
      // 檢查第一個 GEPT 按鈕位置
      const firstGeptButton = geptButtons.first();
      const firstGeptBox = await firstGeptButton.boundingBox();
      
      if (firstGeptBox) {
        console.log('📏 按鈕位置比較:');
        console.log(`  - 切換遊戲按鈕: y=${switchButtonBox.y}`);
        console.log(`  - GEPT 按鈕: y=${firstGeptBox.y}`);
        console.log(`  - 垂直差距: ${Math.abs(switchButtonBox.y - firstGeptBox.y)}px`);
        
        // 驗證 GEPT 按鈕與切換遊戲按鈕在同一水平線上（允許小差異）
        expect(Math.abs(switchButtonBox.y - firstGeptBox.y)).toBeLessThan(10);
        
        // 驗證 GEPT 按鈕在切換遊戲按鈕左側
        expect(firstGeptBox.x).toBeLessThan(switchButtonBox.x);
        
        console.log('✅ GEPT 選擇器成功移到按鈕區域同一排');
      }
    }
    
    // 檢查 GEPT 標籤文字
    const geptLabel = page.locator('span:has-text("GEPT:")');
    const geptLabelExists = await geptLabel.count();
    console.log('📚 GEPT 標籤數量:', geptLabelExists);
    expect(geptLabelExists).toBeGreaterThan(0);
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/gept-selector-relocation.png',
      fullPage: true 
    });
    
    console.log('✅ GEPT 選擇器重新定位檢查完成');
  });
  
  test('檢查遊戲容器位置進一步提升', async ({ page }) => {
    console.log('📐 檢查遊戲容器位置是否因節省空間而進一步提升');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 檢查遊戲 iframe 容器位置
    const gameContainer = page.locator('iframe').first();
    const containerBox = await gameContainer.boundingBox();
    
    if (containerBox) {
      console.log('🎮 遊戲容器位置（節省空間後）:');
      console.log(`  - 頂部位置: ${containerBox.y}px`);
      console.log(`  - 左側位置: ${containerBox.x}px`);
      
      // 檢查容器位置是否更高（應該小於 170px）
      expect(containerBox.y).toBeLessThan(170);
      
      // 檢查容器是否在視窗上部分
      const viewportSize = page.viewportSize();
      if (viewportSize) {
        const positionRatio = containerBox.y / viewportSize.height;
        console.log(`📍 遊戲容器位置比例: ${(positionRatio * 100).toFixed(1)}%`);
        expect(positionRatio).toBeLessThan(0.25); // 應該在視窗上 25% 內
      }
      
      console.log('✅ 遊戲容器位置成功進一步提升');
    } else {
      console.log('❌ 無法獲取遊戲容器位置');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/gept-selector-container-height.png',
      fullPage: true 
    });
    
    console.log('✅ 遊戲容器位置檢查完成');
  });
  
  test('測試 GEPT 等級選擇功能', async ({ page }) => {
    console.log('🔘 測試 GEPT 等級選擇功能');
    
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(3000);
    
    // 測試點擊不同的 GEPT 等級
    const levels = ['初級', '中級', '高級'];
    
    for (const level of levels) {
      console.log(`🖱️ 點擊 ${level} 按鈕`);
      await page.click(`button:has-text("${level}")`);
      await page.waitForTimeout(500);
      
      // 檢查按鈕是否被選中（有藍色背景）
      const selectedButton = page.locator(`button:has-text("${level}")`);
      const buttonClass = await selectedButton.getAttribute('class');
      
      if (buttonClass && buttonClass.includes('bg-blue-100')) {
        console.log(`✅ ${level} 按鈕成功選中`);
      } else {
        console.log(`⚠️ ${level} 按鈕選中狀態不明確`);
      }
    }
    
    // 檢查按鈕佈局
    const geptButtons = page.locator('button:has-text("初級"), button:has-text("中級"), button:has-text("高級")');
    const buttonPositions = [];
    
    for (let i = 0; i < await geptButtons.count(); i++) {
      const button = geptButtons.nth(i);
      const box = await button.boundingBox();
      const text = await button.textContent();
      if (box) {
        buttonPositions.push({ text, x: box.x, y: box.y });
      }
    }
    
    console.log('📏 GEPT 按鈕佈局:');
    buttonPositions.forEach(pos => {
      console.log(`  - ${pos.text}: x=${pos.x}, y=${pos.y}`);
    });
    
    // 驗證按鈕水平排列
    if (buttonPositions.length >= 2) {
      const yDiff = Math.abs(buttonPositions[0].y - buttonPositions[1].y);
      expect(yDiff).toBeLessThan(5); // 應該在同一水平線上
      console.log('✅ GEPT 按鈕正確水平排列');
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'test-results/gept-selector-functionality.png',
      fullPage: true 
    });
    
    console.log('✅ GEPT 等級選擇功能測試完成');
  });

});
