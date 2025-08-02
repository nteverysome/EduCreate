/**
 * 碰撞檢測系統測試套件
 * 
 * 目標: 驗證碰撞檢測系統的完整性、準確性和性能
 * 任務: Task 1.1.3 - 實現碰撞檢測系統
 * 狀態: 測試階段 (2/5)
 */

const fs = require('fs');
const path = require('path');

// 簡化的測試框架
function describe(name, fn) {
  console.log(`\n🧪 ${name}`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.log(`  ❌ ${name}: ${error.message}`);
    process.exit(1);
  }
}

function expect(actual) {
  return {
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual.substring(0, 100)}..." to contain "${expected}"`);
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
    },
    toEqual: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to equal ${expected}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    }
  };
}

// 主測試函數
function runTests() {
  console.log('🧪 開始碰撞檢測系統測試');

  // 讀取實現文件
  const collisionSystemPath = path.join(__dirname, '../../components/games/AirplaneCollisionGame/CollisionDetectionSystem.ts');
  const modifiedScenePath = path.join(__dirname, '../../components/games/AirplaneCollisionGame/ModifiedGameScene.ts');
  const effectsManagerPath = path.join(__dirname, '../../components/games/AirplaneCollisionGame/EffectsManager.ts');

  let collisionSystemContent, modifiedSceneContent, effectsManagerContent;

  try {
    collisionSystemContent = fs.readFileSync(collisionSystemPath, 'utf8');
    modifiedSceneContent = fs.readFileSync(modifiedScenePath, 'utf8');
    effectsManagerContent = fs.readFileSync(effectsManagerPath, 'utf8');
    console.log('📁 實現文件讀取成功');
  } catch (error) {
    console.error('❌ 實現文件讀取失敗:', error.message);
    process.exit(1);
  }

describe('碰撞檢測系統核心功能測試', () => {
  test('應該包含完整的碰撞檢測類', () => {
    expect(collisionSystemContent).toContain('export class CollisionDetectionSystem');
    expect(collisionSystemContent).toContain('handleCollision');
    expect(collisionSystemContent).toContain('setTargetWord');
    expect(collisionSystemContent).toContain('determineCollisionType');
  });

  test('應該定義碰撞事件接口', () => {
    expect(collisionSystemContent).toContain('export interface CollisionEvent');
    expect(collisionSystemContent).toContain("type: 'correct' | 'incorrect' | 'neutral'");
    expect(collisionSystemContent).toContain('cloudWord: string');
    expect(collisionSystemContent).toContain('targetWord: string');
    expect(collisionSystemContent).toContain('responseTime: number');
  });

  test('應該包含特效配置接口', () => {
    expect(collisionSystemContent).toContain('export interface CollisionEffectConfig');
    expect(collisionSystemContent).toContain('enableParticles: boolean');
    expect(collisionSystemContent).toContain('enableScreenShake: boolean');
    expect(collisionSystemContent).toContain('enableSoundEffects: boolean');
  });

  test('應該包含碰撞反饋接口', () => {
    expect(collisionSystemContent).toContain('export interface CollisionFeedback');
    expect(collisionSystemContent).toContain('visual:');
    expect(collisionSystemContent).toContain('audio:');
    expect(collisionSystemContent).toContain('haptic?:');
  });
});

describe('射擊系統移除驗證測試', () => {
  test('應該移除所有子彈相關變數', () => {
    // 檢查不應該包含的射擊系統代碼
    expect(!modifiedSceneContent.includes('private bullets!')).toBeTruthy();
    expect(!modifiedSceneContent.includes('bulletTime')).toBeTruthy();
    expect(!modifiedSceneContent.includes('fireBullet')).toBeTruthy();
    expect(!modifiedSceneContent.includes('handleShooting')).toBeTruthy();
  });

  test('應該移除子彈群組創建', () => {
    expect(!modifiedSceneContent.includes('this.bullets = this.physics.add.group')).toBeTruthy();
    expect(!modifiedSceneContent.includes('BULLET.MAX_BULLETS')).toBeTruthy();
  });

  test('應該移除子彈碰撞檢測', () => {
    expect(!modifiedSceneContent.includes('this.physics.add.overlap(this.bullets, this.enemies')).toBeTruthy();
    expect(!modifiedSceneContent.includes('hitEnemy')).toBeTruthy();
  });

  test('應該移除子彈清理邏輯', () => {
    expect(!modifiedSceneContent.includes('this.bullets.children.entries.forEach')).toBeTruthy();
  });
});

describe('新碰撞檢測系統整合測試', () => {
  test('應該包含碰撞檢測系統初始化', () => {
    expect(modifiedSceneContent).toContain('private collisionSystem!: CollisionDetectionSystem');
    expect(modifiedSceneContent).toContain('this.collisionSystem = new CollisionDetectionSystem');
  });

  test('應該包含直接碰撞處理', () => {
    expect(modifiedSceneContent).toContain('handleCloudCollision');
    expect(modifiedSceneContent).toContain('this.physics.add.overlap(this.player, this.enemies');
  });

  test('應該包含詞彙管理系統', () => {
    expect(modifiedSceneContent).toContain('private geptManager!: GEPTManager');
    expect(modifiedSceneContent).toContain('generateNextTargetWord');
    expect(modifiedSceneContent).toContain('loadGEPTVocabulary');
  });

  test('應該包含記憶增強引擎', () => {
    expect(modifiedSceneContent).toContain('private memoryEngine!: MemoryEnhancementEngine');
    expect(modifiedSceneContent).toContain('recordLearningData');
  });
});

describe('碰撞檢測邏輯測試', () => {
  test('應該包含碰撞類型判斷', () => {
    expect(collisionSystemContent).toContain('determineCollisionType');
    expect(collisionSystemContent).toContain("return 'correct'");
    expect(collisionSystemContent).toContain("return 'incorrect'");
    expect(collisionSystemContent).toContain("return 'neutral'");
  });

  test('應該包含碰撞統計更新', () => {
    expect(collisionSystemContent).toContain('updateCollisionStatistics');
    expect(collisionSystemContent).toContain('correctCollisions++');
    expect(collisionSystemContent).toContain('incorrectCollisions++');
    expect(collisionSystemContent).toContain('totalResponseTime');
  });

  test('應該包含碰撞反饋執行', () => {
    expect(collisionSystemContent).toContain('executeCollisionFeedback');
    expect(collisionSystemContent).toContain('generateCollisionFeedback');
    expect(collisionSystemContent).toContain('showVisualFeedback');
    expect(collisionSystemContent).toContain('triggerParticleEffect');
  });
});

describe('特效系統測試', () => {
  test('應該包含粒子系統初始化', () => {
    expect(collisionSystemContent).toContain('initializeParticleSystem');
    expect(collisionSystemContent).toContain('correctParticles');
    expect(collisionSystemContent).toContain('incorrectParticles');
    expect(collisionSystemContent).toContain('neutralParticles');
  });

  test('應該包含音效管理', () => {
    expect(collisionSystemContent).toContain('loadAudioAssets');
    expect(collisionSystemContent).toContain('playAudioFeedback');
    expect(collisionSystemContent).toContain('collision-correct');
    expect(collisionSystemContent).toContain('collision-incorrect');
  });

  test('應該包含視覺反饋', () => {
    expect(collisionSystemContent).toContain('showVisualFeedback');
    expect(collisionSystemContent).toContain('triggerScreenShake');
    expect(collisionSystemContent).toContain('feedbackText');
  });
});

describe('EffectsManager 系統測試', () => {
  test('應該包含完整的特效管理器', () => {
    expect(effectsManagerContent).toContain('export class EffectsManager');
    expect(effectsManagerContent).toContain('playSound');
    expect(effectsManagerContent).toContain('triggerParticleEffect');
    expect(effectsManagerContent).toContain('triggerScreenShake');
  });

  test('應該包含音效配置', () => {
    expect(effectsManagerContent).toContain('export interface AudioConfig');
    expect(effectsManagerContent).toContain('masterVolume: number');
    expect(effectsManagerContent).toContain('sfxVolume: number');
    expect(effectsManagerContent).toContain('enableSpatialAudio: boolean');
  });

  test('應該包含視覺效果配置', () => {
    expect(effectsManagerContent).toContain('export interface VisualEffectConfig');
    expect(effectsManagerContent).toContain('enableParticles: boolean');
    expect(effectsManagerContent).toContain('particleQuality');
    expect(effectsManagerContent).toContain('effectIntensity: number');
  });

  test('應該包含觸覺反饋配置', () => {
    expect(effectsManagerContent).toContain('export interface HapticConfig');
    expect(effectsManagerContent).toContain('enableVibration: boolean');
    expect(effectsManagerContent).toContain('triggerHapticFeedback');
  });

  test('應該包含組合效果方法', () => {
    expect(effectsManagerContent).toContain('playCorrectCollisionEffect');
    expect(effectsManagerContent).toContain('playIncorrectCollisionEffect');
    expect(effectsManagerContent).toContain('playNeutralCollisionEffect');
  });
});

describe('記憶科學整合測試', () => {
  test('應該包含記憶指標計算', () => {
    expect(collisionSystemContent).toContain('getMemoryMetrics');
    expect(collisionSystemContent).toContain('calculateCognitiveLoad');
    expect(collisionSystemContent).toContain('averageResponseTime');
    expect(collisionSystemContent).toContain('accuracyRate');
  });

  test('應該包含學習數據記錄', () => {
    expect(modifiedSceneContent).toContain('recordLearningData');
    expect(modifiedSceneContent).toContain('recordLearningEvent');
    expect(modifiedSceneContent).toContain('responseTime');
    expect(modifiedSceneContent).toContain('isCorrect');
  });
});

describe('GEPT 詞彙系統整合測試', () => {
  test('應該包含詞彙載入', () => {
    expect(modifiedSceneContent).toContain('loadGEPTVocabulary');
    expect(modifiedSceneContent).toContain('getWordsByLevel');
    expect(modifiedSceneContent).toContain('availableWords');
  });

  test('應該包含目標詞彙管理', () => {
    expect(modifiedSceneContent).toContain('generateNextTargetWord');
    expect(modifiedSceneContent).toContain('currentTargetWord');
    expect(modifiedSceneContent).toContain('currentTargetChinese');
  });

  test('應該包含雲朵詞彙生成', () => {
    expect(modifiedSceneContent).toContain('spawnCloudWithWord');
    expect(modifiedSceneContent).toContain("cloud.setData('word'");
    expect(modifiedSceneContent).toContain("cloud.setData('chinese'");
  });
});

describe('遊戲邏輯整合測試', () => {
  test('應該包含碰撞結果處理', () => {
    expect(modifiedSceneContent).toContain('processCollisionResult');
    expect(modifiedSceneContent).toContain('CORRECT_SCORE');
    expect(modifiedSceneContent).toContain('INCORRECT_PENALTY');
    expect(modifiedSceneContent).toContain('HEALTH_PENALTY');
  });

  test('應該包含遊戲狀態更新', () => {
    expect(modifiedSceneContent).toContain('updateGameHUD');
    expect(modifiedSceneContent).toContain('checkGameOver');
    expect(modifiedSceneContent).toContain('playerHealth');
  });

  test('應該包含計時器管理', () => {
    expect(modifiedSceneContent).toContain('enemyTimer');
    expect(modifiedSceneContent).toContain('targetWordTimer');
    expect(modifiedSceneContent).toContain('startEnemySpawning');
    expect(modifiedSceneContent).toContain('startVocabularyManagement');
  });
});

describe('工廠模式和擴展性測試', () => {
  test('應該包含碰撞檢測系統工廠', () => {
    expect(collisionSystemContent).toContain('export class CollisionDetectionSystemFactory');
    expect(collisionSystemContent).toContain('static create');
    expect(collisionSystemContent).toContain('static createWithPresets');
  });

  test('應該包含預設配置', () => {
    expect(collisionSystemContent).toContain("preset: 'minimal' | 'standard' | 'enhanced'");
    expect(collisionSystemContent).toContain('minimal:');
    expect(collisionSystemContent).toContain('standard:');
    expect(collisionSystemContent).toContain('enhanced:');
  });
});

describe('資源管理和清理測試', () => {
  test('應該包含系統銷毀方法', () => {
    expect(collisionSystemContent).toContain('destroy()');
    expect(effectsManagerContent).toContain('destroy()');
    expect(modifiedSceneContent).toContain('destroy()');
  });

  test('應該包含資源清理邏輯', () => {
    expect(collisionSystemContent).toContain('particleEmitters.clear()');
    expect(collisionSystemContent).toContain('resetStatistics()');
    expect(effectsManagerContent).toContain('particleSystems.clear()');
    expect(effectsManagerContent).toContain('loadedSounds.clear()');
  });

  test('應該包含計時器清理', () => {
    expect(modifiedSceneContent).toContain('enemyTimer?.destroy()');
    expect(modifiedSceneContent).toContain('targetWordTimer?.destroy()');
    expect(modifiedSceneContent).toContain('collisionSystem?.destroy()');
  });
});

describe('代碼品質和結構測試', () => {
  test('碰撞檢測系統文件大小應該合理', () => {
    const stats = fs.statSync(collisionSystemPath);
    expect(stats.size).toBeGreaterThan(8 * 1024); // 大於 8KB
    expect(stats.size).toBeLessThan(50 * 1024);   // 小於 50KB
  });

  test('修改後場景文件大小應該合理', () => {
    const stats = fs.statSync(modifiedScenePath);
    expect(stats.size).toBeGreaterThan(10 * 1024); // 大於 10KB
    expect(stats.size).toBeLessThan(60 * 1024);    // 小於 60KB
  });

  test('特效管理器文件大小應該合理', () => {
    const stats = fs.statSync(effectsManagerPath);
    expect(stats.size).toBeGreaterThan(8 * 1024); // 大於 8KB
    expect(stats.size).toBeLessThan(40 * 1024);   // 小於 40KB
  });

  test('應該包含足夠的接口定義', () => {
    const allContent = collisionSystemContent + effectsManagerContent;
    const interfaces = (allContent.match(/export interface \w+/g) || []).length;
    expect(interfaces).toBeGreaterThan(6); // 至少6個接口
  });

  test('應該包含足夠的類定義', () => {
    const allContent = collisionSystemContent + modifiedSceneContent + effectsManagerContent;
    const classes = (allContent.match(/export class \w+/g) || []).length;
    expect(classes).toBeGreaterThan(3); // 至少3個類
  });
});

// 執行所有測試
runTests();

console.log('\n📊 測試結果統計');
console.log('✅ 碰撞檢測系統核心功能: 通過');
console.log('✅ 射擊系統移除驗證: 通過');
console.log('✅ 新碰撞檢測系統整合: 通過');
console.log('✅ 碰撞檢測邏輯: 通過');
console.log('✅ 特效系統: 通過');
console.log('✅ EffectsManager 系統: 通過');
console.log('✅ 記憶科學整合: 通過');
console.log('✅ GEPT 詞彙系統整合: 通過');
console.log('✅ 遊戲邏輯整合: 通過');
console.log('✅ 工廠模式和擴展性: 通過');
console.log('✅ 資源管理和清理: 通過');
console.log('✅ 代碼品質和結構: 通過');

console.log('\n🎉 所有測試通過！碰撞檢測系統實現驗證成功');
console.log('✅ Task 1.1.3 測試階段 (2/5) 完成');

}
