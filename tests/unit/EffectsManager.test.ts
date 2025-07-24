/**
 * EffectsManager 單元測試
 * 
 * 任務: Task 1.1.4 - 測試用例設計和實現
 * 目標: 為特效管理系統創建完整的單元測試
 * 狀態: 開發階段 (1/5)
 */

import { EffectsManager, AudioConfig, VisualEffectConfig, HapticConfig } from '../../components/games/AirplaneCollisionGame/EffectsManager';

// Mock Phaser Scene
const mockScene = {
  add: {
    particles: jest.fn().mockReturnValue({
      setPosition: jest.fn(),
      explode: jest.fn(),
      destroy: jest.fn(),
      quantity: 15
    }),
    rectangle: jest.fn().mockReturnValue({
      setDepth: jest.fn(),
      destroy: jest.fn()
    })
  },
  sound: {
    play: jest.fn().mockReturnValue({
      setVolume: jest.fn(),
      volume: 0.7
    }),
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
const mockVibrate = jest.fn();
Object.defineProperty(global.navigator, 'vibrate', {
  value: mockVibrate,
  writable: true
});

// Test Data Factory
class EffectsTestFactory {
  static createAudioConfig(overrides: Partial<AudioConfig> = {}): AudioConfig {
    return {
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.5,
      enableSpatialAudio: true,
      enableDynamicRange: true,
      ...overrides
    };
  }

  static createVisualConfig(overrides: Partial<VisualEffectConfig> = {}): VisualEffectConfig {
    return {
      enableParticles: true,
      enableScreenEffects: true,
      enableLighting: false,
      particleQuality: 'medium',
      effectIntensity: 0.7,
      ...overrides
    };
  }

  static createHapticConfig(overrides: Partial<HapticConfig> = {}): HapticConfig {
    return {
      enableVibration: true,
      intensity: 0.6,
      enablePatterns: true,
      ...overrides
    };
  }
}

describe('EffectsManager', () => {
  let effectsManager: EffectsManager;
  let audioConfig: AudioConfig;
  let visualConfig: VisualEffectConfig;
  let hapticConfig: HapticConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    audioConfig = EffectsTestFactory.createAudioConfig();
    visualConfig = EffectsTestFactory.createVisualConfig();
    hapticConfig = EffectsTestFactory.createHapticConfig();

    effectsManager = new EffectsManager(
      mockScene,
      audioConfig,
      visualConfig,
      hapticConfig
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    test('應該正確初始化特效管理器', () => {
      expect(effectsManager).toBeInstanceOf(EffectsManager);
    });

    test('應該使用預設配置初始化', () => {
      const defaultManager = new EffectsManager(mockScene);
      expect(defaultManager).toBeInstanceOf(EffectsManager);
    });

    test('應該正確設置配置參數', () => {
      const customAudioConfig = EffectsTestFactory.createAudioConfig({
        masterVolume: 0.5,
        sfxVolume: 0.3
      });
      
      const customManager = new EffectsManager(mockScene, customAudioConfig);
      expect(customManager).toBeInstanceOf(EffectsManager);
    });
  });

  describe('playSound', () => {
    test('應該播放基本音效', () => {
      effectsManager.playSound('collision-correct');
      
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-correct',
        expect.objectContaining({
          volume: expect.any(Number),
          rate: 1,
          loop: false
        })
      );
    });

    test('應該正確計算音量', () => {
      const customVolume = 0.5;
      effectsManager.playSound('collision-correct', { volume: customVolume });
      
      // 最終音量 = customVolume * sfxVolume * masterVolume
      const expectedVolume = customVolume * audioConfig.sfxVolume * audioConfig.masterVolume;
      
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-correct',
        expect.objectContaining({
          volume: expectedVolume
        })
      );
    });

    test('應該支援音調調整', () => {
      const customPitch = 1.5;
      effectsManager.playSound('collision-correct', { pitch: customPitch });
      
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-correct',
        expect.objectContaining({
          rate: customPitch
        })
      );
    });

    test('應該支援循環播放', () => {
      effectsManager.playSound('background-music', { loop: true });
      
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'background-music',
        expect.objectContaining({
          loop: true
        })
      );
    });

    test('應該處理空間音效', () => {
      // 確保 Phaser.Math.Distance.Between 被正確 Mock
      if (!global.Phaser.Math) {
        global.Phaser.Math = {
          Distance: { Between: jest.fn().mockReturnValue(100) }
        };
      }
      const mockDistance = jest.spyOn(global.Phaser.Math.Distance, 'Between').mockReturnValue(100);

      const spatialPosition = { x: 200, y: 300 };
      effectsManager.playSound('collision-correct', { spatial: spatialPosition });

      expect(mockScene.sound.play).toHaveBeenCalled();
      expect(mockDistance).toHaveBeenCalled();

      // 清理 Mock
      mockDistance.mockRestore();
    });

    test('應該處理不存在的音效', () => {
      // 模擬音效不存在
      mockScene.sound.get.mockReturnValue(false);
      
      expect(() => {
        effectsManager.playSound('non-existent-sound');
      }).not.toThrow();
    });
  });

  describe('triggerParticleEffect', () => {
    test('應該觸發基本粒子效果', () => {
      const x = 100;
      const y = 200;
      
      effectsManager.triggerParticleEffect('correct-collision', x, y);
      
      // 驗證粒子系統被正確設置
      const particleEmitter = mockScene.add.particles();
      expect(particleEmitter.setPosition).toHaveBeenCalledWith(x, y);
      expect(particleEmitter.explode).toHaveBeenCalled();
    });

    test('應該根據強度調整粒子數量', () => {
      const intensity = 1.5;
      
      effectsManager.triggerParticleEffect('correct-collision', 100, 200, intensity);
      
      const particleEmitter = mockScene.add.particles();
      expect(particleEmitter.explode).toHaveBeenCalledWith(
        expect.any(Number) // 調整後的粒子數量
      );
    });

    test('應該處理不存在的粒子效果', () => {
      expect(() => {
        effectsManager.triggerParticleEffect('non-existent-effect', 100, 200);
      }).not.toThrow();
    });

    test('應該根據品質設定調整粒子數量', () => {
      const lowQualityConfig = EffectsTestFactory.createVisualConfig({
        particleQuality: 'low'
      });
      
      const lowQualityManager = new EffectsManager(mockScene, {}, lowQualityConfig);
      lowQualityManager.triggerParticleEffect('correct-collision', 100, 200);
      
      expect(mockScene.add.particles).toHaveBeenCalled();
    });
  });

  describe('triggerScreenShake', () => {
    test('應該觸發基本螢幕震動', () => {
      effectsManager.triggerScreenShake();
      
      expect(mockScene.cameras.main.shake).toHaveBeenCalledWith(
        200, // 預設持續時間
        expect.any(Number) // 調整後的強度
      );
    });

    test('應該支援自定義持續時間和強度', () => {
      const duration = 500;
      const intensity = 0.05;
      
      effectsManager.triggerScreenShake(duration, intensity);
      
      expect(mockScene.cameras.main.shake).toHaveBeenCalledWith(
        duration,
        intensity * visualConfig.effectIntensity
      );
    });

    test('應該在禁用螢幕效果時不觸發震動', () => {
      const disabledVisualConfig = EffectsTestFactory.createVisualConfig({
        enableScreenEffects: false
      });
      
      const disabledManager = new EffectsManager(mockScene, {}, disabledVisualConfig);
      disabledManager.triggerScreenShake();
      
      expect(mockScene.cameras.main.shake).not.toHaveBeenCalled();
    });
  });

  describe('triggerFlashEffect', () => {
    test('應該觸發基本閃光效果', () => {
      effectsManager.triggerFlashEffect();
      
      expect(mockScene.add.rectangle).toHaveBeenCalled();
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });

    test('應該支援自定義顏色和持續時間', () => {
      const color = 0xff0000; // 紅色
      const duration = 300;
      const alpha = 0.8;
      
      effectsManager.triggerFlashEffect(color, duration, alpha);
      
      expect(mockScene.add.rectangle).toHaveBeenCalledWith(
        mockScene.cameras.main.centerX,
        mockScene.cameras.main.centerY,
        mockScene.cameras.main.width,
        mockScene.cameras.main.height,
        color,
        alpha * visualConfig.effectIntensity
      );
    });

    test('應該在禁用螢幕效果時不觸發閃光', () => {
      const disabledVisualConfig = EffectsTestFactory.createVisualConfig({
        enableScreenEffects: false
      });
      
      const disabledManager = new EffectsManager(mockScene, {}, disabledVisualConfig);
      disabledManager.triggerFlashEffect();
      
      expect(mockScene.add.rectangle).not.toHaveBeenCalled();
    });
  });

  describe('triggerHapticFeedback', () => {
    test('應該觸發基本觸覺反饋', () => {
      effectsManager.triggerHapticFeedback('short');
      
      expect(mockVibrate).toHaveBeenCalledWith([
        Math.floor(50 * hapticConfig.intensity)
      ]);
    });

    test('應該支援不同的震動模式', () => {
      effectsManager.triggerHapticFeedback('double');
      
      expect(mockVibrate).toHaveBeenCalledWith([
        Math.floor(50 * hapticConfig.intensity),
        Math.floor(50 * hapticConfig.intensity),
        Math.floor(50 * hapticConfig.intensity)
      ]);
    });

    test('應該支援自定義震動模式', () => {
      const customPattern = [100, 50, 100];
      effectsManager.triggerHapticFeedback(customPattern);
      
      const expectedPattern = customPattern.map(
        duration => Math.floor(duration * hapticConfig.intensity)
      );
      
      expect(mockVibrate).toHaveBeenCalledWith(expectedPattern);
    });

    test('應該在禁用震動時不觸發反饋', () => {
      const disabledHapticConfig = EffectsTestFactory.createHapticConfig({
        enableVibration: false
      });
      
      const disabledManager = new EffectsManager(mockScene, {}, {}, disabledHapticConfig);
      disabledManager.triggerHapticFeedback('short');
      
      expect(mockVibrate).not.toHaveBeenCalled();
    });

    test('應該在不支援震動的瀏覽器中優雅處理', () => {
      // 保存原始的 vibrate 方法
      const originalVibrate = global.navigator.vibrate;

      // 設置 vibrate 為 undefined
      Object.defineProperty(global.navigator, 'vibrate', {
        value: undefined,
        configurable: true
      });

      const noVibrateManager = new EffectsManager(mockScene, {}, {}, hapticConfig);

      expect(() => {
        noVibrateManager.triggerHapticFeedback('short');
      }).not.toThrow();

      // 恢復原始的 vibrate 方法
      Object.defineProperty(global.navigator, 'vibrate', {
        value: originalVibrate,
        configurable: true
      });
    });
  });

  describe('組合效果方法', () => {
    test('應該播放正確碰撞組合效果', () => {
      // 確保 Phaser.Math.Distance.Between 被正確 Mock
      if (!global.Phaser.Math) {
        global.Phaser.Math = {
          Distance: { Between: jest.fn().mockReturnValue(100) }
        };
      }
      const mockDistance = jest.spyOn(global.Phaser.Math.Distance, 'Between').mockReturnValue(100);

      const x = 150;
      const y = 250;

      effectsManager.playCorrectCollisionEffect(x, y);

      // 驗證音效被播放
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-correct',
        expect.objectContaining({
          volume: expect.any(Number),
          rate: 1.2,
          loop: false
        })
      );

      // 驗證粒子效果被觸發
      expect(mockScene.add.particles).toHaveBeenCalled();

      // 驗證閃光效果被觸發
      expect(mockScene.add.rectangle).toHaveBeenCalled();

      // 驗證觸覺反饋被觸發
      expect(mockVibrate).toHaveBeenCalled();

      // 清理 Mock
      mockDistance.mockRestore();
    });

    test('應該播放錯誤碰撞組合效果', () => {
      // 確保 Phaser.Math.Distance.Between 被正確 Mock
      if (!global.Phaser.Math) {
        global.Phaser.Math = {
          Distance: { Between: jest.fn().mockReturnValue(100) }
        };
      }
      const mockDistance = jest.spyOn(global.Phaser.Math.Distance, 'Between').mockReturnValue(100);

      const x = 150;
      const y = 250;

      effectsManager.playIncorrectCollisionEffect(x, y);

      // 驗證音效被播放
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-incorrect',
        expect.objectContaining({
          volume: expect.any(Number),
          rate: 0.8,
          loop: false
        })
      );

      // 驗證螢幕震動被觸發
      expect(mockScene.cameras.main.shake).toHaveBeenCalled();

      // 驗證粒子效果被觸發
      expect(mockScene.add.particles).toHaveBeenCalled();

      // 驗證閃光效果被觸發
      expect(mockScene.add.rectangle).toHaveBeenCalled();

      // 驗證觸覺反饋被觸發
      expect(mockVibrate).toHaveBeenCalled();

      // 清理 Mock
      mockDistance.mockRestore();
    });

    test('應該播放中性碰撞組合效果', () => {
      // 確保 Phaser.Math.Distance.Between 被正確 Mock
      if (!global.Phaser.Math) {
        global.Phaser.Math = {
          Distance: { Between: jest.fn().mockReturnValue(100) }
        };
      }
      const mockDistance = jest.spyOn(global.Phaser.Math.Distance, 'Between').mockReturnValue(100);

      const x = 150;
      const y = 250;

      effectsManager.playNeutralCollisionEffect(x, y);

      // 驗證音效被播放
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-neutral',
        expect.objectContaining({
          volume: expect.any(Number),
          rate: 1,
          loop: false
        })
      );

      // 驗證粒子效果被觸發
      expect(mockScene.add.particles).toHaveBeenCalled();

      // 驗證觸覺反饋被觸發
      expect(mockVibrate).toHaveBeenCalled();

      // 清理 Mock
      mockDistance.mockRestore();
    });
  });

  describe('配置更新', () => {
    test('應該更新音效配置', () => {
      const newAudioConfig = {
        masterVolume: 0.5,
        sfxVolume: 0.3
      };
      
      effectsManager.updateAudioConfig(newAudioConfig);
      
      // 驗證配置更新後的音效播放
      effectsManager.playSound('collision-correct');
      
      const expectedVolume = 1 * newAudioConfig.sfxVolume * newAudioConfig.masterVolume;
      expect(mockScene.sound.play).toHaveBeenCalledWith(
        'collision-correct',
        expect.objectContaining({
          volume: expectedVolume
        })
      );
    });

    test('應該更新視覺效果配置', () => {
      const newVisualConfig = {
        effectIntensity: 0.3
      };
      
      effectsManager.updateVisualConfig(newVisualConfig);
      
      // 驗證配置更新後的螢幕震動
      effectsManager.triggerScreenShake(200, 0.01);
      
      expect(mockScene.cameras.main.shake).toHaveBeenCalledWith(
        200,
        0.01 * newVisualConfig.effectIntensity
      );
    });

    test('應該更新觸覺反饋配置', () => {
      const newHapticConfig = {
        intensity: 0.3
      };
      
      effectsManager.updateHapticConfig(newHapticConfig);
      
      // 驗證配置更新後的觸覺反饋
      effectsManager.triggerHapticFeedback('short');
      
      expect(mockVibrate).toHaveBeenCalledWith([
        Math.floor(50 * newHapticConfig.intensity)
      ]);
    });
  });

  describe('destroy', () => {
    test('應該正確清理所有資源', () => {
      effectsManager.destroy();
      
      // 驗證粒子系統被清理
      const particleEmitter = mockScene.add.particles();
      expect(particleEmitter.destroy).toHaveBeenCalled();
    });

    test('應該清理音效資源', () => {
      effectsManager.destroy();
      
      // 驗證清理過程不會拋出異常
      expect(() => effectsManager.destroy()).not.toThrow();
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理極端音量值', () => {
      effectsManager.playSound('collision-correct', { volume: 10 }); // 超過正常範圍
      expect(mockScene.sound.play).toHaveBeenCalled();
      
      effectsManager.playSound('collision-correct', { volume: -1 }); // 負值
      expect(mockScene.sound.play).toHaveBeenCalled();
    });

    test('應該處理極端強度值', () => {
      effectsManager.triggerParticleEffect('correct-collision', 100, 200, 100); // 極高強度
      expect(mockScene.add.particles).toHaveBeenCalled();
      
      effectsManager.triggerParticleEffect('correct-collision', 100, 200, -1); // 負強度
      expect(mockScene.add.particles).toHaveBeenCalled();
    });

    test('應該處理無效的位置值', () => {
      effectsManager.triggerParticleEffect('correct-collision', NaN, Infinity);
      expect(mockScene.add.particles).toHaveBeenCalled();
    });

    test('應該處理空的震動模式', () => {
      effectsManager.triggerHapticFeedback([]);
      expect(mockVibrate).toHaveBeenCalledWith([]);
    });
  });
});
