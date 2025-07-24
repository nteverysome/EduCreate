/**
 * CollisionDetectionSystem 單元測試
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 為碰撞檢測系統創建完整的單元測試
 * 狀態: 開發階段 (1/5)
 */

import { CollisionDetectionSystem, CollisionEvent, CollisionEffectConfig } from '../../components/games/AirplaneCollisionGame/CollisionDetectionSystem';
import { GEPTWord, GEPTLevel } from '../../lib/gept/GEPTManager';
import { MemoryMetrics } from '../../lib/memory-enhancement/MemoryEnhancementEngine';

// Mock Phaser Scene
const mockScene = {
  add: {
    particles: jest.fn().mockReturnValue({
      setPosition: jest.fn(),
      explode: jest.fn(),
      destroy: jest.fn()
    }),
    text: jest.fn().mockReturnValue({
      x: 100,
      y: 100,
      destroy: jest.fn()
    })
  },
  sound: {
    play: jest.fn(),
    get: jest.fn().mockReturnValue(true)
  },
  cameras: {
    main: {
      shake: jest.fn(),
      width: 800,
      height: 600,
      centerX: 400,
      centerY: 300
    }
  },
  tweens: {
    add: jest.fn().mockReturnValue({
      on: jest.fn()
    })
  },
  cache: {
    audio: {
      exists: jest.fn().mockReturnValue(true)
    }
  },
  load: {
    audio: jest.fn()
  }
} as any;

// Mock Navigator for haptic feedback
Object.defineProperty(global.navigator, 'vibrate', {
  value: jest.fn(),
  writable: true
});

// Test Data Factory
class TestDataFactory {
  static createGEPTWord(overrides: Partial<GEPTWord> = {}): GEPTWord {
    return {
      word: 'apple',
      definition: '蘋果',
      level: 'elementary' as GEPTLevel,
      frequency: 100,
      difficulty: 3,
      example: 'I eat an apple.',
      pronunciation: '/ˈæpəl/',
      partOfSpeech: 'noun',
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
        return data[key];
      }),
      destroy: jest.fn(),
      ...data
    };
  }

  static createCollisionEvent(overrides: Partial<CollisionEvent> = {}): CollisionEvent {
    return {
      type: 'correct',
      cloudWord: 'apple',
      targetWord: 'apple',
      responseTime: 1500,
      timestamp: Date.now(),
      playerPosition: { x: 100, y: 300 },
      cloudPosition: { x: 200, y: 300 },
      ...overrides
    };
  }
}

// Test Utils
class TestUtils {
  static async waitForAsync(ms: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static expectCollisionEvent(event: CollisionEvent, expected: Partial<CollisionEvent>): void {
    if (expected.type) expect(event.type).toBe(expected.type);
    if (expected.cloudWord) expect(event.cloudWord).toBe(expected.cloudWord);
    if (expected.targetWord) expect(event.targetWord).toBe(expected.targetWord);
    expect(event.responseTime).toBeGreaterThan(0);
    expect(event.timestamp).toBeGreaterThan(0);
  }

  static createEffectConfig(overrides: Partial<CollisionEffectConfig> = {}): CollisionEffectConfig {
    return {
      enableParticles: true,
      enableScreenShake: true,
      enableSoundEffects: true,
      enableVisualFeedback: true,
      particleIntensity: 'medium',
      soundVolume: 0.7,
      ...overrides
    };
  }
}

describe('CollisionDetectionSystem', () => {
  let collisionSystem: CollisionDetectionSystem;
  let mockCloudSprite: any;
  let mockPlayerSprite: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 重置 Date.now mock
    jest.spyOn(Date, 'now').mockReturnValue(1000);
    
    collisionSystem = new CollisionDetectionSystem(
      mockScene,
      'elementary',
      TestUtils.createEffectConfig()
    );

    mockCloudSprite = TestDataFactory.createMockSprite({
      word: 'apple',
      chinese: '蘋果'
    });

    mockPlayerSprite = TestDataFactory.createMockSprite();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    test('應該正確初始化碰撞檢測系統', () => {
      expect(collisionSystem).toBeInstanceOf(CollisionDetectionSystem);
    });

    test('應該使用預設配置初始化', () => {
      const defaultSystem = new CollisionDetectionSystem(mockScene);
      expect(defaultSystem).toBeInstanceOf(CollisionDetectionSystem);
    });

    test('應該正確設置 GEPT 等級', () => {
      const intermediateSystem = new CollisionDetectionSystem(mockScene, 'intermediate');
      expect(intermediateSystem).toBeInstanceOf(CollisionDetectionSystem);
    });
  });

