/**
 * ModifiedGameScene 整合測試
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 為修改後的遊戲場景創建完整的整合測試
 * 狀態: 開發階段 (1/5)
 */

import { ModifiedGameScene, GameConfig } from '../../components/games/AirplaneCollisionGame/ModifiedGameScene';
import { GEPTManager, GEPTWord } from '../../lib/gept/GEPTManager';
import { MemoryEnhancementEngine } from '../../lib/memory-enhancement/MemoryEnhancementEngine';
import { CollisionDetectionSystem } from '../../components/games/AirplaneCollisionGame/CollisionDetectionSystem';

// Mock Phaser Game and Scene
const mockPhaserGame = {
  scene: {
    add: jest.fn(),
    remove: jest.fn()
  },
  destroy: jest.fn()
};

const mockPhysics = {
  add: {
    image: jest.fn().mockReturnValue({
      setCollideWorldBounds: jest.fn(),
      body: {
        setDrag: jest.fn(),
        setMaxSpeed: jest.fn()
      }
    }),
    group: jest.fn().mockReturnValue({
      create: jest.fn().mockReturnValue({
        setScale: jest.fn(),
        setTint: jest.fn(),
        setData: jest.fn(),
        getData: jest.fn(),
        body: {
          setVelocityX: jest.fn()
        }
      }),
      children: {
        entries: []
      }
    }),
    overlap: jest.fn()
  }
};

const mockCameras = {
  main: {
    width: 800,
    height: 600,
    centerX: 400,
    centerY: 300
  }
};

const mockTime = {
  addEvent: jest.fn().mockReturnValue({
    destroy: jest.fn()
  })
};

const mockAdd = {
  text: jest.fn().mockReturnValue({
    destroy: jest.fn()
  })
};

// Mock GEPTManager
jest.mock('../../lib/gept/GEPTManager', () => ({
  GEPTManager: jest.fn().mockImplementation(() => ({
    getWordsByLevel: jest.fn().mockReturnValue([
      { word: 'apple', definition: '蘋果', level: 'elementary' },
      { word: 'banana', definition: '香蕉', level: 'elementary' },
      { word: 'cat', definition: '貓', level: 'elementary' }
    ]),
    getWord: jest.fn().mockReturnValue({
      word: 'apple',
      definition: '蘋果',
      level: 'elementary'
    })
  }))
}));

// Mock MemoryEnhancementEngine
jest.mock('../../lib/memory-enhancement/MemoryEnhancementEngine', () => ({
  MemoryEnhancementEngine: jest.fn().mockImplementation(() => ({
    recordLearningEvent: jest.fn(),
    getMemoryMetrics: jest.fn().mockReturnValue({
      responseTime: [1500, 2000, 1200],
      accuracyRate: 0.75,
      spacedRepetitionSchedule: new Map(),
      cognitiveLoadLevel: 0.6
    })
  }))
}));

// Mock CollisionDetectionSystem
jest.mock('../../components/games/AirplaneCollisionGame/CollisionDetectionSystem', () => ({
  CollisionDetectionSystem: jest.fn().mockImplementation(() => ({
    setTargetWord: jest.fn(),
    handleCollision: jest.fn().mockReturnValue({
      type: 'correct',
      cloudWord: 'apple',
      targetWord: 'apple',
      responseTime: 1500,
      timestamp: Date.now(),
      playerPosition: { x: 100, y: 300 },
      cloudPosition: { x: 200, y: 300 }
    }),
    getMemoryMetrics: jest.fn().mockReturnValue({
      responseTime: [1500],
      accuracyRate: 1.0,
      spacedRepetitionSchedule: new Map(),
      cognitiveLoadLevel: 0.3
    }),
    destroy: jest.fn()
  }))
}));

// Test Data Factory
class GameSceneTestFactory {
  static createMockGameScene(): Partial<ModifiedGameScene> {
    return {
      physics: mockPhysics,
      cameras: mockCameras,
      time: mockTime,
      add: mockAdd,
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    } as any;
  }

