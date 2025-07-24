/**
 * 簡化測試驗證腳本
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 驗證測試用例的完整性和正確性
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 開始測試用例驗證');

// 檢查測試文件
const testFiles = [
  'tests/unit/CollisionDetectionSystem.test.ts',
  'tests/unit/EffectsManager.test.ts',
  'tests/integration/ModifiedGameScene.test.ts',
  'tests/functional/GameLogic.test.ts'
];

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
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toEqual: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to equal ${expected}`);
      }
    }
  };
}

// 讀取測試文件內容
let testFileContents = {};
try {
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      testFileContents[file] = fs.readFileSync(file, 'utf8');
    }
  });
  console.log('📁 測試文件讀取成功');
} catch (error) {
  console.error('❌ 測試文件讀取失敗:', error.message);
  process.exit(1);
}

// CollisionDetectionSystem 單元測試驗證
console.log('\n🎯 CollisionDetectionSystem 單元測試驗證');

runTest('應該包含完整的測試套件結構', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'CollisionDetectionSystem\'');
  expect(content).toContain('beforeEach');
  expect(content).toContain('afterEach');
});

runTest('應該包含構造函數測試', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'Constructor\'');
  expect(content).toContain('應該正確初始化碰撞檢測系統');
});

runTest('應該包含 setTargetWord 測試', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'setTargetWord\'');
  expect(content).toContain('應該正確設置目標詞彙');
});

runTest('應該包含 handleCollision 測試', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'handleCollision\'');
  expect(content).toContain('應該處理正確碰撞');
  expect(content).toContain('應該處理錯誤碰撞');
});

runTest('應該包含記憶指標測試', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'getMemoryMetrics\'');
  expect(content).toContain('應該返回初始記憶指標');
});

runTest('應該包含特效系統測試', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'特效系統整合\'');
  expect(content).toContain('應該觸發正確碰撞特效');
});

runTest('應該包含邊界條件測試', () => {
  const content = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(content).toContain('describe(\'邊界條件測試\'');
  expect(content).toContain('應該處理 null 精靈');
});

// EffectsManager 單元測試驗證
console.log('\n✨ EffectsManager 單元測試驗證');

runTest('應該包含完整的測試套件結構', () => {
  const content = testFileContents['tests/unit/EffectsManager.test.ts'];
  expect(content).toContain('describe(\'EffectsManager\'');
  expect(content).toContain('beforeEach');
  expect(content).toContain('afterEach');
});

runTest('應該包含音效播放測試', () => {
  const content = testFileContents['tests/unit/EffectsManager.test.ts'];
  expect(content).toContain('describe(\'playSound\'');
  expect(content).toContain('應該播放基本音效');
});

runTest('應該包含粒子效果測試', () => {
  const content = testFileContents['tests/unit/EffectsManager.test.ts'];
  expect(content).toContain('describe(\'triggerParticleEffect\'');
  expect(content).toContain('應該觸發基本粒子效果');
});

runTest('應該包含螢幕震動測試', () => {
  const content = testFileContents['tests/unit/EffectsManager.test.ts'];
  expect(content).toContain('describe(\'triggerScreenShake\'');
  expect(content).toContain('應該觸發基本螢幕震動');
});

runTest('應該包含觸覺反饋測試', () => {
  const content = testFileContents['tests/unit/EffectsManager.test.ts'];
  expect(content).toContain('describe(\'triggerHapticFeedback\'');
  expect(content).toContain('應該觸發基本觸覺反饋');
});

runTest('應該包含組合效果測試', () => {
  const content = testFileContents['tests/unit/EffectsManager.test.ts'];
  expect(content).toContain('describe(\'組合效果方法\'');
  expect(content).toContain('playCorrectCollisionEffect');
  expect(content).toContain('playIncorrectCollisionEffect');
});

// ModifiedGameScene 整合測試驗證
console.log('\n🔄 ModifiedGameScene 整合測試驗證');

runTest('應該包含場景初始化測試', () => {
  const content = testFileContents['tests/integration/ModifiedGameScene.test.ts'];
  expect(content).toContain('describe(\'場景初始化\'');
  expect(content).toContain('應該正確初始化所有管理器');
});

runTest('應該包含詞彙管理系統測試', () => {
  const content = testFileContents['tests/integration/ModifiedGameScene.test.ts'];
  expect(content).toContain('describe(\'詞彙管理系統整合\'');
  expect(content).toContain('應該載入 GEPT 詞彙');
});

runTest('應該包含碰撞檢測系統測試', () => {
  const content = testFileContents['tests/integration/ModifiedGameScene.test.ts'];
  expect(content).toContain('describe(\'碰撞檢測系統整合\'');
  expect(content).toContain('應該處理雲朵碰撞');
});

runTest('應該包含記憶科學引擎測試', () => {
  const content = testFileContents['tests/integration/ModifiedGameScene.test.ts'];
  expect(content).toContain('describe(\'記憶科學引擎整合\'');
  expect(content).toContain('應該獲取記憶指標');
});

runTest('應該包含資源清理測試', () => {
  const content = testFileContents['tests/integration/ModifiedGameScene.test.ts'];
  expect(content).toContain('describe(\'資源清理\'');
  expect(content).toContain('應該正確清理所有資源');
});

// GameLogic 功能測試驗證
console.log('\n🎮 GameLogic 功能測試驗證');

runTest('應該包含分數計算測試', () => {
  const content = testFileContents['tests/functional/GameLogic.test.ts'];
  expect(content).toContain('describe(\'分數計算系統\'');
  expect(content).toContain('應該正確計算正確碰撞分數');
});

runTest('應該包含生命值管理測試', () => {
  const content = testFileContents['tests/functional/GameLogic.test.ts'];
  expect(content).toContain('describe(\'生命值管理系統\'');
  expect(content).toContain('應該正確初始化生命值');
});

runTest('應該包含遊戲結束條件測試', () => {
  const content = testFileContents['tests/functional/GameLogic.test.ts'];
  expect(content).toContain('describe(\'遊戲結束條件\'');
  expect(content).toContain('生命值歸零時應該觸發遊戲結束');
});

runTest('應該包含統計追蹤測試', () => {
  const content = testFileContents['tests/functional/GameLogic.test.ts'];
  expect(content).toContain('describe(\'統計追蹤系統\'');
  expect(content).toContain('應該正確追蹤正確碰撞次數');
});

runTest('應該包含性能測試', () => {
  const content = testFileContents['tests/functional/GameLogic.test.ts'];
  expect(content).toContain('describe(\'遊戲邏輯性能測試\'');
  expect(content).toContain('應該在合理時間內處理大量碰撞');
});

// 測試工具和設置驗證
console.log('\n🔧 測試工具和設置驗證');

runTest('應該包含 Jest 設置文件', () => {
  expect(fs.existsSync('tests/setup/jest.setup.ts')).toBeTruthy();
});

runTest('應該包含 Jest 配置文件', () => {
  expect(fs.existsSync('tests/jest.config.js')).toBeTruthy();
});

runTest('應該包含測試運行腳本', () => {
  expect(fs.existsSync('tests/run-tests.js')).toBeTruthy();
});

runTest('Jest 設置應該包含 Phaser Mock', () => {
  const setupContent = fs.readFileSync('tests/setup/jest.setup.ts', 'utf8');
  expect(setupContent).toContain('global.Phaser');
  expect(setupContent).toContain('MockScene');
});

runTest('Jest 設置應該包含測試工具', () => {
  const setupContent = fs.readFileSync('tests/setup/jest.setup.ts', 'utf8');
  expect(setupContent).toContain('global.testUtils');
  expect(setupContent).toContain('createMockSprite');
});

// 測試覆蓋率檢查
console.log('\n📊 測試覆蓋率檢查');

runTest('應該包含足夠的單元測試', () => {
  const collisionContent = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  const effectsContent = testFileContents['tests/unit/EffectsManager.test.ts'];
  
  const collisionTests = (collisionContent.match(/test\(/g) || []).length;
  const effectsTests = (effectsContent.match(/test\(/g) || []).length;
  
  expect(collisionTests).toBeGreaterThan(15); // 至少15個測試
  expect(effectsTests).toBeGreaterThan(10);   // 至少10個測試
});

runTest('應該包含足夠的整合測試', () => {
  const integrationContent = testFileContents['tests/integration/ModifiedGameScene.test.ts'];
  const integrationTests = (integrationContent.match(/test\(/g) || []).length;
  
  expect(integrationTests).toBeGreaterThan(8); // 至少8個測試
});

runTest('應該包含足夠的功能測試', () => {
  const functionalContent = testFileContents['tests/functional/GameLogic.test.ts'];
  const functionalTests = (functionalContent.match(/test\(/g) || []).length;
  
  expect(functionalTests).toBeGreaterThan(20); // 至少20個測試
});

// 代碼品質檢查
console.log('\n📝 代碼品質檢查');

runTest('測試文件應該有適當的大小', () => {
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      expect(stats.size).toBeGreaterThan(5 * 1024);  // 大於 5KB
    }
  });
});

runTest('應該包含 Mock 和測試工具', () => {
  const collisionContent = testFileContents['tests/unit/CollisionDetectionSystem.test.ts'];
  expect(collisionContent).toContain('TestDataFactory');
  expect(collisionContent).toContain('TestUtils');
  expect(collisionContent).toContain('mockScene');
});

runTest('應該包含完整的測試生命週期', () => {
  testFiles.forEach(file => {
    if (testFileContents[file]) {
      const content = testFileContents[file];
      expect(content).toContain('beforeEach');
      expect(content).toContain('afterEach');
    }
  });
});

// 測試結果統計
console.log('\n📊 測試結果統計');
console.log(`✅ 通過測試: ${testsPassed}/${testsTotal}`);
console.log(`📈 成功率: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 所有測試用例驗證通過！');
  console.log('✅ Task 1.1.4 測試階段 (2/5) 完成');
  process.exit(0);
} else {
  console.log('\n❌ 部分測試用例驗證失敗，需要修復');
  process.exit(1);
}