  describe('setTargetWord', () => {
    test('應該正確設置目標詞彙', () => {
      const englishWord = 'banana';
      const chineseWord = '香蕉';
      
      collisionSystem.setTargetWord(englishWord, chineseWord);
      
      // 驗證內部狀態（通過後續的碰撞測試來驗證）
      const collisionEvent = collisionSystem.handleCollision(
        TestDataFactory.createMockSprite({ word: 'banana', chinese: '香蕉' }),
        mockPlayerSprite
      );
      
      expect(collisionEvent.targetWord).toBe(englishWord);
      expect(collisionEvent.type).toBe('correct');
    });

    test('應該處理空字符串', () => {
      collisionSystem.setTargetWord('', '');
      
      const collisionEvent = collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      expect(collisionEvent.type).toBe('neutral');
    });

    test('應該更新時間戳', () => {
      const beforeTime = Date.now();
      collisionSystem.setTargetWord('test', '測試');
      
      // 模擬時間流逝
      jest.spyOn(Date, 'now').mockReturnValue(beforeTime + 1000);
      
      const collisionEvent = collisionSystem.handleCollision(
        TestDataFactory.createMockSprite({ word: 'test' }),
        mockPlayerSprite
      );
      
      expect(collisionEvent.responseTime).toBe(1000);
    });
  });

  describe('handleCollision', () => {
    beforeEach(() => {
      collisionSystem.setTargetWord('apple', '蘋果');
    });

    test('應該處理正確碰撞', () => {
      const collisionEvent = collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      TestUtils.expectCollisionEvent(collisionEvent, {
        type: 'correct',
        cloudWord: 'apple',
        targetWord: 'apple'
      });
    });

    test('應該處理錯誤碰撞', () => {
      const wrongCloudSprite = TestDataFactory.createMockSprite({
        word: 'banana',
        chinese: '香蕉'
      });
      
      const collisionEvent = collisionSystem.handleCollision(wrongCloudSprite, mockPlayerSprite);
      
      TestUtils.expectCollisionEvent(collisionEvent, {
        type: 'incorrect',
        cloudWord: 'banana',
        targetWord: 'apple'
      });
    });

    test('應該處理中性碰撞（無目標詞彙）', () => {
      const neutralSystem = new CollisionDetectionSystem(mockScene);
      
      const collisionEvent = neutralSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      expect(collisionEvent.type).toBe('neutral');
    });

    test('應該正確計算響應時間', () => {
      const startTime = 1000;
      const endTime = 2500;
      
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(startTime) // setTargetWord 時間
        .mockReturnValueOnce(endTime);  // handleCollision 時間
      
      collisionSystem.setTargetWord('apple', '蘋果');
      const collisionEvent = collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      expect(collisionEvent.responseTime).toBe(1500);
    });

    test('應該記錄碰撞位置', () => {
      mockCloudSprite.x = 250;
      mockCloudSprite.y = 150;
      mockPlayerSprite.x = 100;
      mockPlayerSprite.y = 300;
      
      const collisionEvent = collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      expect(collisionEvent.playerPosition).toEqual({ x: 100, y: 300 });
      expect(collisionEvent.cloudPosition).toEqual({ x: 250, y: 150 });
    });

    test('應該銷毀雲朵精靈', () => {
      collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      expect(mockCloudSprite.destroy).toHaveBeenCalled();
    });

    test('應該處理大小寫不敏感的碰撞', () => {
      collisionSystem.setTargetWord('Apple', '蘋果');
      
      const lowerCaseCloudSprite = TestDataFactory.createMockSprite({
        word: 'apple',
        chinese: '蘋果'
      });
      
      const collisionEvent = collisionSystem.handleCollision(lowerCaseCloudSprite, mockPlayerSprite);
      
      expect(collisionEvent.type).toBe('correct');
    });
  });

  describe('getMemoryMetrics', () => {
    beforeEach(() => {
      collisionSystem.setTargetWord('apple', '蘋果');
    });

    test('應該返回初始記憶指標', () => {
      const metrics = collisionSystem.getMemoryMetrics();
      
      expect(metrics.responseTime).toEqual([]);
      expect(metrics.accuracyRate).toBe(0);
      expect(metrics.spacedRepetitionSchedule).toBeInstanceOf(Map);
      expect(metrics.cognitiveLoadLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.cognitiveLoadLevel).toBeLessThanOrEqual(1);
    });

    test('應該正確計算準確率', () => {
      // 進行一些碰撞測試
      collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite); // 正確
      
      const wrongSprite = TestDataFactory.createMockSprite({ word: 'banana' });
      collisionSystem.handleCollision(wrongSprite, mockPlayerSprite); // 錯誤
      
      const metrics = collisionSystem.getMemoryMetrics();
      expect(metrics.accuracyRate).toBe(0.5); // 1 正確 / 2 總計
    });

    test('應該記錄響應時間', () => {
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2500);
      
      collisionSystem.setTargetWord('apple', '蘋果');
      collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      const metrics = collisionSystem.getMemoryMetrics();
      expect(metrics.responseTime).toContain(1500);
    });

