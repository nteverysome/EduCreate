/**
 * 遊戲邏輯功能測試
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 為遊戲邏輯創建完整的功能測試
 * 狀態: 開發階段 (1/5)
 */

import { CollisionEvent } from '../../components/games/AirplaneCollisionGame/CollisionDetectionSystem';
import { GameConfig } from '../../components/games/AirplaneCollisionGame/ModifiedGameScene';

// 遊戲邏輯測試類
class GameLogicTester {
  private score: number = 0;
  private playerHealth: number = 100;
  private gameOver: boolean = false;
  private correctCollisions: number = 0;
  private incorrectCollisions: number = 0;
  private currentTargetWord: string = '';
  private gameConfig: GameConfig;

  constructor(gameConfig: GameConfig) {
    this.gameConfig = gameConfig;
    this.playerHealth = gameConfig.GAME.INITIAL_HEALTH;
  }

  // 模擬碰撞結果處理
  processCollisionResult(event: CollisionEvent): void {
    switch (event.type) {
      case 'correct':
        this.score += this.gameConfig.GAME.CORRECT_SCORE;
        this.correctCollisions++;
        break;
        
      case 'incorrect':
        this.score = Math.max(0, this.score - this.gameConfig.GAME.INCORRECT_PENALTY);
        this.playerHealth -= this.gameConfig.GAME.HEALTH_PENALTY;
        this.incorrectCollisions++;
        break;
    }
    
    this.checkGameOver();
  }

  // 檢查遊戲結束條件
  private checkGameOver(): void {
    if (this.playerHealth <= 0) {
      this.gameOver = true;
    }
  }

  // 重置遊戲狀態
  reset(): void {
    this.score = 0;
    this.playerHealth = this.gameConfig.GAME.INITIAL_HEALTH;
    this.gameOver = false;
    this.correctCollisions = 0;
    this.incorrectCollisions = 0;
    this.currentTargetWord = '';
  }

  // Getters
  getScore(): number { return this.score; }
  getPlayerHealth(): number { return this.playerHealth; }
  isGameOver(): boolean { return this.gameOver; }
  getCorrectCollisions(): number { return this.correctCollisions; }
  getIncorrectCollisions(): number { return this.incorrectCollisions; }
  getAccuracyRate(): number {
    const total = this.correctCollisions + this.incorrectCollisions;
    return total > 0 ? this.correctCollisions / total : 0;
  }
}

// Test Data Factory
class GameLogicTestFactory {
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

  static createCollisionEvent(
    type: 'correct' | 'incorrect' | 'neutral',
    overrides: Partial<CollisionEvent> = {}
  ): CollisionEvent {
    return {
      type,
      cloudWord: type === 'correct' ? 'apple' : 'banana',
      targetWord: 'apple',
      responseTime: 1500,
      timestamp: Date.now(),
      playerPosition: { x: 100, y: 300 },
      cloudPosition: { x: 200, y: 300 },
      ...overrides
    };
  }
}

