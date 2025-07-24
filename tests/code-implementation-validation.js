/**
 * 代碼實現驗證腳本
 * 
 * 任務: Task 1.1.5 - 代碼實現和驗證
 * 目標: 驗證 AirplaneCollisionGame 組件的代碼實現完整性
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 開始代碼實現驗證');

// 檢查的文件列表
const implementationFiles = [
  'components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx',
  'components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts',
  'components/games/AirplaneCollisionGame/EffectsManager.ts',
  'components/games/AirplaneCollisionGame/ModifiedGameScene.ts'
];

let checksTotal = 0;
let checksPassed = 0;

function runCheck(checkName, checkFn) {
  checksTotal++;
  try {
    checkFn();
    console.log(`  ✅ ${checkName}`);
    checksPassed++;
  } catch (error) {
    console.log(`  ❌ ${checkName}: ${error.message}`);
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

// 讀取實現文件內容
let implementationContents = {};
try {
  implementationFiles.forEach(file => {
    if (fs.existsSync(file)) {
      implementationContents[file] = fs.readFileSync(file, 'utf8');
    }
  });
  console.log('📁 實現文件讀取成功');
} catch (error) {
  console.error('❌ 實現文件讀取失敗:', error.message);
  process.exit(1);
}

// AirplaneCollisionGame 主組件驗證
console.log('\n🎮 AirplaneCollisionGame 主組件驗證');

runCheck('應該包含 React 組件類定義', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  expect(content).toContain('export class AirplaneCollisionGame');
  expect(content).toContain('extends React.Component');
});

runCheck('應該實現 MemoryGameTemplate 接口', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  expect(content).toContain('implements MemoryGameTemplate');
  expect(content).toContain('public readonly id');
  expect(content).toContain('public readonly name');
  expect(content).toContain('public readonly memoryPrinciple');
});

runCheck('應該包含 Phaser 遊戲初始化', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  expect(content).toContain('initializeGame');
  expect(content).toContain('new Phaser.Game');
  expect(content).toContain('ModifiedGameScene');
});

runCheck('應該包含遊戲控制方法', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  expect(content).toContain('startGame');
  expect(content).toContain('pauseGame');
  expect(content).toContain('resumeGame');
  expect(content).toContain('restartGame');
});

runCheck('應該包含事件處理器', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  expect(content).toContain('handleGameStart');
  expect(content).toContain('handleScoreUpdate');
  expect(content).toContain('handleWordLearned');
  expect(content).toContain('handleGameEnd');
});

runCheck('應該包含 render 方法', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  expect(content).toContain('render()');
  expect(content).toContain('return');
  expect(content).toContain('game-container');
});

// CollisionDetectionSystem 驗證
console.log('\n🎯 CollisionDetectionSystem 驗證');

runCheck('應該包含 CollisionDetectionSystem 類', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  expect(content).toContain('export class CollisionDetectionSystem');
});

runCheck('應該包含核心方法', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  expect(content).toContain('setTargetWord');
  expect(content).toContain('handleCollision');
  expect(content).toContain('getMemoryMetrics');
  expect(content).toContain('resetStatistics');
  expect(content).toContain('destroy');
});

runCheck('應該包含特效系統整合', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  expect(content).toContain('triggerCollisionEffects');
  expect(content).toContain('triggerParticleEffect');
  expect(content).toContain('triggerScreenShake');
});

runCheck('應該包含統計追蹤', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  expect(content).toContain('collisionHistory');
  expect(content).toContain('correctCollisions');
  expect(content).toContain('incorrectCollisions');
});

runCheck('應該包含記憶指標計算', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  expect(content).toContain('MemoryMetrics');
  expect(content).toContain('responseTime');
  expect(content).toContain('accuracyRate');
  expect(content).toContain('cognitiveLoadLevel');
});

// EffectsManager 驗證
console.log('\n✨ EffectsManager 驗證');

runCheck('應該包含 EffectsManager 類', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  expect(content).toContain('export class EffectsManager');
});

runCheck('應該包含音效管理', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  expect(content).toContain('playSound');
  expect(content).toContain('AudioConfig');
  expect(content).toContain('loadedSounds');
});

runCheck('應該包含視覺效果管理', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  expect(content).toContain('triggerParticleEffect');
  expect(content).toContain('triggerScreenShake');
  expect(content).toContain('triggerFlashEffect');
  expect(content).toContain('VisualEffectConfig');
});

runCheck('應該包含觸覺反饋', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  expect(content).toContain('triggerHapticFeedback');
  expect(content).toContain('HapticConfig');
  expect(content).toContain('navigator.vibrate');
});

runCheck('應該包含組合效果方法', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  expect(content).toContain('playCorrectCollisionEffect');
  expect(content).toContain('playIncorrectCollisionEffect');
  expect(content).toContain('playNeutralCollisionEffect');
});

// ModifiedGameScene 驗證
console.log('\n🎬 ModifiedGameScene 驗證');

runCheck('應該包含 ModifiedGameScene 類', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/ModifiedGameScene.ts'];
  expect(content).toContain('export class ModifiedGameScene');
  expect(content).toContain('extends Phaser.Scene');
});

runCheck('應該包含場景生命週期方法', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/ModifiedGameScene.ts'];
  expect(content).toContain('create');
  expect(content).toContain('update');
});

runCheck('應該包含遊戲物件管理', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/ModifiedGameScene.ts'];
  expect(content).toContain('player');
  expect(content).toContain('enemies');
  expect(content).toContain('physics');
});

runCheck('應該包含碰撞檢測整合', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/ModifiedGameScene.ts'];
  expect(content).toContain('CollisionDetectionSystem');
  expect(content).toContain('overlap');
});

// 文件大小和複雜度檢查
console.log('\n📊 文件大小和複雜度檢查');

runCheck('AirplaneCollisionGame 應該有適當的大小', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  const lines = content.split('\n').length;
  expect(lines).toBeGreaterThan(200); // 至少200行
});

runCheck('CollisionDetectionSystem 應該有適當的大小', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  const lines = content.split('\n').length;
  expect(lines).toBeGreaterThan(300); // 至少300行
});

runCheck('EffectsManager 應該有適當的大小', () => {
  const content = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  const lines = content.split('\n').length;
  expect(lines).toBeGreaterThan(250); // 至少250行
});

// TypeScript 類型檢查
console.log('\n🔧 TypeScript 類型檢查');

runCheck('應該包含完整的接口定義', () => {
  const collisionContent = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  const effectsContent = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  
  expect(collisionContent).toContain('export interface CollisionEvent');
  expect(collisionContent).toContain('export interface CollisionEffectConfig');
  expect(effectsContent).toContain('export interface AudioConfig');
  expect(effectsContent).toContain('export interface VisualEffectConfig');
});

runCheck('應該包含正確的導入語句', () => {
  const airplaneContent = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  
  expect(airplaneContent).toContain("import React");
  expect(airplaneContent).toContain("import * as Phaser");
  expect(airplaneContent).toContain("from './ModifiedGameScene'");
});

runCheck('應該包含正確的導出語句', () => {
  const collisionContent = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  const effectsContent = implementationContents['components/games/AirplaneCollisionGame/EffectsManager.ts'];
  
  expect(collisionContent).toContain('export class CollisionDetectionSystem');
  expect(collisionContent).toContain('export default CollisionDetectionSystem');
  expect(effectsContent).toContain('export class EffectsManager');
});

// 記憶科學整合檢查
console.log('\n🧠 記憶科學整合檢查');

runCheck('應該整合 GEPT 詞彙系統', () => {
  const airplaneContent = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  const collisionContent = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  
  expect(airplaneContent).toContain('GEPTLevel');
  expect(airplaneContent).toContain('GEPTWord');
  expect(collisionContent).toContain('GEPTLevel');
});

runCheck('應該整合記憶增強引擎', () => {
  const airplaneContent = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  const collisionContent = implementationContents['components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts'];
  
  expect(airplaneContent).toContain('MemoryMetrics');
  expect(collisionContent).toContain('MemoryMetrics');
});

runCheck('應該包含記憶科學原理', () => {
  const airplaneContent = implementationContents['components/games/AirplaneCollisionGame/AirplaneCollisionGame.tsx'];
  
  expect(airplaneContent).toContain('memoryPrinciple');
  expect(airplaneContent).toContain('active-recall');
  expect(airplaneContent).toContain('spaced-repetition');
});

// 測試結果統計
console.log('\n📊 代碼實現驗證結果');
console.log(`✅ 通過檢查: ${checksPassed}/${checksTotal}`);
console.log(`📈 成功率: ${((checksPassed / checksTotal) * 100).toFixed(1)}%`);

if (checksPassed === checksTotal) {
  console.log('\n🎉 所有代碼實現驗證通過！');
  console.log('✅ Task 1.1.5 代碼實現階段 (1/5) 完成');
  process.exit(0);
} else {
  console.log('\n❌ 部分代碼實現驗證失敗，需要修復');
  process.exit(1);
}
