/**
 * GameScene.ts 架構分析簡化驗證腳本
 * 
 * 目標: 驗證架構分析報告的準確性和完整性
 * 任務: Task 1.1.1 - 分析現有 GameScene.ts 架構
 * 狀態: 測試階段 (2/5)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 開始 GameScene.ts 架構分析驗證');

// 讀取測試數據
const gameScenePath = path.join(__dirname, '../../phaser3-plane-selector/src/game/scenes/GameScene.ts');
const reportPath = path.join(__dirname, '../../docs/technical-analysis/GameScene-Architecture-Analysis.md');

let gameSceneContent, analysisReport;
let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFn) {
  testsTotal++;
  try {
    testFn();
    console.log(`  ✅ ${testName}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${testName}: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected content to contain "${expected}"`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    }
  };
}

try {
  gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
  analysisReport = fs.readFileSync(reportPath, 'utf8');
  console.log('📁 測試文件讀取成功');
} catch (error) {
  console.error('❌ 測試文件讀取失敗:', error.message);
  process.exit(1);
}

// 射擊系統組件識別測試
console.log('\n🎯 射擊系統組件識別測試');

runTest('子彈群組系統識別', () => {
  expect(gameSceneContent).toContain('private bullets!: Phaser.GameObjects.Group');
  expect(gameSceneContent).toContain('this.bullets = this.physics.add.group');
  expect(analysisReport).toContain('子彈群組系統');
  expect(analysisReport).toContain('需要移除');
});

runTest('射擊邏輯識別', () => {
  expect(gameSceneContent).toContain('private handleShooting');
  expect(gameSceneContent).toContain('private fireBullet');
  expect(analysisReport).toContain('射擊邏輯');
  expect(analysisReport).toContain('handleShooting');
});

runTest('子彈碰撞檢測識別', () => {
  expect(gameSceneContent).toContain('this.physics.add.overlap(this.bullets, this.enemies');
  expect(analysisReport).toContain('子彈碰撞檢測');
  expect(analysisReport).toContain('改為玩家與雲朵的直接碰撞');
});

// 核心功能組件識別測試
console.log('\n⭐ 核心功能組件識別測試');

runTest('視差背景系統識別', () => {
  expect(gameSceneContent).toContain('private backgroundLayers');
  expect(gameSceneContent).toContain('createParallaxBackground');
  expect(analysisReport).toContain('視差背景系統 ⭐');
  expect(analysisReport).toContain('6層視差效果');
});

runTest('雲朵敵人系統識別', () => {
  expect(gameSceneContent).toContain('private enemies!: Phaser.GameObjects.Group');
  expect(gameSceneContent).toContain('private spawnEnemy');
  expect(analysisReport).toContain('雲朵敵人系統 ⭐');
  expect(analysisReport).toContain('英文單字的載體');
});

runTest('玩家控制系統識別', () => {
  expect(gameSceneContent).toContain('private handlePlayerMovement');
  expect(gameSceneContent).toContain('this.inputManager.getMovementVector');
  expect(analysisReport).toContain('玩家控制系統 ⭐');
});

runTest('物理系統識別', () => {
  expect(gameSceneContent).toContain('this.physics.add.existing(this.player)');
  expect(gameSceneContent).toContain('setCollideWorldBounds');
  expect(analysisReport).toContain('物理系統 ⭐');
});

runTest('HUD系統識別', () => {
  expect(gameSceneContent).toContain('private gameHUD!: GameHUD');
  expect(gameSceneContent).toContain('createGameHUD');
  expect(analysisReport).toContain('HUD 系統 ⭐');
});

// 碰撞檢測系統分析測試
console.log('\n💥 碰撞檢測系統分析測試');

runTest('現有碰撞檢測識別', () => {
  expect(gameSceneContent).toContain('this.physics.add.overlap(this.player, this.enemies');
  expect(gameSceneContent).toContain('this.hitPlayer');
  expect(analysisReport).toContain('現有玩家碰撞檢測');
  expect(analysisReport).toContain('修改方案');
});

runTest('碰撞處理邏輯分析', () => {
  expect(gameSceneContent).toContain('private hitPlayer');
  expect(gameSceneContent).toContain('this.playerHealth -= 20');
  expect(analysisReport).toContain('碰撞處理邏輯');
  expect(analysisReport).toContain('目標詞彙匹配邏輯');
});

// 技術依賴關係分析測試
console.log('\n🔗 技術依賴關係分析測試');

runTest('外部依賴識別', () => {
  expect(gameSceneContent).toContain('InputManager');
  expect(gameSceneContent).toContain('PlaneManager');
  expect(gameSceneContent).toContain('GameHUD');
  expect(analysisReport).toContain('外部依賴');
  expect(analysisReport).toContain('InputManager');
});

runTest('內部依賴分析', () => {
  expect(analysisReport).toContain('內部依賴');
  expect(analysisReport).toContain('視差背景 ↔ 更新循環');
  expect(analysisReport).toContain('雲朵系統 ↔ 物理引擎');
});

// 性能影響分析測試
console.log('\n⚡ 性能影響分析測試');

runTest('性能提升點分析', () => {
  expect(analysisReport).toContain('性能提升點');
  expect(analysisReport).toContain('移除子彈系統');
  expect(analysisReport).toContain('簡化碰撞檢測');
});

runTest('性能考慮點分析', () => {
  expect(analysisReport).toContain('性能考慮點');
  expect(analysisReport).toContain('文字渲染');
  expect(analysisReport).toContain('中文提示');
});

// 修改複雜度評估測試
console.log('\n📊 修改複雜度評估測試');

runTest('複雜度評估表格', () => {
  expect(analysisReport).toContain('修改複雜度評估');
  expect(analysisReport).toContain('子彈系統');
  expect(analysisReport).toContain('碰撞檢測');
  expect(analysisReport).toContain('預估工時');
});

runTest('總計預估時間', () => {
  expect(analysisReport).toContain('總計預估');
  expect(analysisReport).toContain('21小時');
});

// 行動計劃測試
console.log('\n📋 行動計劃測試');

runTest('分階段行動計劃', () => {
  expect(analysisReport).toContain('下一步行動計劃');
  expect(analysisReport).toContain('Phase 1');
  expect(analysisReport).toContain('Phase 2');
  expect(analysisReport).toContain('Phase 3');
  expect(analysisReport).toContain('Phase 4');
});

runTest('優先級標記', () => {
  expect(analysisReport).toContain('優先級: 高');
  expect(analysisReport).toContain('優先級: 中');
});

// 報告完整性測試
console.log('\n📄 報告完整性測試');

runTest('必要章節檢查', () => {
  const requiredSections = [
    '執行摘要',
    '架構組件分析',
    '技術依賴關係分析',
    '性能影響分析',
    '修改複雜度評估',
    '下一步行動計劃',
    '驗證檢查清單'
  ];
  
  requiredSections.forEach(section => {
    expect(analysisReport).toContain(section);
  });
});

runTest('任務信息檢查', () => {
  expect(analysisReport).toContain('Task 1.1.1');
  expect(analysisReport).toContain('2025-01-24');
  expect(analysisReport).toContain('開發階段 (1/5)');
});

// 性能測試
console.log('\n🚀 性能測試');

runTest('報告文件大小合理性', () => {
  const stats = fs.statSync(reportPath);
  expect(stats.size).toBeGreaterThan(5 * 1024);  // 大於 5KB (調整為更合理的標準)
  expect(stats.size).toBeLessThan(50 * 1024);    // 小於 50KB (調整上限)

  // 額外的內容質量檢查
  const content = fs.readFileSync(reportPath, 'utf8');
  const lineCount = content.split('\n').length;
  expect(lineCount).toBeGreaterThan(200); // 確保內容行數充足
});

// 測試結果統計
console.log('\n📊 測試結果統計');
console.log(`✅ 通過測試: ${testsPassed}/${testsTotal}`);
console.log(`📈 成功率: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 所有測試通過！架構分析報告驗證成功');
  console.log('✅ Task 1.1.1 測試階段 (2/5) 完成');
  process.exit(0);
} else {
  console.log('\n❌ 部分測試失敗，需要修復分析報告');
  process.exit(1);
}
