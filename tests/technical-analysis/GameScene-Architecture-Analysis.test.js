/**
 * GameScene.ts 架構分析驗證腳本
 *
 * 目標: 驗證架構分析報告的準確性和完整性
 * 任務: Task 1.1.1 - 分析現有 GameScene.ts 架構
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
    }
  };
}

// 主測試函數
function runTests() {
  // 讀取測試數據
  const gameScenePath = path.join(__dirname, '../../phaser3-plane-selector/src/game/scenes/GameScene.ts');
  const reportPath = path.join(__dirname, '../../docs/technical-analysis/GameScene-Architecture-Analysis.md');

  let gameSceneContent, analysisReport;

  try {
    gameSceneContent = fs.readFileSync(gameScenePath, 'utf8');
    analysisReport = fs.readFileSync(reportPath, 'utf8');
    console.log('📁 測試文件讀取成功');
  } catch (error) {
    console.error('❌ 測試文件讀取失敗:', error.message);
    process.exit(1);
  }

describe('射擊系統組件識別測試', () => {
    test('應該正確識別子彈群組系統', () => {
      // 驗證子彈群組存在
      expect(gameSceneContent).toContain('private bullets!: Phaser.GameObjects.Group');
      expect(gameSceneContent).toContain('this.bullets = this.physics.add.group');
      expect(gameSceneContent).toContain('MAX_BULLETS');
      
      // 驗證分析報告包含此組件
      expect(analysisReport).toContain('子彈群組系統');
      expect(analysisReport).toContain('需要移除');
    });

    test('應該正確識別射擊邏輯', () => {
      // 驗證射擊方法存在
      expect(gameSceneContent).toContain('private handleShooting');
      expect(gameSceneContent).toContain('private fireBullet');
      expect(gameSceneContent).toContain('this.bulletTime');
      
      // 驗證分析報告包含此邏輯
      expect(analysisReport).toContain('射擊邏輯');
      expect(analysisReport).toContain('handleShooting');
      expect(analysisReport).toContain('fireBullet');
    });

    test('應該正確識別子彈碰撞檢測', () => {
      // 驗證子彈碰撞檢測存在
      expect(gameSceneContent).toContain('this.physics.add.overlap(this.bullets, this.enemies');
      expect(gameSceneContent).toContain('this.hitEnemy');
      
      // 驗證分析報告包含此檢測
      expect(analysisReport).toContain('子彈碰撞檢測');
      expect(analysisReport).toContain('改為玩家與雲朵的直接碰撞');
    });

    test('應該正確識別子彈清理邏輯', () => {
      // 驗證子彈清理邏輯存在
      expect(gameSceneContent).toContain('this.bullets.children.entries.forEach');
      expect(gameSceneContent).toContain('bulletSprite.setActive(false)');
      
      // 驗證分析報告包含此邏輯
      expect(analysisReport).toContain('子彈清理邏輯');
      expect(analysisReport).toContain('無子彈系統後不需要清理');
    });
});

describe('核心功能組件識別測試', () => {
    test('應該正確識別視差背景系統', () => {
      // 驗證視差背景存在
      expect(gameSceneContent).toContain('private backgroundLayers');
      expect(gameSceneContent).toContain('sky: Phaser.GameObjects.TileSprite');
      expect(gameSceneContent).toContain('createParallaxBackground');
      expect(gameSceneContent).toContain('updateParallaxBackground');
      
      // 驗證分析報告正確標記為保留
      expect(analysisReport).toContain('視差背景系統 ⭐');
      expect(analysisReport).toContain('6層視差效果');
      expect(analysisReport).toContain('保留原因');
    });

    test('應該正確識別雲朵敵人系統', () => {
      // 驗證雲朵系統存在
      expect(gameSceneContent).toContain('private enemies!: Phaser.GameObjects.Group');
      expect(gameSceneContent).toContain('private spawnEnemy');
      expect(gameSceneContent).toContain('cloud-enemy');
      
      // 驗證分析報告正確標記為保留並擴展
      expect(analysisReport).toContain('雲朵敵人系統 ⭐');
      expect(analysisReport).toContain('保留並擴展原因');
      expect(analysisReport).toContain('英文單字的載體');
    });

    test('應該正確識別玩家控制系統', () => {
      // 驗證玩家控制存在
      expect(gameSceneContent).toContain('private handlePlayerMovement');
      expect(gameSceneContent).toContain('this.inputManager.getMovementVector');
      expect(gameSceneContent).toContain('PLAYER.ACCELERATION');
      
      // 驗證分析報告正確標記為保留
      expect(analysisReport).toContain('玩家控制系統 ⭐');
      expect(analysisReport).toContain('控制飛機移動尋找目標雲朵');
    });

    test('應該正確識別物理系統', () => {
      // 驗證物理系統存在
      expect(gameSceneContent).toContain('this.physics.add.existing(this.player)');
      expect(gameSceneContent).toContain('setCollideWorldBounds');
      expect(gameSceneContent).toContain('setDrag');
      
      // 驗證分析報告正確標記為保留
      expect(analysisReport).toContain('物理系統 ⭐');
      expect(analysisReport).toContain('碰撞檢測需要物理系統');
    });

    test('應該正確識別HUD系統', () => {
      // 驗證HUD系統存在
      expect(gameSceneContent).toContain('private gameHUD!: GameHUD');
      expect(gameSceneContent).toContain('createGameHUD');
      expect(gameSceneContent).toContain('updateScore');
      
      // 驗證分析報告正確標記為保留並修改
      expect(analysisReport).toContain('HUD 系統 ⭐');
      expect(analysisReport).toContain('需要添加目標中文詞彙提示區域');
    });
});

describe('碰撞檢測系統分析測試', () => {
    test('應該正確識別現有碰撞檢測', () => {
      // 驗證玩家碰撞檢測存在
      expect(gameSceneContent).toContain('this.physics.add.overlap(this.player, this.enemies');
      expect(gameSceneContent).toContain('this.hitPlayer');
      
      // 驗證分析報告包含修改方案
      expect(analysisReport).toContain('現有玩家碰撞檢測');
      expect(analysisReport).toContain('修改方案');
    });

    test('應該正確分析碰撞處理邏輯', () => {
      // 驗證碰撞處理存在
      expect(gameSceneContent).toContain('private hitPlayer');
      expect(gameSceneContent).toContain('this.playerHealth -= 20');
      
      // 驗證分析報告包含修改建議
      expect(analysisReport).toContain('碰撞處理邏輯');
      expect(analysisReport).toContain('目標詞彙匹配邏輯');
    });
});

describe('技術依賴關係分析測試', () => {
    test('應該正確識別外部依賴', () => {
      // 驗證外部依賴存在
      expect(gameSceneContent).toContain('InputManager');
      expect(gameSceneContent).toContain('PlaneManager');
      expect(gameSceneContent).toContain('GameHUD');
      expect(gameSceneContent).toContain('GAME_CONFIG');
      
      // 驗證分析報告包含依賴分析
      expect(analysisReport).toContain('外部依賴');
      expect(analysisReport).toContain('InputManager');
      expect(analysisReport).toContain('PlaneManager');
    });

    test('應該正確分析內部依賴', () => {
      // 驗證分析報告包含內部依賴分析
      expect(analysisReport).toContain('內部依賴');
      expect(analysisReport).toContain('視差背景 ↔ 更新循環');
      expect(analysisReport).toContain('雲朵系統 ↔ 物理引擎');
    });
  });

  describe('性能影響分析測試', () => {
    test('應該包含性能提升點分析', () => {
      expect(analysisReport).toContain('性能提升點');
      expect(analysisReport).toContain('移除子彈系統');
      expect(analysisReport).toContain('簡化碰撞檢測');
      expect(analysisReport).toContain('減少渲染物件');
    });

    test('應該包含性能考慮點分析', () => {
      expect(analysisReport).toContain('性能考慮點');
      expect(analysisReport).toContain('文字渲染');
      expect(analysisReport).toContain('中文提示');
      expect(analysisReport).toContain('記憶體管理');
    });
  });

  describe('修改複雜度評估測試', () => {
    test('應該包含複雜度評估表格', () => {
      expect(analysisReport).toContain('修改複雜度評估');
      expect(analysisReport).toContain('子彈系統');
      expect(analysisReport).toContain('碰撞檢測');
      expect(analysisReport).toContain('雲朵系統');
      expect(analysisReport).toContain('預估工時');
    });

    test('應該包含總計預估時間', () => {
      expect(analysisReport).toContain('總計預估');
      expect(analysisReport).toContain('21小時');
    });
  });

  describe('行動計劃測試', () => {
    test('應該包含分階段行動計劃', () => {
      expect(analysisReport).toContain('下一步行動計劃');
      expect(analysisReport).toContain('Phase 1');
      expect(analysisReport).toContain('Phase 2');
      expect(analysisReport).toContain('Phase 3');
      expect(analysisReport).toContain('Phase 4');
    });

    test('應該包含優先級標記', () => {
      expect(analysisReport).toContain('優先級: 高');
      expect(analysisReport).toContain('優先級: 中');
    });
  });

  describe('驗證檢查清單測試', () => {
    test('應該包含完整的驗證檢查清單', () => {
      expect(analysisReport).toContain('驗證檢查清單');
      expect(analysisReport).toContain('射擊系統組件完全識別');
      expect(analysisReport).toContain('核心功能組件完全保留');
      expect(analysisReport).toContain('依賴關係清晰分析');
    });
  });

  describe('報告完整性測試', () => {
    test('應該包含所有必要的章節', () => {
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

    test('應該包含正確的任務信息', () => {
      expect(analysisReport).toContain('Task 1.1.1');
      expect(analysisReport).toContain('2025-01-24');
      expect(analysisReport).toContain('開發階段 (1/5)');
    });
});

// 性能測試
describe('分析報告性能測試', () => {
  test('報告文件大小應該合理', () => {
    const reportPath = path.join(__dirname, '../../docs/technical-analysis/GameScene-Architecture-Analysis.md');
    const stats = fs.statSync(reportPath);
    
    // 報告文件應該在 10KB - 100KB 之間
    expect(stats.size).toBeGreaterThan(10 * 1024); // 大於 10KB
    expect(stats.size).toBeLessThan(100 * 1024);   // 小於 100KB
  });

  test('報告讀取時間應該合理', () => {
    const startTime = Date.now();
    const reportPath = path.join(__dirname, '../../docs/technical-analysis/GameScene-Architecture-Analysis.md');
    fs.readFileSync(reportPath, 'utf8');
    const endTime = Date.now();
    
    // 讀取時間應該小於 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });
});

// 代碼覆蓋率測試
describe('分析覆蓋率測試', () => {
  test('應該覆蓋所有主要方法', () => {
    const majorMethods = [
      'create',
      'update',
      'createPlayer',
      'createGroups',
      'setupPhysics',
      'handlePlayerMovement',
      'handleShooting',
      'fireBullet',
      'spawnEnemy',
      'hitEnemy',
      'hitPlayer',
      'createParallaxBackground',
      'updateParallaxBackground'
    ];
    
    majorMethods.forEach(method => {
      expect(analysisReport).toContain(method);
    });
  });

  test('應該覆蓋所有重要屬性', () => {
    const majorProperties = [
      'bullets',
      'enemies',
      'player',
      'backgroundLayers',
      'inputManager',
      'gameHUD'
    ];
    
    majorProperties.forEach(property => {
      expect(analysisReport).toContain(property);
    });
  });
});

// 執行所有測試
runTests();

console.log('\n🎉 所有測試通過！架構分析報告驗證成功');
console.log('📊 測試統計:');
console.log('  - 射擊系統組件識別: ✅');
console.log('  - 核心功能組件識別: ✅');
console.log('  - 碰撞檢測系統分析: ✅');
console.log('  - 技術依賴關係分析: ✅');
console.log('  - 性能影響分析: ✅');
console.log('  - 修改複雜度評估: ✅');
console.log('  - 行動計劃: ✅');
console.log('  - 報告完整性: ✅');
console.log('  - 性能測試: ✅');
console.log('  - 代碼覆蓋率: ✅');

}
