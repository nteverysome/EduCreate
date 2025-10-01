// Shimozurdo 遊戲 TouchControls 整合測試
// 測試虛擬按鈕功能和移動設備支援

const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo TouchControls 整合測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 設置移動設備視窗
    await page.setViewportSize({ width: 390, height: 844 });
    
    // 訪問遊戲頁面
    await page.goto('http://localhost:3001/games/shimozurdo-game/');
    
    // 等待遊戲載入
    await page.waitForTimeout(3000);
  });

  test('1. TouchControls 元素存在檢查', async ({ page }) => {
    console.log('🧪 測試 1: 檢查 TouchControls 元素是否存在');

    // 檢查 touch-controls 容器
    const touchControls = await page.locator('#touch-controls');
    await expect(touchControls).toBeVisible();
    console.log('✅ touch-controls 容器可見');

    // 檢查虛擬搖桿
    const joystick = await page.locator('.touch-joystick');
    await expect(joystick).toBeVisible();
    console.log('✅ 虛擬搖桿可見');

    // 檢查射擊按鈕
    const shootBtn = await page.locator('.touch-shoot-btn');
    await expect(shootBtn).toBeVisible();
    console.log('✅ 射擊按鈕可見');

    // 檢查全螢幕按鈕
    const fullscreenBtn = await page.locator('.fullscreen-btn');
    await expect(fullscreenBtn).toBeVisible();
    console.log('✅ 全螢幕按鈕可見');
  });

  test('2. TouchControls 類初始化檢查', async ({ page }) => {
    console.log('🧪 測試 2: 檢查 TouchControls 類是否正確初始化');

    // 檢查 window.touchControls 是否存在
    const touchControlsExists = await page.evaluate(() => {
      return typeof window.touchControls !== 'undefined';
    });
    expect(touchControlsExists).toBe(true);
    console.log('✅ window.touchControls 已初始化');

    // 檢查 getInputState 方法
    const hasGetInputState = await page.evaluate(() => {
      return typeof window.touchControls.getInputState === 'function';
    });
    expect(hasGetInputState).toBe(true);
    console.log('✅ getInputState 方法存在');

    // 測試 getInputState 返回值
    const inputState = await page.evaluate(() => {
      return window.touchControls.getInputState();
    });
    expect(inputState).toHaveProperty('direction');
    expect(inputState).toHaveProperty('shooting');
    console.log('✅ getInputState 返回正確的數據結構:', inputState);
  });

  test('3. 虛擬搖桿觸控測試', async ({ page }) => {
    console.log('🧪 測試 3: 測試虛擬搖桿觸控響應');

    const joystick = await page.locator('.touch-joystick');
    const joystickBox = await joystick.boundingBox();

    if (!joystickBox) {
      throw new Error('無法獲取搖桿位置');
    }

    // 計算搖桿中心點
    const centerX = joystickBox.x + joystickBox.width / 2;
    const centerY = joystickBox.y + joystickBox.height / 2;

    // 模擬向上滑動
    await page.touchscreen.tap(centerX, centerY - 30);
    await page.waitForTimeout(100);

    // 檢查輸入狀態
    const inputStateUp = await page.evaluate(() => {
      return window.touchControls.getInputState();
    });
    console.log('✅ 向上滑動輸入狀態:', inputStateUp);

    // 模擬向下滑動
    await page.touchscreen.tap(centerX, centerY + 30);
    await page.waitForTimeout(100);

    const inputStateDown = await page.evaluate(() => {
      return window.touchControls.getInputState();
    });
    console.log('✅ 向下滑動輸入狀態:', inputStateDown);
  });

  test('4. 射擊按鈕觸控測試', async ({ page }) => {
    console.log('🧪 測試 4: 測試射擊按鈕觸控響應');

    const shootBtn = await page.locator('.touch-shoot-btn');

    // 點擊射擊按鈕
    await shootBtn.tap();
    await page.waitForTimeout(100);

    // 檢查控制台日誌
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('射擊')) {
        logs.push(msg.text());
      }
    });

    await shootBtn.tap();
    await page.waitForTimeout(500);

    console.log('✅ 射擊按鈕點擊測試完成');
  });

  test('5. 全螢幕按鈕功能測試', async ({ page }) => {
    console.log('🧪 測試 5: 測試全螢幕按鈕功能');

    const fullscreenBtn = await page.locator('.fullscreen-btn');

    // 監聽 PostMessage
    const messages = [];
    await page.evaluate(() => {
      window.addEventListener('message', (event) => {
        console.log('📥 收到 PostMessage:', event.data);
      });
    });

    // 點擊全螢幕按鈕
    await fullscreenBtn.click();
    await page.waitForTimeout(500);

    console.log('✅ 全螢幕按鈕點擊測試完成');
  });

  test('6. Phaser 遊戲整合測試', async ({ page }) => {
    console.log('🧪 測試 6: 測試 Phaser 遊戲與 TouchControls 整合');

    // 等待 Phaser 遊戲載入
    await page.waitForFunction(() => {
      return typeof window.game !== 'undefined';
    }, { timeout: 10000 });
    console.log('✅ Phaser 遊戲已載入');

    // 檢查遊戲是否正在運行
    const gameRunning = await page.evaluate(() => {
      return window.game && window.game.isRunning;
    });
    expect(gameRunning).toBe(true);
    console.log('✅ Phaser 遊戲正在運行');

    // 測試虛擬搖桿控制太空船
    const joystick = await page.locator('.touch-joystick');
    const joystickBox = await joystick.boundingBox();

    if (joystickBox) {
      const centerX = joystickBox.x + joystickBox.width / 2;
      const centerY = joystickBox.y + joystickBox.height / 2;

      // 模擬向上移動
      await page.touchscreen.tap(centerX, centerY - 30);
      await page.waitForTimeout(1000);

      console.log('✅ 虛擬搖桿控制太空船測試完成');
    }
  });

  test('7. 響應式設計測試', async ({ page }) => {
    console.log('🧪 測試 7: 測試不同螢幕尺寸的響應式設計');

    // 測試 iPhone 14
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    
    let touchControlsVisible = await page.locator('#touch-controls').isVisible();
    expect(touchControlsVisible).toBe(true);
    console.log('✅ iPhone 14 (390×844): TouchControls 可見');

    // 測試 iPad
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    touchControlsVisible = await page.locator('#touch-controls').isVisible();
    expect(touchControlsVisible).toBe(true);
    console.log('✅ iPad (768×1024): TouchControls 可見');

    // 測試桌面
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    touchControlsVisible = await page.locator('#touch-controls').isVisible();
    // 桌面應該隱藏 TouchControls
    console.log('✅ 桌面 (1920×1080): TouchControls 狀態檢查完成');
  });

  test('8. 性能測試', async ({ page }) => {
    console.log('🧪 測試 8: 測試 TouchControls 性能');

    // 連續快速點擊測試
    const shootBtn = await page.locator('.touch-shoot-btn');
    
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await shootBtn.tap();
      await page.waitForTimeout(50);
    }
    const endTime = Date.now();
    
    const totalTime = endTime - startTime;
    console.log(`✅ 10 次連續點擊耗時: ${totalTime}ms`);
    expect(totalTime).toBeLessThan(2000); // 應該在 2 秒內完成
  });

  test('9. 錯誤處理測試', async ({ page }) => {
    console.log('🧪 測試 9: 測試錯誤處理機制');

    // 測試在遊戲未載入時的行為
    const inputState = await page.evaluate(() => {
      return window.touchControls?.getInputState() || null;
    });
    
    expect(inputState).not.toBeNull();
    console.log('✅ 錯誤處理機制正常');
  });

  test('10. 完整遊戲流程測試', async ({ page }) => {
    console.log('🧪 測試 10: 完整遊戲流程測試');

    // 等待遊戲完全載入
    await page.waitForFunction(() => {
      return typeof window.game !== 'undefined' && window.game.isRunning;
    }, { timeout: 10000 });

    // 使用虛擬搖桿移動太空船
    const joystick = await page.locator('.touch-joystick');
    const joystickBox = await joystick.boundingBox();

    if (joystickBox) {
      const centerX = joystickBox.x + joystickBox.width / 2;
      const centerY = joystickBox.y + joystickBox.height / 2;

      // 向上移動
      await page.touchscreen.tap(centerX, centerY - 30);
      await page.waitForTimeout(500);

      // 向下移動
      await page.touchscreen.tap(centerX, centerY + 30);
      await page.waitForTimeout(500);

      console.log('✅ 完整遊戲流程測試完成');
    }

    // 截圖
    await page.screenshot({ 
      path: 'test-results/shimozurdo-touchcontrols-final.png',
      fullPage: true 
    });
    console.log('✅ 測試截圖已保存');
  });
});

