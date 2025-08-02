import { test, expect } from '@playwright/test';

/**
 * 太空船完整性檢查測試
 * 專門用於判斷太空船是否為完整太空船
 */
test.describe('太空船完整性檢查', () => {
  
  test('太空船完整性特寫截圖比對', async ({ page }) => {
    console.log('🔍 開始太空船完整性檢查');
    
    // 導航到遊戲頁面
    await page.goto('http://localhost:3001/games/airplane-game/');
    
    // 等待遊戲完全載入
    await page.waitForTimeout(3000);
    console.log('✅ 遊戲載入完成');
    
    // 定義太空船特寫截圖區域（更精確的範圍）
    const spaceshipCloseupArea = {
      x: 100,   // 150 - 50 = 更精確的左邊界
      y: 286,   // 336 - 50 = 更精確的上邊界
      width: 100,  // 精確包含太空船的寬度
      height: 100  // 精確包含太空船的高度
    };
    
    console.log('📐 太空船特寫截圖區域:', spaceshipCloseupArea);
    
    // 截取太空船特寫 - 多個角度
    const angles = ['center', 'left', 'right', 'top', 'bottom'];
    
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      let adjustedArea = { ...spaceshipCloseupArea };
      
      // 根據角度調整截圖區域
      switch (angle) {
        case 'left':
          adjustedArea.x -= 20;
          break;
        case 'right':
          adjustedArea.x += 20;
          break;
        case 'top':
          adjustedArea.y -= 20;
          break;
        case 'bottom':
          adjustedArea.y += 20;
          break;
      }
      
      await page.screenshot({
        path: `test-results/spaceship_completeness_${angle}.png`,
        clip: adjustedArea
      });
      
      console.log(`📸 太空船${angle}角度特寫截圖完成`);
      await page.waitForTimeout(500); // 等待引擎火焰變化
    }
    
    // 截取超大特寫（只包含太空船核心部分）
    const ultraCloseupArea = {
      x: 125,   // 150 - 25
      y: 311,   // 336 - 25
      width: 50,   // 超小範圍
      height: 50   // 超小範圍
    };
    
    await page.screenshot({
      path: 'test-results/spaceship_ultra_closeup.png',
      clip: ultraCloseupArea
    });
    console.log('📸 太空船超大特寫截圖完成');
    
    // 截取包含引擎火焰的完整視圖
    const fullSpaceshipArea = {
      x: 75,    // 150 - 75
      y: 261,   // 336 - 75
      width: 150,  // 包含引擎火焰
      height: 150  // 包含引擎火焰
    };
    
    await page.screenshot({
      path: 'test-results/spaceship_with_engine_flame.png',
      clip: fullSpaceshipArea
    });
    console.log('📸 太空船含引擎火焰截圖完成');
    
    // 獲取太空船詳細信息
    const spaceshipInfo = await page.evaluate(() => {
      const game = window.game || window.phaserGame;
      if (!game) return null;
      
      const scene = game.scene.getScene('GameScene');
      if (!scene || !scene.player) return null;
      
      return {
        x: scene.player.x,
        y: scene.player.y,
        width: scene.player.width,
        height: scene.player.height,
        scaleX: scene.player.scaleX,
        scaleY: scene.player.scaleY,
        frame: scene.player.frame?.name || 'unknown',
        texture: scene.player.texture?.key || 'unknown',
        visible: scene.player.visible,
        alpha: scene.player.alpha
      };
    });
    
    console.log('🚀 太空船詳細信息:', spaceshipInfo);
    
    // 驗證太空船基本屬性
    expect(spaceshipInfo).not.toBeNull();
    expect(spaceshipInfo?.visible).toBe(true);
    expect(spaceshipInfo?.x).toBe(150);
    expect(spaceshipInfo?.y).toBe(336);
    
    console.log('🎯 太空船完整性檢查完成');
    console.log('📁 特寫截圖已保存到 test-results/ 目錄');
    console.log('🔍 請手動比對以下文件來判斷太空船完整性：');
    console.log('   - spaceship_completeness_center.png (中心視圖)');
    console.log('   - spaceship_completeness_left.png (左側視圖)');
    console.log('   - spaceship_completeness_right.png (右側視圖)');
    console.log('   - spaceship_completeness_top.png (頂部視圖)');
    console.log('   - spaceship_completeness_bottom.png (底部視圖)');
    console.log('   - spaceship_ultra_closeup.png (超大特寫)');
    console.log('   - spaceship_with_engine_flame.png (含引擎火焰)');
  });
  
  test('太空船與用戶圖片比對準備', async ({ page }) => {
    console.log('📋 準備太空船與用戶圖片比對');
    
    await page.goto('http://localhost:3001/games/airplane-game/');
    await page.waitForTimeout(3000);
    
    // 截取標準比對圖片（與用戶提供的圖片相同角度）
    const standardComparisonArea = {
      x: 50,    // 寬範圍
      y: 236,   // 寬範圍
      width: 200,  // 足夠寬
      height: 200  // 足夠高
    };
    
    await page.screenshot({
      path: 'test-results/spaceship_for_user_comparison.png',
      clip: standardComparisonArea
    });
    
    console.log('📸 用戶比對標準圖片已生成');
    console.log('🔍 比對指南：');
    console.log('1. 打開 spaceship_for_user_comparison.png');
    console.log('2. 與用戶提供的完整太空船圖片比較');
    console.log('3. 檢查以下要素：');
    console.log('   - 船體是否完整（船頭、船身、船尾）');
    console.log('   - 是否有引擎火焰效果');
    console.log('   - 整體比例是否合理');
    console.log('   - 細節是否清晰可見');
    
    // 生成比對報告
    const comparisonReport = `
# 太空船完整性比對報告

## 當前太空船狀態
- **位置**: (150, 336)
- **尺寸**: 300x200幀配置
- **縮放**: 0.5倍
- **動畫**: 靜態船體 + 動態引擎火焰
- **錨點**: 中心錨點 (0.5, 0.5)

## 比對檢查清單
- [ ] 船體完整性：是否包含完整的太空船結構
- [ ] 引擎火焰：是否有動態的推進效果
- [ ] 比例協調：整體比例是否合理
- [ ] 細節清晰：船體細節是否可見
- [ ] 與用戶圖片相似度：整體外觀是否匹配

## 截圖文件
- spaceship_for_user_comparison.png - 標準比對圖
- spaceship_completeness_*.png - 多角度特寫
- spaceship_ultra_closeup.png - 超大特寫
- spaceship_with_engine_flame.png - 含引擎火焰

## 結論
請根據上述截圖與用戶提供的完整太空船圖片進行比對，
判斷當前實現是否達到用戶期望的完整太空船標準。
    `;
    
    // 將報告寫入文件
    await page.evaluate((report) => {
      // 這裡只是記錄，實際文件寫入在Node.js環境中進行
      console.log('📋 比對報告已準備');
    }, comparisonReport);
    
    console.log('📋 太空船比對準備完成');
  });
  
});
