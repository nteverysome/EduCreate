import { test, expect } from '@playwright/test';

/**
 * 連續截圖系統 - 捕捉太空船動畫的每一幀變化
 * 用於判斷動畫是否為完整太空船
 */
test.describe('太空船動畫連續截圖系統', () => {
  
  test('連續截圖捕捉太空船動畫變化', async ({ page }) => {
    console.log('🎬 開始太空船動畫連續截圖捕捉');
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    
    // 等待遊戲完全載入
    await page.waitForTimeout(3000);
    console.log('✅ 遊戲載入完成');
    
    // 定義太空船截圖區域（以太空船中心點150,336為基準）
    const spaceshipClipArea = {
      x: 50,   // 150 - 100 = 左邊界（更大範圍）
      y: 236,  // 336 - 100 = 上邊界（更大範圍）
      width: 200,  // 足夠包含完整太空船的寬度
      height: 200  // 足夠包含完整太空船的高度
    };
    
    console.log('📐 截圖區域設定:', spaceshipClipArea);
    
    // 連續截圖 - 捕捉20幀動畫變化
    const totalFrames = 20;
    const frameInterval = 100; // 每100ms截一張圖
    
    console.log(`🎬 開始連續截圖 - 總共${totalFrames}幀，間隔${frameInterval}ms`);
    
    for (let i = 1; i <= totalFrames; i++) {
      // 截取當前幀
      await page.screenshot({
        path: `test-results/continuous_frame_${i.toString().padStart(2, '0')}.png`,
        clip: spaceshipClipArea
      });
      
      console.log(`📸 第${i}/${totalFrames}幀截圖完成`);
      
      // 等待下一幀
      if (i < totalFrames) {
        await page.waitForTimeout(frameInterval);
      }
    }
    
    // 截取完整場景作為參考
    await page.screenshot({
      path: 'test-results/continuous_full_scene.png'
    });
    console.log('📸 完整場景參考截圖完成');
    
    console.log('🎯 連續截圖捕捉完成');
    console.log('📁 截圖文件已保存到 test-results/ 目錄');
    console.log('🔍 請查看以下連續截圖文件：');
    for (let i = 1; i <= totalFrames; i++) {
      console.log(`   - continuous_frame_${i.toString().padStart(2, '0')}.png`);
    }
  });
  
  test('高頻連續截圖 - 捕捉動畫細節', async ({ page }) => {
    console.log('⚡ 開始高頻太空船動畫連續截圖');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForTimeout(3000);
    
    // 更小的截圖區域，專注於太空船
    const focusedClipArea = {
      x: 75,   // 150 - 75
      y: 261,  // 336 - 75
      width: 150,
      height: 150
    };
    
    // 高頻截圖 - 每50ms一張，總共30張
    const totalFrames = 30;
    const frameInterval = 50; // 50ms間隔，更高頻率
    
    console.log(`⚡ 高頻連續截圖 - 總共${totalFrames}幀，間隔${frameInterval}ms`);
    
    for (let i = 1; i <= totalFrames; i++) {
      await page.screenshot({
        path: `test-results/highfreq_frame_${i.toString().padStart(2, '0')}.png`,
        clip: focusedClipArea
      });
      
      console.log(`⚡ 高頻第${i}/${totalFrames}幀截圖完成`);
      
      if (i < totalFrames) {
        await page.waitForTimeout(frameInterval);
      }
    }
    
    console.log('⚡ 高頻連續截圖完成');
  });
  
  test('動畫週期完整捕捉', async ({ page }) => {
    console.log('🔄 開始動畫週期完整捕捉');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForTimeout(3000);
    
    // 太空船動畫是6fps，每幀167ms，3幀循環 = 501ms一個週期
    const animationCycleTime = 501; // 一個完整動畫週期
    const framesPerCycle = 18; // 每個週期截18張圖
    const frameInterval = Math.floor(animationCycleTime / framesPerCycle); // 約28ms間隔
    
    console.log(`🔄 動畫週期分析: 週期時間${animationCycleTime}ms，每週期${framesPerCycle}幀，間隔${frameInterval}ms`);
    
    const clipArea = {
      x: 75,
      y: 261,
      width: 150,
      height: 150
    };
    
    // 捕捉2個完整動畫週期
    const totalCycles = 2;
    const totalFrames = framesPerCycle * totalCycles;
    
    for (let i = 1; i <= totalFrames; i++) {
      const cycleNum = Math.ceil(i / framesPerCycle);
      const frameInCycle = ((i - 1) % framesPerCycle) + 1;
      
      await page.screenshot({
        path: `test-results/cycle_${cycleNum}_frame_${frameInCycle.toString().padStart(2, '0')}.png`,
        clip: clipArea
      });
      
      console.log(`🔄 週期${cycleNum} 第${frameInCycle}/${framesPerCycle}幀截圖完成`);
      
      if (i < totalFrames) {
        await page.waitForTimeout(frameInterval);
      }
    }
    
    console.log('🔄 動畫週期完整捕捉完成');
    console.log('📊 已捕捉2個完整動畫週期，可用於分析動畫是否為完整太空船');
  });
  
  test('太空船動畫狀態實時監控', async ({ page }) => {
    console.log('📊 開始太空船動畫狀態實時監控');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForTimeout(3000);
    
    // 監控動畫狀態並截圖
    const monitoringFrames = 15;
    const monitorInterval = 200; // 200ms間隔
    
    for (let i = 1; i <= monitoringFrames; i++) {
      // 獲取當前動畫狀態
      const animationState = await page.evaluate(() => {
        const game = window.game || window.phaserGame;
        if (!game) return null;
        
        const scene = game.scene.getScene('GameScene');
        if (!scene || !scene.player) return null;
        
        return {
          currentFrame: scene.player.anims?.currentFrame?.index || -1,
          isPlaying: scene.player.anims?.isPlaying || false,
          animationProgress: scene.player.anims?.getProgress() || 0,
          x: scene.player.x,
          y: scene.player.y,
          timestamp: Date.now()
        };
      });
      
      // 截圖並記錄狀態
      await page.screenshot({
        path: `test-results/monitor_${i.toString().padStart(2, '0')}_frame${animationState?.currentFrame || 'unknown'}.png`,
        clip: {
          x: 75,
          y: 261,
          width: 150,
          height: 150
        }
      });
      
      console.log(`📊 監控第${i}幀: 動畫幀${animationState?.currentFrame}, 進度${(animationState?.progress * 100).toFixed(1)}%, 位置(${animationState?.x}, ${animationState?.y})`);
      
      if (i < monitoringFrames) {
        await page.waitForTimeout(monitorInterval);
      }
    }
    
    console.log('📊 太空船動畫狀態實時監控完成');
  });
  
});
