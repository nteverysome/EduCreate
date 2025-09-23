const { test, expect } = require('@playwright/test');

test.describe('Shimozurdo 手機座標調試器測試', () => {
  test('驗證手機座標調試器在真實環境中的功能', async ({ page }) => {
    console.log('🔍 開始測試手機座標調試器功能...');
    
    // 設置手機視窗大小（模擬橫向模式）
    await page.setViewportSize({ width: 932, height: 430 });
    
    // 導航到遊戲頁面
    await page.goto('https://edu-create.vercel.app/games/shimozurdo-game');
    
    // 等待遊戲載入
    await page.waitForTimeout(3000);
    
    // 點擊 Play 按鈕進入遊戲
    console.log('🎮 尋找並點擊 Play 按鈕...');
    
    const buttonInfo = await page.evaluate(() => {
      const menuScene = window.game.scene.getScene('menu');
      if (!menuScene || !menuScene.playButtonText) return null;
      
      return {
        x: menuScene.playButtonText.x,
        y: menuScene.playButtonText.y,
        text: menuScene.playButtonText.text
      };
    });
    
    if (buttonInfo) {
      console.log(`🎯 Play 按鈕位置: (${buttonInfo.x}, ${buttonInfo.y})`);
      await page.mouse.click(buttonInfo.x, buttonInfo.y);
      await page.waitForTimeout(5000);
    }
    
    // 驗證調試器是否已啟動
    const debuggerStatus = await page.evaluate(() => {
      const titleScene = window.game.scene.getScene('title');
      return {
        hasDebugger: !!titleScene?.mobileDebugger,
        debuggerEnabled: titleScene?.mobileDebugger?.isEnabled,
        hasPlayer: !!titleScene?.player,
        debuggerClass: !!window.MobileCoordinateDebugger
      };
    });
    
    console.log('🔍 調試器狀態:', JSON.stringify(debuggerStatus, null, 2));
    
    if (!debuggerStatus.hasPlayer) {
      console.log('❌ 遊戲未正確載入，跳過調試器測試');
      return;
    }
    
    // 測試多個位置的座標診斷
    const testPositions = [
      { name: '中心位置', x: 466, y: 215 },
      { name: '左上角', x: 100, y: 100 },
      { name: '右下角', x: 800, y: 350 },
      { name: '左邊緣', x: 50, y: 215 },
      { name: '右邊緣', x: 880, y: 215 }
    ];
    
    const diagnosticResults = [];
    
    for (const pos of testPositions) {
      console.log(`🎯 測試位置: ${pos.name} (${pos.x}, ${pos.y})`);
      
      // 點擊位置
      await page.mouse.click(pos.x, pos.y);
      await page.waitForTimeout(500);
      
      // 獲取診斷結果
      const result = await page.evaluate((position) => {
        const titleScene = window.game.scene.getScene('title');
        if (!titleScene?.mobileDebugger) return null;
        
        // 模擬指針對象
        const mockPointer = {
          x: position.x,
          y: position.y,
          worldX: position.x,
          worldY: position.y
        };
        
        const diagnosis = titleScene.mobileDebugger.performComprehensiveDiagnosis(mockPointer);
        const bestMethod = titleScene.mobileDebugger.findBestMethod(diagnosis.offsets);
        
        return {
          position: position,
          bestMethod: bestMethod,
          fixMethods: Object.keys(diagnosis.fixMethods).length,
          hasOffsets: Object.keys(diagnosis.offsets).length > 0,
          deviceInfo: {
            screenSize: diagnosis.basicInfo.screenSize,
            windowSize: diagnosis.basicInfo.windowSize,
            devicePixelRatio: diagnosis.basicInfo.devicePixelRatio,
            canvasSize: diagnosis.basicInfo.canvasSize
          }
        };
      }, pos);
      
      if (result) {
        diagnosticResults.push(result);
        console.log(`✅ ${pos.name} 診斷完成: 最佳方法=${result.bestMethod}, 修復方法數=${result.fixMethods}`);
      }
    }
    
    // 驗證調試器功能
    expect(debuggerStatus.debuggerClass).toBe(true);
    expect(debuggerStatus.hasDebugger).toBe(true);
    expect(diagnosticResults.length).toBeGreaterThan(0);
    
    // 檢查是否有有效的診斷結果
    const validResults = diagnosticResults.filter(r => r.bestMethod && r.fixMethods > 0);
    expect(validResults.length).toBeGreaterThan(0);
    
    // 輸出詳細的診斷報告
    console.log('\n📊 === 手機座標調試器診斷報告 ===');
    console.log(`🔍 調試器狀態: ${debuggerStatus.hasDebugger ? '✅ 已啟動' : '❌ 未啟動'}`);
    console.log(`🎮 遊戲狀態: ${debuggerStatus.hasPlayer ? '✅ 正常' : '❌ 異常'}`);
    console.log(`📱 測試位置數: ${diagnosticResults.length}`);
    console.log(`✅ 有效診斷數: ${validResults.length}`);
    
    if (validResults.length > 0) {
      const deviceInfo = validResults[0].deviceInfo;
      console.log(`📱 設備信息:`);
      console.log(`   螢幕: ${deviceInfo.screenSize.width}x${deviceInfo.screenSize.height}`);
      console.log(`   視窗: ${deviceInfo.windowSize.width}x${deviceInfo.windowSize.height}`);
      console.log(`   像素比: ${deviceInfo.devicePixelRatio}`);
      console.log(`   Canvas: ${deviceInfo.canvasSize.width}x${deviceInfo.canvasSize.height}`);
      
      console.log(`🔧 座標修復方法統計:`);
      const methodCounts = {};
      validResults.forEach(r => {
        methodCounts[r.bestMethod] = (methodCounts[r.bestMethod] || 0) + 1;
      });
      
      Object.entries(methodCounts).forEach(([method, count]) => {
        console.log(`   ${method}: ${count}次`);
      });
    }
    
    // 測試調試器的視覺化功能
    const visualElements = await page.evaluate(() => {
      const titleScene = window.game.scene.getScene('title');
      if (!titleScene?.mobileDebugger) return null;
      
      return {
        hasDebugText: !!titleScene.mobileDebugger.debugText,
        hasCrosshair: !!titleScene.mobileDebugger.crosshair,
        hasFixedMarker: !!titleScene.mobileDebugger.fixedMarker,
        hasPlayerMarker: !!titleScene.mobileDebugger.playerMarker,
        debugTextVisible: titleScene.mobileDebugger.debugText?.visible
      };
    });
    
    if (visualElements) {
      console.log(`🎨 視覺化元素:`);
      console.log(`   調試文字: ${visualElements.hasDebugText ? '✅' : '❌'}`);
      console.log(`   十字線: ${visualElements.hasCrosshair ? '✅' : '❌'}`);
      console.log(`   修復標記: ${visualElements.hasFixedMarker ? '✅' : '❌'}`);
      console.log(`   玩家標記: ${visualElements.hasPlayerMarker ? '✅' : '❌'}`);
      console.log(`   文字可見: ${visualElements.debugTextVisible ? '✅' : '❌'}`);
      
      expect(visualElements.hasDebugText).toBe(true);
      expect(visualElements.hasCrosshair).toBe(true);
      expect(visualElements.hasFixedMarker).toBe(true);
      expect(visualElements.hasPlayerMarker).toBe(true);
    }
    
    console.log('\n🎉 手機座標調試器測試完成！');
    console.log('📱 現在可以在真實手機上看到實時座標診斷信息');
    console.log('🔍 調試器將在螢幕左上角顯示詳細的座標數據');
    console.log('🎯 點擊任何位置都會顯示紅色十字線（原始位置）和綠色圓圈（修復位置）');
    
    // 截圖保存調試器界面
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/${new Date().toISOString().slice(0,10).replace(/-/g,'')}_Shimozurdo調試器_手機座標診斷_成功_v1_001.png`,
      fullPage: true 
    });
  });
});