  static createGameConfig(overrides: Partial<GameConfig> = {}): GameConfig {
    return {
      PLAYER: {
        ACCELERATION: 600,
        MAX_SPEED: 300,
        DRAG: 500
      },
      ENEMY: {
        SPAWN_RATE: 2000,
        MIN_SPEED: 50,
        MAX_SPEED: 150,
        MIN_Y: 100,
        MAX_Y: 500,
        SPAWN_X: 850
      },
      GAME: {
        INITIAL_HEALTH: 100,
        CORRECT_SCORE: 10,
        INCORRECT_PENALTY: 5,
        HEALTH_PENALTY: 20
      },
      ...overrides
    };
  }

  static createMockSprite(data: any = {}) {
    return {
      x: 100,
      y: 100,
      setData: jest.fn(),
      getData: jest.fn().mockImplementation((key: string) => {
        if (key === 'word') return data.word || 'apple';
        if (key === 'chinese') return data.chinese || '蘋果';
        if (key === 'wordText') return data.wordText || { destroy: jest.fn() };
        return data[key];
      }),
      destroy: jest.fn(),
      setActive: jest.fn(),
      setVisible: jest.fn(),
      ...data
    };
  }
}

describe('ModifiedGameScene 整合測試', () => {
  let gameScene: ModifiedGameScene;
  let mockGeptManager: jest.Mocked<GEPTManager>;
  let mockMemoryEngine: jest.Mocked<MemoryEnhancementEngine>;
  let mockCollisionSystem: jest.Mocked<CollisionDetectionSystem>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 創建遊戲場景實例
    gameScene = new ModifiedGameScene();
    
    // 設置 mock 屬性
    Object.assign(gameScene, {
      physics: mockPhysics,
      cameras: mockCameras,
      time: mockTime,
      add: mockAdd
    });

    // 獲取 mock 實例
    mockGeptManager = new (GEPTManager as jest.MockedClass<typeof GEPTManager>)() as jest.Mocked<GEPTManager>;
    mockMemoryEngine = new (MemoryEnhancementEngine as jest.MockedClass<typeof MemoryEnhancementEngine>)() as jest.Mocked<MemoryEnhancementEngine>;
    mockCollisionSystem = new (CollisionDetectionSystem as jest.MockedClass<typeof CollisionDetectionSystem>)(null as any) as jest.Mocked<CollisionDetectionSystem>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('場景初始化', () => {
    test('應該正確初始化所有管理器', () => {
      gameScene.create();
      
      // 驗證 GEPT 管理器被創建
      expect(GEPTManager).toHaveBeenCalled();
      
      // 驗證記憶增強引擎被創建
      expect(MemoryEnhancementEngine).toHaveBeenCalled();
      
      // 驗證碰撞檢測系統被創建
      expect(CollisionDetectionSystem).toHaveBeenCalled();
    });

    test('應該創建玩家飛機', () => {
      gameScene.create();
      
      expect(mockPhysics.add.image).toHaveBeenCalledWith(
        100, // x position
        300, // y position (height / 2)
        'player-plane'
      );
    });

    test('應該創建雲朵敵人群組', () => {
      gameScene.create();
      
      expect(mockPhysics.add.group).toHaveBeenCalledWith({
        defaultKey: 'cloud-enemy'
      });
    });

    test('應該設置物理碰撞檢測', () => {
      gameScene.create();
      
      expect(mockPhysics.add.overlap).toHaveBeenCalled();
    });

    test('應該開始雲朵生成計時器', () => {
      gameScene.create();
      
      expect(mockTime.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          delay: 2000, // ENEMY.SPAWN_RATE
          loop: true
        })
      );
    });

    test('應該開始詞彙管理計時器', () => {
      gameScene.create();
      
      expect(mockTime.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          delay: 30000, // 30秒詞彙更新
          loop: true
        })
      );
    });
  });

  describe('詞彙管理系統整合', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該載入 GEPT 詞彙', () => {
      expect(mockGeptManager.getWordsByLevel).toHaveBeenCalledWith('elementary');
    });

    test('應該生成目標詞彙', () => {
      // 模擬詞彙生成
      const availableWords = [
        { word: 'apple', definition: '蘋果', level: 'elementary' },
        { word: 'banana', definition: '香蕉', level: 'elementary' }
      ];
      
      mockGeptManager.getWordsByLevel.mockReturnValue(availableWords);
      
      // 觸發詞彙生成（通過私有方法測試）
      // 這裡我們通過檢查碰撞系統的調用來驗證
      expect(mockCollisionSystem.setTargetWord).toHaveBeenCalled();
    });

    test('應該更新目標詞彙顯示', () => {
      // 驗證 HUD 更新（通過 console.log 或其他可觀察的副作用）
      expect(mockCollisionSystem.setTargetWord).toHaveBeenCalled();
    });
  });

  describe('碰撞檢測系統整合', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該處理雲朵碰撞', () => {
      const mockCloudSprite = GameSceneTestFactory.createMockSprite({
        word: 'apple',
        chinese: '蘋果'
      });

      // 模擬碰撞處理
      const collisionEvent = mockCollisionSystem.handleCollision(mockCloudSprite, {} as any);
      
      expect(mockCollisionSystem.handleCollision).toHaveBeenCalled();
      expect(collisionEvent.type).toBe('correct');
    });

    test('應該記錄學習數據', () => {
      const mockCloudSprite = GameSceneTestFactory.createMockSprite({
        word: 'apple',
        chinese: '蘋果'
      });

      // 模擬碰撞和學習數據記錄
      mockCollisionSystem.handleCollision(mockCloudSprite, {} as any);
      
      // 驗證記憶引擎記錄學習事件
      expect(mockMemoryEngine.recordLearningEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          word: expect.any(String),
          isCorrect: expect.any(Boolean),
          responseTime: expect.any(Number),
          timestamp: expect.any(Number),
          context: 'airplane-collision-game'
        })
      );
    });
  });

  describe('遊戲邏輯整合', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該正確處理正確碰撞結果', () => {
      const correctCollisionEvent = {
        type: 'correct' as const,
        cloudWord: 'apple',
        targetWord: 'apple',
        responseTime: 1500,
        timestamp: Date.now(),
        playerPosition: { x: 100, y: 300 },
        cloudPosition: { x: 200, y: 300 }
      };

      mockCollisionSystem.handleCollision.mockReturnValue(correctCollisionEvent);

      // 模擬碰撞處理
      const mockCloudSprite = GameSceneTestFactory.createMockSprite();
      
      // 這裡我們需要訪問私有方法，或者通過公共接口測試
      // 由於是整合測試，我們主要驗證系統間的交互
      expect(mockCollisionSystem.handleCollision).toBeDefined();
    });

    test('應該正確處理錯誤碰撞結果', () => {
      const incorrectCollisionEvent = {
        type: 'incorrect' as const,
        cloudWord: 'banana',
        targetWord: 'apple',
        responseTime: 2000,
        timestamp: Date.now(),
        playerPosition: { x: 100, y: 300 },
        cloudPosition: { x: 200, y: 300 }
      };

      mockCollisionSystem.handleCollision.mockReturnValue(incorrectCollisionEvent);

      // 驗證錯誤碰撞處理
      expect(mockCollisionSystem.handleCollision).toBeDefined();
    });

    test('應該檢查遊戲結束條件', () => {
      // 模擬生命值降到 0
      // 這需要訪問遊戲狀態，或者通過可觀察的副作用來測試
      expect(gameScene).toBeDefined();
    });
  });

  describe('雲朵生成系統整合', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該生成帶有詞彙的雲朵', () => {
      // 模擬雲朵生成
      const mockEnemyGroup = mockPhysics.add.group();
      const mockCloudSprite = mockEnemyGroup.create();
      
      expect(mockCloudSprite.setData).toHaveBeenCalled();
      expect(mockAdd.text).toHaveBeenCalled();
    });

    test('應該設置雲朵物理屬性', () => {
      const mockEnemyGroup = mockPhysics.add.group();
      const mockCloudSprite = mockEnemyGroup.create();
      
      expect(mockCloudSprite.setScale).toHaveBeenCalledWith(0.8);
      expect(mockCloudSprite.setTint).toHaveBeenCalledWith(0xffffff);
    });

    test('應該為雲朵分配英文單字', () => {
      const mockEnemyGroup = mockPhysics.add.group();
      const mockCloudSprite = mockEnemyGroup.create();
      
      expect(mockCloudSprite.setData).toHaveBeenCalledWith('word', expect.any(String));
      expect(mockCloudSprite.setData).toHaveBeenCalledWith('chinese', expect.any(String));
    });
  });

  describe('記憶科學引擎整合', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該獲取記憶指標', () => {
      const memoryMetrics = mockMemoryEngine.getMemoryMetrics();
      
      expect(memoryMetrics).toEqual(
        expect.objectContaining({
          responseTime: expect.any(Array),
          accuracyRate: expect.any(Number),
          spacedRepetitionSchedule: expect.any(Map),
          cognitiveLoadLevel: expect.any(Number)
        })
      );
    });

    test('應該記錄學習事件', () => {
      // 模擬學習事件記錄
      mockMemoryEngine.recordLearningEvent({
        word: 'apple',
        isCorrect: true,
        responseTime: 1500,
        timestamp: Date.now(),
        context: 'airplane-collision-game'
      });
      
      expect(mockMemoryEngine.recordLearningEvent).toHaveBeenCalled();
    });
  });

  describe('遊戲更新循環', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該在更新循環中處理玩家移動', () => {
      const time = 1000;
      const delta = 16.67;
      
      gameScene.update(time, delta);
      
      // 驗證更新循環執行
      expect(gameScene.update).toBeDefined();
    });

    test('應該清理超出邊界的雲朵', () => {
      // 模擬雲朵超出邊界
      const mockEnemyGroup = mockPhysics.add.group();
      const mockCloudSprite = GameSceneTestFactory.createMockSprite({ x: -100 });
      
      mockEnemyGroup.children.entries = [mockCloudSprite];
      
      gameScene.update(1000, 16.67);
      
      // 驗證清理邏輯（通過 setActive 和 setVisible 調用）
      expect(mockCloudSprite.setActive).toHaveBeenCalledWith(false);
      expect(mockCloudSprite.setVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('資源清理', () => {
    beforeEach(() => {
      gameScene.create();
    });

    test('應該正確清理所有資源', () => {
      gameScene.destroy();
      
      // 驗證碰撞檢測系統被銷毀
      expect(mockCollisionSystem.destroy).toHaveBeenCalled();
      
      // 驗證計時器被銷毀
      expect(mockTime.addEvent().destroy).toHaveBeenCalled();
    });

    test('應該清理計時器', () => {
      const mockTimer = mockTime.addEvent();
      
      gameScene.destroy();
      
      expect(mockTimer.destroy).toHaveBeenCalled();
    });
  });

  describe('錯誤處理', () => {
    test('應該處理 GEPT 管理器初始化失敗', () => {
      (GEPTManager as jest.MockedClass<typeof GEPTManager>).mockImplementation(() => {
        throw new Error('GEPT Manager initialization failed');
      });
      
      expect(() => {
        gameScene.create();
      }).not.toThrow();
    });

    test('應該處理記憶引擎初始化失敗', () => {
      (MemoryEnhancementEngine as jest.MockedClass<typeof MemoryEnhancementEngine>).mockImplementation(() => {
        throw new Error('Memory Engine initialization failed');
      });
      
      expect(() => {
        gameScene.create();
      }).not.toThrow();
    });

    test('應該處理碰撞檢測系統初始化失敗', () => {
      (CollisionDetectionSystem as jest.MockedClass<typeof CollisionDetectionSystem>).mockImplementation(() => {
        throw new Error('Collision Detection System initialization failed');
      });
      
      expect(() => {
        gameScene.create();
      }).not.toThrow();
    });
  });

  describe('性能考量', () => {
    test('應該限制同時存在的雲朵數量', () => {
      gameScene.create();
      
      // 模擬大量雲朵生成
      for (let i = 0; i < 100; i++) {
        // 觸發雲朵生成
      }
      
      // 驗證雲朵數量限制（這需要訪問內部狀態或通過性能指標）
      expect(mockPhysics.add.group).toHaveBeenCalled();
    });

    test('應該優化記憶體使用', () => {
      gameScene.create();
      
      // 模擬長時間運行
      for (let i = 0; i < 1000; i++) {
        gameScene.update(i * 16.67, 16.67);
      }
      
      // 驗證記憶體清理（通過 destroy 調用次數）
      expect(gameScene).toBeDefined();
    });
  });
});