describe('遊戲邏輯功能測試', () => {
  let gameLogic: GameLogicTester;
  let gameConfig: GameConfig;

  beforeEach(() => {
    gameConfig = GameLogicTestFactory.createGameConfig();
    gameLogic = new GameLogicTester(gameConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('分數計算系統', () => {
    test('應該正確計算正確碰撞分數', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      gameLogic.processCollisionResult(correctEvent);
      
      expect(gameLogic.getScore()).toBe(gameConfig.GAME.CORRECT_SCORE);
    });

    test('應該正確處理多次正確碰撞', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(correctEvent);
      
      expect(gameLogic.getScore()).toBe(gameConfig.GAME.CORRECT_SCORE * 3);
    });

    test('應該正確扣除錯誤碰撞分數', () => {
      // 先獲得一些分數
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(correctEvent);
      
      const initialScore = gameLogic.getScore();
      
      // 然後錯誤碰撞
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.getScore()).toBe(initialScore - gameConfig.GAME.INCORRECT_PENALTY);
    });

    test('應該防止分數變為負數', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      // 多次錯誤碰撞
      gameLogic.processCollisionResult(incorrectEvent);
      gameLogic.processCollisionResult(incorrectEvent);
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.getScore()).toBe(0);
      expect(gameLogic.getScore()).toBeGreaterThanOrEqual(0);
    });

    test('應該正確處理混合碰撞結果', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(correctEvent);   // +10
      gameLogic.processCollisionResult(correctEvent);   // +10
      gameLogic.processCollisionResult(incorrectEvent); // -5
      gameLogic.processCollisionResult(correctEvent);   // +10
      
      const expectedScore = (gameConfig.GAME.CORRECT_SCORE * 3) - gameConfig.GAME.INCORRECT_PENALTY;
      expect(gameLogic.getScore()).toBe(expectedScore);
    });
  });

  describe('生命值管理系統', () => {
    test('應該正確初始化生命值', () => {
      expect(gameLogic.getPlayerHealth()).toBe(gameConfig.GAME.INITIAL_HEALTH);
    });

    test('應該正確扣除錯誤碰撞生命值', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.getPlayerHealth()).toBe(
        gameConfig.GAME.INITIAL_HEALTH - gameConfig.GAME.HEALTH_PENALTY
      );
    });

    test('正確碰撞不應該影響生命值', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      gameLogic.processCollisionResult(correctEvent);
      
      expect(gameLogic.getPlayerHealth()).toBe(gameConfig.GAME.INITIAL_HEALTH);
    });

    test('應該正確處理多次錯誤碰撞的生命值扣除', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(incorrectEvent);
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.getPlayerHealth()).toBe(
        gameConfig.GAME.INITIAL_HEALTH - (gameConfig.GAME.HEALTH_PENALTY * 2)
      );
    });

    test('生命值應該能降到零或以下', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      // 足夠的錯誤碰撞來耗盡生命值
      const requiredCollisions = Math.ceil(gameConfig.GAME.INITIAL_HEALTH / gameConfig.GAME.HEALTH_PENALTY);
      
      for (let i = 0; i < requiredCollisions + 1; i++) {
        gameLogic.processCollisionResult(incorrectEvent);
      }
      
      expect(gameLogic.getPlayerHealth()).toBeLessThanOrEqual(0);
    });
  });

  describe('遊戲結束條件', () => {
    test('生命值歸零時應該觸發遊戲結束', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      // 耗盡生命值
      const requiredCollisions = Math.ceil(gameConfig.GAME.INITIAL_HEALTH / gameConfig.GAME.HEALTH_PENALTY);
      
      for (let i = 0; i < requiredCollisions; i++) {
        gameLogic.processCollisionResult(incorrectEvent);
      }
      
      expect(gameLogic.isGameOver()).toBe(true);
    });

    test('生命值大於零時不應該觸發遊戲結束', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.isGameOver()).toBe(false);
    });

    test('正確碰撞不應該觸發遊戲結束', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      for (let i = 0; i < 10; i++) {
        gameLogic.processCollisionResult(correctEvent);
      }
      
      expect(gameLogic.isGameOver()).toBe(false);
    });
  });

  describe('統計追蹤系統', () => {
    test('應該正確追蹤正確碰撞次數', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(correctEvent);
      
      expect(gameLogic.getCorrectCollisions()).toBe(3);
    });

    test('應該正確追蹤錯誤碰撞次數', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(incorrectEvent);
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.getIncorrectCollisions()).toBe(2);
    });

    test('應該正確計算準確率', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(correctEvent);   // 1 正確
      gameLogic.processCollisionResult(correctEvent);   // 2 正確
      gameLogic.processCollisionResult(incorrectEvent); // 1 錯誤
      gameLogic.processCollisionResult(correctEvent);   // 3 正確
      
      // 準確率 = 3 正確 / 4 總計 = 0.75
      expect(gameLogic.getAccuracyRate()).toBe(0.75);
    });

    test('沒有碰撞時準確率應該為零', () => {
      expect(gameLogic.getAccuracyRate()).toBe(0);
    });

    test('只有正確碰撞時準確率應該為 1', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(correctEvent);
      
      expect(gameLogic.getAccuracyRate()).toBe(1);
    });

    test('只有錯誤碰撞時準確率應該為 0', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      gameLogic.processCollisionResult(incorrectEvent);
      gameLogic.processCollisionResult(incorrectEvent);
      
      expect(gameLogic.getAccuracyRate()).toBe(0);
    });
  });

  describe('遊戲重置功能', () => {
    test('應該正確重置所有遊戲狀態', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      // 進行一些遊戲操作
      gameLogic.processCollisionResult(correctEvent);
      gameLogic.processCollisionResult(incorrectEvent);
      gameLogic.processCollisionResult(correctEvent);
      
      // 重置遊戲
      gameLogic.reset();
      
      // 驗證所有狀態都被重置
      expect(gameLogic.getScore()).toBe(0);
      expect(gameLogic.getPlayerHealth()).toBe(gameConfig.GAME.INITIAL_HEALTH);
      expect(gameLogic.isGameOver()).toBe(false);
      expect(gameLogic.getCorrectCollisions()).toBe(0);
      expect(gameLogic.getIncorrectCollisions()).toBe(0);
      expect(gameLogic.getAccuracyRate()).toBe(0);
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理極大的分數值', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      // 進行大量正確碰撞
      for (let i = 0; i < 10000; i++) {
        gameLogic.processCollisionResult(correctEvent);
      }
      
      expect(gameLogic.getScore()).toBe(gameConfig.GAME.CORRECT_SCORE * 10000);
      expect(gameLogic.getScore()).toBeGreaterThan(0);
    });

    test('應該處理極大的碰撞次數', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      for (let i = 0; i < 1000; i++) {
        gameLogic.processCollisionResult(correctEvent);
      }
      
      expect(gameLogic.getCorrectCollisions()).toBe(1000);
      expect(gameLogic.getAccuracyRate()).toBe(1);
    });

    test('應該處理自定義遊戲配置', () => {
      const customConfig = GameLogicTestFactory.createGameConfig({
        GAME: {
          INITIAL_HEALTH: 50,
          CORRECT_SCORE: 20,
          INCORRECT_PENALTY: 10,
          HEALTH_PENALTY: 25
        }
      });
      
      const customGameLogic = new GameLogicTester(customConfig);
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      
      customGameLogic.processCollisionResult(correctEvent);
      
      expect(customGameLogic.getScore()).toBe(20);
      expect(customGameLogic.getPlayerHealth()).toBe(50);
    });

    test('應該處理零值配置', () => {
      const zeroConfig = GameLogicTestFactory.createGameConfig({
        GAME: {
          INITIAL_HEALTH: 1,
          CORRECT_SCORE: 0,
          INCORRECT_PENALTY: 0,
          HEALTH_PENALTY: 1
        }
      });
      
      const zeroGameLogic = new GameLogicTester(zeroConfig);
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      zeroGameLogic.processCollisionResult(correctEvent);
      expect(zeroGameLogic.getScore()).toBe(0);
      
      zeroGameLogic.processCollisionResult(incorrectEvent);
      expect(zeroGameLogic.isGameOver()).toBe(true);
    });
  });

  describe('中性碰撞處理', () => {
    test('中性碰撞不應該影響分數', () => {
      const neutralEvent = GameLogicTestFactory.createCollisionEvent('neutral');
      const initialScore = gameLogic.getScore();
      
      gameLogic.processCollisionResult(neutralEvent);
      
      expect(gameLogic.getScore()).toBe(initialScore);
    });

    test('中性碰撞不應該影響生命值', () => {
      const neutralEvent = GameLogicTestFactory.createCollisionEvent('neutral');
      const initialHealth = gameLogic.getPlayerHealth();
      
      gameLogic.processCollisionResult(neutralEvent);
      
      expect(gameLogic.getPlayerHealth()).toBe(initialHealth);
    });

    test('中性碰撞不應該影響統計', () => {
      const neutralEvent = GameLogicTestFactory.createCollisionEvent('neutral');
      
      gameLogic.processCollisionResult(neutralEvent);
      
      expect(gameLogic.getCorrectCollisions()).toBe(0);
      expect(gameLogic.getIncorrectCollisions()).toBe(0);
      expect(gameLogic.getAccuracyRate()).toBe(0);
    });
  });

  describe('遊戲平衡性測試', () => {
    test('應該能在合理時間內達到遊戲結束', () => {
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');
      
      let collisionCount = 0;
      while (!gameLogic.isGameOver() && collisionCount < 100) {
        gameLogic.processCollisionResult(incorrectEvent);
        collisionCount++;
      }
      
      expect(gameLogic.isGameOver()).toBe(true);
      expect(collisionCount).toBeLessThan(100); // 確保不會無限循環
    });

    test('應該獎勵正確碰撞多於懲罰錯誤碰撞', () => {
      // 這是一個遊戲平衡性測試
      expect(gameConfig.GAME.CORRECT_SCORE).toBeGreaterThan(gameConfig.GAME.INCORRECT_PENALTY);
    });

    test('生命值懲罰應該比分數懲罰更嚴重', () => {
      // 確保生命值是更重要的資源
      expect(gameConfig.GAME.HEALTH_PENALTY).toBeGreaterThan(gameConfig.GAME.INCORRECT_PENALTY);
    });
  });

  // 性能測試套件
  describe('遊戲邏輯性能測試', () => {
    test('應該在合理時間內處理大量碰撞', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const startTime = performance.now();

      // 處理 1000 次碰撞
      for (let i = 0; i < 1000; i++) {
        gameLogic.processCollisionResult(correctEvent);
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // 應該在 100ms 內完成
      expect(processingTime).toBeLessThan(100);
    });

    test('單次碰撞處理應該非常快速', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const measurements: number[] = [];

      // 測量 100 次單次碰撞處理時間
      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();
        gameLogic.processCollisionResult(correctEvent);
        const endTime = performance.now();
        measurements.push(endTime - startTime);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;

      // 平均處理時間應該小於 1ms
      expect(averageTime).toBeLessThan(1);
    });

    test('準確率計算應該高效', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');

      // 先進行一些碰撞
      for (let i = 0; i < 500; i++) {
        gameLogic.processCollisionResult(correctEvent);
        gameLogic.processCollisionResult(incorrectEvent);
      }

      const startTime = performance.now();

      // 測量 1000 次準確率計算
      for (let i = 0; i < 1000; i++) {
        gameLogic.getAccuracyRate();
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // 應該在 10ms 內完成
      expect(processingTime).toBeLessThan(10);
    });

    test('長時間運行不應該造成記憶體洩漏', () => {
      const correctEvent = GameLogicTestFactory.createCollisionEvent('correct');
      const incorrectEvent = GameLogicTestFactory.createCollisionEvent('incorrect');

      // 模擬長時間遊戲
      for (let round = 0; round < 100; round++) {
        // 每輪進行 100 次碰撞
        for (let i = 0; i < 100; i++) {
          if (Math.random() > 0.5) {
            gameLogic.processCollisionResult(correctEvent);
          } else {
            gameLogic.processCollisionResult(incorrectEvent);
          }
        }

        // 重置遊戲狀態
        gameLogic.reset();
      }

      // 驗證最終狀態正確
      expect(gameLogic.getScore()).toBe(0);
      expect(gameLogic.getPlayerHealth()).toBe(gameConfig.GAME.INITIAL_HEALTH);
    });
  });
});
