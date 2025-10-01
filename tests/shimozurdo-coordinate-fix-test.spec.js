const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 座標修復測試 - FIT 模式', () => {
  
  test('手機直向模式 - 全螢幕點擊測試', async ({ page }) => {
    console.log('📱 測試手機直向模式座標修復');
    
    // 設置 iPhone 14 直向模式
    await page.setViewportSize({ width: 390, height: 844 });
    
    // 監聽座標相關日誌
    const coordinateLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('座標修復') || text.includes('太空船基準')) {
        coordinateLogs.push(text);
        console.log('🔧', text);
      }
    });
    
    // 訪問遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    
    // 等待遊戲載入
    await page.waitForTimeout(3000);
    
    // 測試點擊位置
    const testPoints = [
      { x: 50, y: 100, name: '左上角' },
      { x: 340, y: 100, name: '右上角' },
      { x: 50, y: 700, name: '左下角' },
      { x: 340, y: 700, name: '右下角' },
      { x: 195, y: 400, name: '中心' }
    ];
    
    console.log('\n📍 測試點擊位置（直向模式）:');
    
    for (const point of testPoints) {
      console.log(`\n🎯 點擊 ${point.name}: (${point.x}, ${point.y})`);
      
      // 清空日誌
      coordinateLogs.length = 0;
      
      // 點擊
      await page.mouse.click(point.x, point.y);
      
      // 等待響應
      await page.waitForTimeout(500);
      
      // 檢查是否有座標修復日誌
      const hasCoordinateFix = coordinateLogs.some(log => log.includes('座標修復'));
      const hasResponse = coordinateLogs.some(log => log.includes('太空船基準'));
      
      console.log(`  座標修復: ${hasCoordinateFix ? '✅' : '❌'}`);
      console.log(`  遊戲響應: ${hasResponse ? '✅' : '❌'}`);
      
      if (coordinateLogs.length > 0) {
        console.log(`  日誌數量: ${coordinateLogs.length}`);
      }
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/shimozurdo-portrait-coordinate-test.png',
      fullPage: true 
    });
    
    console.log('\n✅ 直向模式測試完成');
  });
  
  test('手機橫向模式 - 全螢幕點擊測試', async ({ page }) => {
    console.log('📱 測試手機橫向模式座標修復');
    
    // 設置 iPhone 14 橫向模式
    await page.setViewportSize({ width: 844, height: 390 });
    
    // 監聽座標相關日誌
    const coordinateLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('座標修復') || text.includes('太空船基準')) {
        coordinateLogs.push(text);
        console.log('🔧', text);
      }
    });
    
    // 訪問遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    
    // 等待遊戲載入
    await page.waitForTimeout(3000);
    
    // 測試點擊位置
    const testPoints = [
      { x: 50, y: 50, name: '左上角' },
      { x: 794, y: 50, name: '右上角' },
      { x: 50, y: 340, name: '左下角' },
      { x: 794, y: 340, name: '右下角' },
      { x: 422, y: 195, name: '中心' }
    ];
    
    console.log('\n📍 測試點擊位置（橫向模式）:');
    
    for (const point of testPoints) {
      console.log(`\n🎯 點擊 ${point.name}: (${point.x}, ${point.y})`);
      
      // 清空日誌
      coordinateLogs.length = 0;
      
      // 點擊
      await page.mouse.click(point.x, point.y);
      
      // 等待響應
      await page.waitForTimeout(500);
      
      // 檢查是否有座標修復日誌
      const hasCoordinateFix = coordinateLogs.some(log => log.includes('座標修復'));
      const hasResponse = coordinateLogs.some(log => log.includes('太空船基準'));
      
      console.log(`  座標修復: ${hasCoordinateFix ? '✅' : '❌'}`);
      console.log(`  遊戲響應: ${hasResponse ? '✅' : '❌'}`);
      
      if (coordinateLogs.length > 0) {
        console.log(`  日誌數量: ${coordinateLogs.length}`);
      }
    }
    
    // 截圖
    await page.screenshot({ 
      path: 'EduCreate-Test-Videos/current/shimozurdo-landscape-coordinate-test.png',
      fullPage: true 
    });
    
    console.log('\n✅ 橫向模式測試完成');
  });
  
  test('座標修復邏輯驗證', async ({ page }) => {
    console.log('🔧 驗證座標修復邏輯');
    
    // 設置 iPhone 14 直向模式
    await page.setViewportSize({ width: 390, height: 844 });
    
    // 訪問遊戲
    await page.goto('http://localhost:3000/games/shimozurdo-game');
    
    // 等待遊戲載入
    await page.waitForTimeout(3000);
    
    // 檢查座標修復工具是否正確載入
    const coordinateFixInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return { error: 'Canvas not found' };
      
      const canvasRect = canvas.getBoundingClientRect();
      
      // 檢查 Phaser 遊戲實例
      const game = window.game || (window.Phaser && window.Phaser.GAMES && window.Phaser.GAMES[0]);
      if (!game) return { error: 'Game instance not found' };
      
      const gameConfig = game.config;
      
      return {
        canvasDisplay: {
          width: canvasRect.width,
          height: canvasRect.height,
          left: canvasRect.left,
          top: canvasRect.top
        },
        gameLogic: {
          width: gameConfig.width,
          height: gameConfig.height
        },
        scaleMode: gameConfig.scale?.mode,
        autoCenter: gameConfig.scale?.autoCenter
      };
    });
    
    console.log('\n📊 座標系統信息:');
    console.log('  Canvas 顯示尺寸:', coordinateFixInfo.canvasDisplay);
    console.log('  遊戲邏輯尺寸:', coordinateFixInfo.gameLogic);
    console.log('  Scale 模式:', coordinateFixInfo.scaleMode);
    console.log('  Auto Center:', coordinateFixInfo.autoCenter);
    
    // 驗證 FIT 模式
    expect(coordinateFixInfo.scaleMode).toBe(1); // Phaser.Scale.FIT = 1
    
    // 驗證遊戲邏輯尺寸
    expect(coordinateFixInfo.gameLogic.width).toBeGreaterThan(0);
    expect(coordinateFixInfo.gameLogic.height).toBeGreaterThan(0);
    
    // 驗證 Canvas 顯示尺寸
    expect(coordinateFixInfo.canvasDisplay.width).toBeGreaterThan(0);
    expect(coordinateFixInfo.canvasDisplay.height).toBeGreaterThan(0);
    
    console.log('\n✅ 座標修復邏輯驗證完成');
  });
  
  test('動態解析度測試', async ({ page }) => {
    console.log('📐 測試動態解析度功能');
    
    const viewports = [
      { width: 390, height: 844, name: 'iPhone 14 直向', expectedRatio: 0.46 },
      { width: 844, height: 390, name: 'iPhone 14 橫向', expectedRatio: 2.16 },
      { width: 1024, height: 768, name: 'iPad 橫向', expectedRatio: 1.33 },
      { width: 1920, height: 1080, name: '桌面 Full HD', expectedRatio: 1.78 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n📱 測試 ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // 設置視窗大小
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // 訪問遊戲
      await page.goto('http://localhost:3000/games/shimozurdo-game');
      
      // 等待遊戲載入
      await page.waitForTimeout(2000);
      
      // 獲取遊戲解析度
      const gameInfo = await page.evaluate(() => {
        const game = window.game || (window.Phaser && window.Phaser.GAMES && window.Phaser.GAMES[0]);
        if (!game) return null;
        
        return {
          width: game.config.width,
          height: game.config.height,
          aspectRatio: (game.config.width / game.config.height).toFixed(2)
        };
      });
      
      if (gameInfo) {
        console.log(`  遊戲解析度: ${gameInfo.width}x${gameInfo.height}`);
        console.log(`  寬高比: ${gameInfo.aspectRatio}`);
        console.log(`  預期寬高比: ${viewport.expectedRatio.toFixed(2)}`);
      }
    }
    
    console.log('\n✅ 動態解析度測試完成');
  });
});

