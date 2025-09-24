const { test, expect, devices } = require('@playwright/test');

test.describe('Starshake 手機設備 TouchControls 功能測試', () => {
  
  // 測試不同的手機設備
  const mobileDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 13', device: devices['iPhone 13'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
    { name: 'iPad', device: devices['iPad'] }
  ];

  mobileDevices.forEach(({ name, device }) => {
    test(`${name} - TouchControls 功能測試`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
        permissions: ['clipboard-read', 'clipboard-write']
      });
      
      const page = await context.newPage();
      
      console.log(`📱 開始 ${name} TouchControls 測試...`);
      
      // 監聽控制台消息
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
        console.log(`📝 ${name} 控制台: ${msg.text()}`);
      });
      
      // 導航到遊戲頁面
      await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(3000);
      
      // 檢查 TouchControls 可見性
      const touchControls = page.locator('#touch-controls');
      const isVisible = await touchControls.isVisible();
      console.log(`📱 ${name} TouchControls 可見: ${isVisible ? '✅' : '❌'}`);
      
      if (isVisible) {
        // 測試虛擬搖桿互動
        console.log(`🕹️ ${name} 測試虛擬搖桿...`);
        
        const joystick = page.locator('#touch-joystick');
        const joystickBounds = await joystick.boundingBox();
        
        if (joystickBounds) {
          // 獲取初始狀態
          const initialState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 初始狀態: ${JSON.stringify(initialState)}`);
          
          // 模擬觸摸搖桿 - 向右移動
          console.log(`👆 ${name} 模擬向右觸摸...`);
          await page.touchscreen.tap(
            joystickBounds.x + joystickBounds.width * 0.8,
            joystickBounds.y + joystickBounds.height * 0.5
          );
          await page.waitForTimeout(500);
          
          const rightState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 向右觸摸後: ${JSON.stringify(rightState)}`);
          
          // 模擬觸摸搖桿 - 向左移動
          console.log(`👆 ${name} 模擬向左觸摸...`);
          await page.touchscreen.tap(
            joystickBounds.x + joystickBounds.width * 0.2,
            joystickBounds.y + joystickBounds.height * 0.5
          );
          await page.waitForTimeout(500);
          
          const leftState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 向左觸摸後: ${JSON.stringify(leftState)}`);
          
          // 模擬觸摸搖桿 - 向上移動
          console.log(`👆 ${name} 模擬向上觸摸...`);
          await page.touchscreen.tap(
            joystickBounds.x + joystickBounds.width * 0.5,
            joystickBounds.y + joystickBounds.height * 0.2
          );
          await page.waitForTimeout(500);
          
          const upState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 向上觸摸後: ${JSON.stringify(upState)}`);
          
          // 模擬觸摸搖桿 - 向下移動
          console.log(`👆 ${name} 模擬向下觸摸...`);
          await page.touchscreen.tap(
            joystickBounds.x + joystickBounds.width * 0.5,
            joystickBounds.y + joystickBounds.height * 0.8
          );
          await page.waitForTimeout(500);
          
          const downState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 向下觸摸後: ${JSON.stringify(downState)}`);
        }
        
        // 測試射擊按鈕
        console.log(`🚀 ${name} 測試射擊按鈕...`);
        const shootButton = page.locator('#touch-shoot');
        const shootBounds = await shootButton.boundingBox();
        
        if (shootBounds) {
          // 點擊射擊按鈕
          await page.touchscreen.tap(
            shootBounds.x + shootBounds.width / 2,
            shootBounds.y + shootBounds.height / 2
          );
          await page.waitForTimeout(500);
          
          const shootState = await page.evaluate(() => {
            return window.touchControls ? window.touchControls.getInputState() : null;
          });
          console.log(`📊 ${name} 射擊按鈕觸摸後: ${JSON.stringify(shootState)}`);
        }
        
        // 測試全螢幕按鈕
        console.log(`🖥️ ${name} 測試全螢幕按鈕...`);
        const fullscreenButton = page.locator('#fullscreen-btn');
        if (await fullscreenButton.count() > 0) {
          await fullscreenButton.tap();
          await page.waitForTimeout(1000);
          console.log(`📱 ${name} 全螢幕按鈕已點擊`);
        }
      }
      
      // 檢查遊戲是否正常載入
      const gameStatus = await page.evaluate(() => {
        return {
          phaserExists: typeof Phaser !== 'undefined',
          gameExists: typeof window.game !== 'undefined',
          touchControlsExists: typeof window.touchControls !== 'undefined',
          gameContainer: document.getElementById('game-container') !== null
        };
      });
      
      console.log(`🎮 ${name} 遊戲狀態:`, gameStatus);
      
      // 截圖記錄
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/success/20250924_starshake_${name.replace(/\s+/g, '_')}_touchcontrols_test_v1_001.png`,
        fullPage: true 
      });
      
      // 錄製影片
      await page.video()?.saveAs(`EduCreate-Test-Videos/current/success/20250924_starshake_${name.replace(/\s+/g, '_')}_touchcontrols_test_v1_001.webm`);
      
      // 基本斷言
      expect(isVisible).toBe(true);
      expect(gameStatus.touchControlsExists).toBe(true);
      expect(gameStatus.gameContainer).toBe(true);
      
      console.log(`🎉 ${name} TouchControls 測試完成！`);
      
      await context.close();
    });
  });
  
  test('綜合 TouchControls 互動測試', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      recordVideo: {
        dir: 'EduCreate-Test-Videos/current/success/',
        size: { width: 390, height: 844 }
      }
    });
    
    const page = await context.newPage();
    
    console.log('📱 開始綜合 TouchControls 互動測試...');
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 檢查 TouchControls 狀態
    const touchControlsStatus = await page.evaluate(() => {
      if (!window.touchControls) return { exists: false };
      
      const state = window.touchControls.getInputState();
      return {
        exists: true,
        initialState: state,
        methods: {
          getInputState: typeof window.touchControls.getInputState === 'function',
          updateJoystick: typeof window.touchControls.updateJoystick === 'function',
          updateShootButton: typeof window.touchControls.updateShootButton === 'function'
        }
      };
    });
    
    console.log('📊 TouchControls 狀態:', touchControlsStatus);
    
    if (touchControlsStatus.exists) {
      // 連續互動測試
      console.log('🎮 開始連續互動測試...');
      
      const joystick = page.locator('#touch-joystick');
      const shootButton = page.locator('#touch-shoot');
      
      // 模擬遊戲操作序列
      const gameSequence = [
        { action: 'move-right', description: '向右移動' },
        { action: 'shoot', description: '射擊' },
        { action: 'move-left', description: '向左移動' },
        { action: 'shoot', description: '射擊' },
        { action: 'move-up', description: '向上移動' },
        { action: 'shoot', description: '射擊' },
        { action: 'move-down', description: '向下移動' },
        { action: 'shoot', description: '射擊' }
      ];
      
      for (const step of gameSequence) {
        console.log(`🎯 執行: ${step.description}`);
        
        if (step.action.startsWith('move-')) {
          const joystickBounds = await joystick.boundingBox();
          if (joystickBounds) {
            let x = joystickBounds.x + joystickBounds.width / 2;
            let y = joystickBounds.y + joystickBounds.height / 2;
            
            switch (step.action) {
              case 'move-right':
                x += joystickBounds.width * 0.3;
                break;
              case 'move-left':
                x -= joystickBounds.width * 0.3;
                break;
              case 'move-up':
                y -= joystickBounds.height * 0.3;
                break;
              case 'move-down':
                y += joystickBounds.height * 0.3;
                break;
            }
            
            await page.touchscreen.tap(x, y);
          }
        } else if (step.action === 'shoot') {
          await shootButton.tap();
        }
        
        await page.waitForTimeout(500);
        
        // 記錄狀態變化
        const currentState = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        console.log(`📊 ${step.description} 後狀態: ${JSON.stringify(currentState)}`);
      }
    }
    
    // 最終截圖
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/success/20250924_starshake_comprehensive_touchcontrols_test_v1_001.png',
      fullPage: true 
    });
    
    console.log('🎉 綜合 TouchControls 互動測試完成！');
    
    await context.close();
  });
  
  test('TouchControls 響應性測試', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12']
    });
    
    const page = await context.newPage();
    
    console.log('⚡ 開始 TouchControls 響應性測試...');
    
    await page.goto('http://localhost:3000/games/starshake-game/dist/index.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // 快速連續觸摸測試
    const joystick = page.locator('#touch-joystick');
    const shootButton = page.locator('#touch-shoot');
    
    console.log('🚀 快速連續觸摸測試...');
    
    // 快速點擊射擊按鈕
    for (let i = 0; i < 10; i++) {
      await shootButton.tap();
      await page.waitForTimeout(100);
      
      const state = await page.evaluate(() => {
        return window.touchControls ? window.touchControls.getInputState() : null;
      });
      
      if (i % 3 === 0) {
        console.log(`📊 快速射擊 ${i + 1}: ${JSON.stringify(state)}`);
      }
    }
    
    // 快速移動測試
    const joystickBounds = await joystick.boundingBox();
    if (joystickBounds) {
      const positions = [
        { x: 0.8, y: 0.5, name: '右' },
        { x: 0.2, y: 0.5, name: '左' },
        { x: 0.5, y: 0.2, name: '上' },
        { x: 0.5, y: 0.8, name: '下' },
        { x: 0.5, y: 0.5, name: '中心' }
      ];
      
      for (const pos of positions) {
        await page.touchscreen.tap(
          joystickBounds.x + joystickBounds.width * pos.x,
          joystickBounds.y + joystickBounds.height * pos.y
        );
        await page.waitForTimeout(200);
        
        const state = await page.evaluate(() => {
          return window.touchControls ? window.touchControls.getInputState() : null;
        });
        console.log(`📊 快速移動${pos.name}: ${JSON.stringify(state)}`);
      }
    }
    
    console.log('🎉 TouchControls 響應性測試完成！');
    
    await context.close();
  });
});