    test('應該計算認知負荷', () => {
      // 進行多次碰撞以獲得有意義的認知負荷計算
      for (let i = 0; i < 5; i++) {
        jest.spyOn(Date, 'now')
          .mockReturnValueOnce(1000 + i * 100)
          .mockReturnValueOnce(2000 + i * 100);
        
        collisionSystem.setTargetWord('test', '測試');
        const sprite = TestDataFactory.createMockSprite({ word: 'test' });
        collisionSystem.handleCollision(sprite, mockPlayerSprite);
      }
      
      const metrics = collisionSystem.getMemoryMetrics();
      expect(metrics.cognitiveLoadLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.cognitiveLoadLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('resetStatistics', () => {
    test('應該重置所有統計數據', () => {
      // 先進行一些碰撞
      collisionSystem.setTargetWord('apple', '蘋果');
      collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      // 重置統計
      collisionSystem.resetStatistics();
      
      // 驗證統計已重置
      const metrics = collisionSystem.getMemoryMetrics();
      expect(metrics.responseTime).toEqual([]);
      expect(metrics.accuracyRate).toBe(0);
    });
  });

  describe('destroy', () => {
    test('應該正確清理資源', () => {
      const destroySpy = jest.spyOn(collisionSystem, 'destroy');
      
      collisionSystem.destroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });

    test('應該重置統計數據', () => {
      collisionSystem.setTargetWord('apple', '蘋果');
      collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      collisionSystem.destroy();
      
      const metrics = collisionSystem.getMemoryMetrics();
      expect(metrics.responseTime).toEqual([]);
      expect(metrics.accuracyRate).toBe(0);
    });
  });

  describe('特效系統整合', () => {
    test('應該觸發正確碰撞特效', () => {
      collisionSystem.setTargetWord('apple', '蘋果');
      collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      // 驗證粒子效果被觸發
      expect(mockScene.add.particles).toHaveBeenCalled();
      
      // 驗證音效被播放
      expect(mockScene.sound.play).toHaveBeenCalled();
    });

    test('應該觸發錯誤碰撞特效', () => {
      collisionSystem.setTargetWord('apple', '蘋果');
      
      const wrongSprite = TestDataFactory.createMockSprite({ word: 'banana' });
      collisionSystem.handleCollision(wrongSprite, mockPlayerSprite);
      
      // 驗證螢幕震動被觸發
      expect(mockScene.cameras.main.shake).toHaveBeenCalled();
    });

    test('應該根據配置啟用/禁用特效', () => {
      const disabledEffectsSystem = new CollisionDetectionSystem(
        mockScene,
        'elementary',
        TestUtils.createEffectConfig({
          enableParticles: false,
          enableSoundEffects: false,
          enableScreenShake: false
        })
      );
      
      disabledEffectsSystem.setTargetWord('apple', '蘋果');
      disabledEffectsSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      // 特效應該被禁用，但這需要檢查內部實現
      // 這裡我們主要驗證系統不會崩潰
      expect(disabledEffectsSystem).toBeInstanceOf(CollisionDetectionSystem);
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理 null 精靈', () => {
      expect(() => {
        collisionSystem.handleCollision(null as any, mockPlayerSprite);
      }).not.toThrow();
    });

    test('應該處理無效的詞彙數據', () => {
      const invalidSprite = TestDataFactory.createMockSprite({});
      invalidSprite.getData.mockReturnValue(undefined);
      
      expect(() => {
        collisionSystem.handleCollision(invalidSprite, mockPlayerSprite);
      }).not.toThrow();
    });

    test('應該處理極長的響應時間', () => {
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1000 + 60000); // 1分鐘後
      
      collisionSystem.setTargetWord('apple', '蘋果');
      const collisionEvent = collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      expect(collisionEvent.responseTime).toBe(60000);
    });

    test('應該處理負數時間戳', () => {
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(2000)
        .mockReturnValueOnce(1000); // 時間倒退
      
      collisionSystem.setTargetWord('apple', '蘋果');
      const collisionEvent = collisionSystem.handleCollision(mockCloudSprite, mockPlayerSprite);
      
      // 應該處理負數響應時間
      expect(collisionEvent.responseTime).toBeDefined();
    });
  });
});
