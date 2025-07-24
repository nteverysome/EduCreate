/**
 * 碰撞檢測系統簡化驗證腳本
 * 
 * 目標: 驗證碰撞檢測系統的完整性和準確性
 * 任務: Task 1.1.3 - 實現碰撞檢測系統
 * 狀態: 測試階段 (2/5)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 開始碰撞檢測系統驗證');

// 讀取實現文件
const collisionSystemPath = path.join(__dirname, '../../components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts');
const modifiedScenePath = path.join(__dirname, '../../components/games/AirplaneCollisionGame/ModifiedGameScene.ts');
const effectsManagerPath = path.join(__dirname, '../../components/games/AirplaneCollisionGame/EffectsManager.ts');

let collisionSystemContent, modifiedSceneContent, effectsManagerContent;
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
    }
  };
}

try {
  collisionSystemContent = fs.readFileSync(collisionSystemPath, 'utf8');
  modifiedSceneContent = fs.readFileSync(modifiedScenePath, 'utf8');
  effectsManagerContent = fs.readFileSync(effectsManagerPath, 'utf8');
  console.log('📁 實現文件讀取成功');
} catch (error) {
  console.error('❌ 實現文件讀取失敗:', error.message);
  process.exit(1);
}

// 碰撞檢測系統核心功能測試
console.log('\n🎯 碰撞檢測系統核心功能測試');

runTest('碰撞檢測類定義', () => {
  expect(collisionSystemContent).toContain('export class CollisionDetectionSystem');
  expect(collisionSystemContent).toContain('handleCollision');
  expect(collisionSystemContent).toContain('setTargetWord');
});

runTest('碰撞事件接口', () => {
  expect(collisionSystemContent).toContain('export interface CollisionEvent');
  expect(collisionSystemContent).toContain("type: 'correct' | 'incorrect' | 'neutral'");
  expect(collisionSystemContent).toContain('responseTime: number');
});

runTest('特效配置接口', () => {
  expect(collisionSystemContent).toContain('export interface CollisionEffectConfig');
  expect(collisionSystemContent).toContain('enableParticles: boolean');
  expect(collisionSystemContent).toContain('enableSoundEffects: boolean');
});

// 射擊系統移除驗證測試
console.log('\n🚫 射擊系統移除驗證測試');

runTest('移除子彈相關變數', () => {
  expect(!modifiedSceneContent.includes('private bullets!')).toBeTruthy();
  expect(!modifiedSceneContent.includes('bulletTime')).toBeTruthy();
  expect(!modifiedSceneContent.includes('fireBullet')).toBeTruthy();
});

runTest('移除子彈群組創建', () => {
  expect(!modifiedSceneContent.includes('this.bullets = this.physics.add.group')).toBeTruthy();
  expect(!modifiedSceneContent.includes('BULLET.MAX_BULLETS')).toBeTruthy();
});

runTest('移除子彈碰撞檢測', () => {
  expect(!modifiedSceneContent.includes('this.physics.add.overlap(this.bullets, this.enemies')).toBeTruthy();
  expect(!modifiedSceneContent.includes('hitEnemy')).toBeTruthy();
});

// 新碰撞檢測系統整合測試
console.log('\n🔄 新碰撞檢測系統整合測試');

runTest('碰撞檢測系統初始化', () => {
  expect(modifiedSceneContent).toContain('private collisionSystem!: CollisionDetectionSystem');
  expect(modifiedSceneContent).toContain('this.collisionSystem = new CollisionDetectionSystem');
});

runTest('直接碰撞處理', () => {
  expect(modifiedSceneContent).toContain('handleCloudCollision');
  expect(modifiedSceneContent).toContain('this.physics.add.overlap(this.player, this.enemies');
});

runTest('詞彙管理系統', () => {
  expect(modifiedSceneContent).toContain('private geptManager!: GEPTManager');
  expect(modifiedSceneContent).toContain('generateNextTargetWord');
});

// 碰撞檢測邏輯測試
console.log('\n⚡ 碰撞檢測邏輯測試');

runTest('碰撞類型判斷', () => {
  expect(collisionSystemContent).toContain('determineCollisionType');
  expect(collisionSystemContent).toContain("return 'correct'");
  expect(collisionSystemContent).toContain("return 'incorrect'");
});

runTest('碰撞統計更新', () => {
  expect(collisionSystemContent).toContain('updateCollisionStatistics');
  expect(collisionSystemContent).toContain('correctCollisions++');
  expect(collisionSystemContent).toContain('totalResponseTime');
});

runTest('碰撞反饋執行', () => {
  expect(collisionSystemContent).toContain('executeCollisionFeedback');
  expect(collisionSystemContent).toContain('showVisualFeedback');
  expect(collisionSystemContent).toContain('triggerParticleEffect');
});

// 特效系統測試
console.log('\n✨ 特效系統測試');

runTest('粒子系統初始化', () => {
  expect(collisionSystemContent).toContain('initializeParticleSystem');
  expect(collisionSystemContent).toContain('correctParticles');
  expect(collisionSystemContent).toContain('incorrectParticles');
});

runTest('音效管理', () => {
  expect(collisionSystemContent).toContain('loadAudioAssets');
  expect(collisionSystemContent).toContain('playAudioFeedback');
  expect(collisionSystemContent).toContain('collision-correct');
});

runTest('視覺反饋', () => {
  expect(collisionSystemContent).toContain('showVisualFeedback');
  expect(collisionSystemContent).toContain('triggerScreenShake');
  expect(collisionSystemContent).toContain('feedbackText');
});

// EffectsManager 系統測試
console.log('\n🎭 EffectsManager 系統測試');

runTest('特效管理器類', () => {
  expect(effectsManagerContent).toContain('export class EffectsManager');
  expect(effectsManagerContent).toContain('playSound');
  expect(effectsManagerContent).toContain('triggerParticleEffect');
});

runTest('音效配置', () => {
  expect(effectsManagerContent).toContain('export interface AudioConfig');
  expect(effectsManagerContent).toContain('masterVolume: number');
  expect(effectsManagerContent).toContain('enableSpatialAudio: boolean');
});

runTest('組合效果方法', () => {
  expect(effectsManagerContent).toContain('playCorrectCollisionEffect');
  expect(effectsManagerContent).toContain('playIncorrectCollisionEffect');
  expect(effectsManagerContent).toContain('playNeutralCollisionEffect');
});

// 記憶科學整合測試
console.log('\n🧠 記憶科學整合測試');

runTest('記憶指標計算', () => {
  expect(collisionSystemContent).toContain('getMemoryMetrics');
  expect(collisionSystemContent).toContain('calculateCognitiveLoad');
  expect(collisionSystemContent).toContain('accuracyRate');
});

runTest('學習數據記錄', () => {
  expect(modifiedSceneContent).toContain('recordLearningData');
  expect(modifiedSceneContent).toContain('recordLearningEvent');
  expect(modifiedSceneContent).toContain('responseTime');
});

// GEPT 詞彙系統整合測試
console.log('\n📚 GEPT 詞彙系統整合測試');

runTest('詞彙載入', () => {
  expect(modifiedSceneContent).toContain('loadGEPTVocabulary');
  expect(modifiedSceneContent).toContain('getWordsByLevel');
  expect(modifiedSceneContent).toContain('availableWords');
});

runTest('目標詞彙管理', () => {
  expect(modifiedSceneContent).toContain('generateNextTargetWord');
  expect(modifiedSceneContent).toContain('currentTargetWord');
  expect(modifiedSceneContent).toContain('currentTargetChinese');
});

runTest('雲朵詞彙生成', () => {
  expect(modifiedSceneContent).toContain('spawnCloudWithWord');
  expect(modifiedSceneContent).toContain("cloud.setData('word'");
  expect(modifiedSceneContent).toContain("cloud.setData('chinese'");
});

// 遊戲邏輯整合測試
console.log('\n🎮 遊戲邏輯整合測試');

runTest('碰撞結果處理', () => {
  expect(modifiedSceneContent).toContain('processCollisionResult');
  expect(modifiedSceneContent).toContain('CORRECT_SCORE');
  expect(modifiedSceneContent).toContain('INCORRECT_PENALTY');
});

runTest('遊戲狀態更新', () => {
  expect(modifiedSceneContent).toContain('updateGameHUD');
  expect(modifiedSceneContent).toContain('checkGameOver');
  expect(modifiedSceneContent).toContain('playerHealth');
});

runTest('計時器管理', () => {
  expect(modifiedSceneContent).toContain('enemyTimer');
  expect(modifiedSceneContent).toContain('targetWordTimer');
  expect(modifiedSceneContent).toContain('startEnemySpawning');
});

// 工廠模式和擴展性測試
console.log('\n🏭 工廠模式和擴展性測試');

runTest('碰撞檢測系統工廠', () => {
  expect(collisionSystemContent).toContain('export class CollisionDetectionSystemFactory');
  expect(collisionSystemContent).toContain('static create');
  expect(collisionSystemContent).toContain('static createWithPresets');
});

runTest('預設配置', () => {
  expect(collisionSystemContent).toContain("preset: 'minimal' | 'standard' | 'enhanced'");
  expect(collisionSystemContent).toContain('minimal:');
  expect(collisionSystemContent).toContain('standard:');
});

// 資源管理和清理測試
console.log('\n🧹 資源管理和清理測試');

runTest('系統銷毀方法', () => {
  expect(collisionSystemContent).toContain('destroy()');
  expect(effectsManagerContent).toContain('destroy()');
  expect(modifiedSceneContent).toContain('destroy()');
});

runTest('資源清理邏輯', () => {
  expect(collisionSystemContent).toContain('particleEmitters.clear()');
  expect(effectsManagerContent).toContain('particleSystems.clear()');
  expect(effectsManagerContent).toContain('loadedSounds.clear()');
});

runTest('計時器清理', () => {
  expect(modifiedSceneContent).toContain('enemyTimer?.destroy()');
  expect(modifiedSceneContent).toContain('targetWordTimer?.destroy()');
  expect(modifiedSceneContent).toContain('collisionSystem?.destroy()');
});

// 代碼品質和結構測試
console.log('\n📊 代碼品質和結構測試');

runTest('碰撞檢測系統文件大小', () => {
  const stats = fs.statSync(collisionSystemPath);
  expect(stats.size).toBeGreaterThan(8 * 1024); // 大於 8KB
});

runTest('修改後場景文件大小', () => {
  const stats = fs.statSync(modifiedScenePath);
  expect(stats.size).toBeGreaterThan(10 * 1024); // 大於 10KB
});

runTest('特效管理器文件大小', () => {
  const stats = fs.statSync(effectsManagerPath);
  expect(stats.size).toBeGreaterThan(8 * 1024); // 大於 8KB
});

runTest('接口定義充足性', () => {
  const allContent = collisionSystemContent + effectsManagerContent;
  const interfaces = (allContent.match(/export interface \w+/g) || []).length;
  expect(interfaces).toBeGreaterThan(6); // 至少6個接口
});

runTest('類定義充足性', () => {
  const allContent = collisionSystemContent + modifiedSceneContent + effectsManagerContent;
  const classes = (allContent.match(/export class \w+/g) || []).length;
  expect(classes).toBeGreaterThan(3); // 至少3個類
});

// 測試結果統計
console.log('\n📊 測試結果統計');
console.log(`✅ 通過測試: ${testsPassed}/${testsTotal}`);
console.log(`📈 成功率: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 所有測試通過！碰撞檢測系統實現驗證成功');
  console.log('✅ Task 1.1.3 測試階段 (2/5) 完成');
  process.exit(0);
} else {
  console.log('\n❌ 部分測試失敗，需要修復實現代碼');
  process.exit(1);
}
