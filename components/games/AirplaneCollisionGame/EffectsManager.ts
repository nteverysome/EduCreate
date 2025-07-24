/**
 * EffectsManager - 特效管理系統
 *
 * 任務: Task 1.1.5 - 代碼實現和驗證
 * 目標: 實現完整的特效管理系統，包括音效、視覺效果、觸覺反饋
 * 狀態: 開發階段 (1/5)
 */

export interface AudioConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  enableSpatialAudio: boolean;
  enableDynamicRange: boolean;
}

export interface VisualEffectConfig {
  enableParticles: boolean;
  enableScreenEffects: boolean;
  enableLighting: boolean;
  particleQuality: 'low' | 'medium' | 'high';
  effectIntensity: number; // 0-1
}

export interface HapticConfig {
  enableVibration: boolean;
  intensity: number; // 0-1
  enablePatterns: boolean;
}

export interface SpatialAudioConfig {
  x: number;
  y: number;
  maxDistance: number;
  rolloffFactor: number;
}

export class EffectsManager {
  private scene: Phaser.Scene;
  private audioConfig: AudioConfig;
  private visualConfig: VisualEffectConfig;
  private hapticConfig: HapticConfig;
  
  // 音效資源
  private audioAssets: Map<string, string> = new Map();
  private loadedSounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  
  // 粒子系統
  private particleSystems: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  
  // 螢幕效果
  private screenEffects: Map<string, Phaser.FX.Pipeline> = new Map();
  
  // 震動 API
  private vibrationAPI: any;

  constructor(
    scene: Phaser.Scene,
    audioConfig: Partial<AudioConfig> = {},
    visualConfig: Partial<VisualEffectConfig> = {},
    hapticConfig: Partial<HapticConfig> = {}
  ) {
    this.scene = scene;
    
    // 設置預設配置
    this.audioConfig = {
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.5,
      enableSpatialAudio: true,
      enableDynamicRange: true,
      ...audioConfig
    };
    
    this.visualConfig = {
      enableParticles: true,
      enableScreenEffects: true,
      enableLighting: false,
      particleQuality: 'medium',
      effectIntensity: 0.7,
      ...visualConfig
    };
    
    this.hapticConfig = {
      enableVibration: true,
      intensity: 0.6,
      enablePatterns: true,
      ...hapticConfig
    };
    
    this.initializeAudioAssets();
    this.initializeParticleSystems();
    this.initializeScreenEffects();
    this.initializeHapticAPI();
  }

  /**
   * 初始化音效資源
   */
  private initializeAudioAssets(): void {
    this.audioAssets.set('collision-correct', 'audio/effects/collision-correct.mp3');
    this.audioAssets.set('collision-incorrect', 'audio/effects/collision-incorrect.mp3');
    this.audioAssets.set('collision-neutral', 'audio/effects/collision-neutral.mp3');
    this.audioAssets.set('word-pronunciation', 'audio/speech/word-pronunciation.mp3');
    this.audioAssets.set('background-music', 'audio/music/game-background.mp3');
    this.audioAssets.set('ui-click', 'audio/ui/click.mp3');
    this.audioAssets.set('ui-hover', 'audio/ui/hover.mp3');
    this.audioAssets.set('game-start', 'audio/effects/game-start.mp3');
    this.audioAssets.set('game-over', 'audio/effects/game-over.mp3');
    this.audioAssets.set('level-up', 'audio/effects/level-up.mp3');
    
    console.log('🔊 音效資源初始化完成');
  }

  /**
   * 初始化粒子系統
   */
  private initializeParticleSystems(): void {
    if (!this.visualConfig.enableParticles) return;

    // 正確碰撞粒子 - 金色星星爆炸
    const correctParticles = this.scene.add.particles(0, 0, 'star-particle', {
      scale: { start: 0.4, end: 0 },
      speed: { min: 100, max: 200 },
      lifespan: 800,
      quantity: this.getParticleQuantity(20),
      tint: [0xffd700, 0xffff00, 0xffa500], // 金色漸變
      emitting: false,
      blendMode: 'ADD'
    });
    this.particleSystems.set('correct-collision', correctParticles);

    // 錯誤碰撞粒子 - 紅色爆炸
    const incorrectParticles = this.scene.add.particles(0, 0, 'explosion-particle', {
      scale: { start: 0.5, end: 0 },
      speed: { min: 80, max: 180 },
      lifespan: 600,
      quantity: this.getParticleQuantity(25),
      tint: [0xff0000, 0xff4444, 0xff8888], // 紅色漸變
      emitting: false,
      blendMode: 'SCREEN'
    });
    this.particleSystems.set('incorrect-collision', incorrectParticles);

    // 中性碰撞粒子 - 藍色波紋
    const neutralParticles = this.scene.add.particles(0, 0, 'ripple-particle', {
      scale: { start: 0.2, end: 1.0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 50, max: 120 },
      lifespan: 1000,
      quantity: this.getParticleQuantity(12),
      tint: [0x0088ff, 0x44aaff, 0x88ccff], // 藍色漸變
      emitting: false
    });
    this.particleSystems.set('neutral-collision', neutralParticles);

    // 目標詞彙提示粒子 - 綠色光環
    const targetHintParticles = this.scene.add.particles(0, 0, 'glow-particle', {
      scale: { start: 0.3, end: 0.6 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 20, max: 60 },
      lifespan: 1500,
      quantity: this.getParticleQuantity(8),
      tint: 0x00ff88,
      emitting: false,
      blendMode: 'ADD'
    });
    this.particleSystems.set('target-hint', targetHintParticles);

    console.log('✨ 粒子系統初始化完成');
  }

  /**
   * 根據品質設定獲取粒子數量
   */
  private getParticleQuantity(baseQuantity: number): number {
    const qualityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5
    };
    
    return Math.floor(baseQuantity * qualityMultiplier[this.visualConfig.particleQuality]);
  }

  /**
   * 初始化螢幕效果
   */
  private initializeScreenEffects(): void {
    if (!this.visualConfig.enableScreenEffects) return;

    // 螢幕震動效果
    // 在 Phaser 3 中通過相機震動實現
    
    // 閃光效果
    // 通過覆蓋層實現
    
    console.log('📺 螢幕效果初始化完成');
  }

  /**
   * 初始化觸覺反饋 API
   */
  private initializeHapticAPI(): void {
    if (!this.hapticConfig.enableVibration) return;

    // 檢查瀏覽器支援
    if ('vibrate' in navigator) {
      this.vibrationAPI = navigator.vibrate.bind(navigator);
      console.log('📳 觸覺反饋 API 初始化完成');
    } else {
      console.warn('⚠️ 瀏覽器不支援觸覺反饋');
    }
  }

  /**
   * 播放音效
   */
  playSound(
    soundKey: string,
    options: {
      volume?: number;
      pitch?: number;
      loop?: boolean;
      spatial?: { x: number; y: number };
    } = {}
  ): void {
    if (!this.audioAssets.has(soundKey)) {
      console.warn(`⚠️ 音效不存在: ${soundKey}`);
      return;
    }

    // 計算最終音量
    const finalVolume = (options.volume || 1) * 
                       this.audioConfig.sfxVolume * 
                       this.audioConfig.masterVolume;

    // 播放音效
    const sound = this.scene.sound.play(soundKey, {
      volume: finalVolume,
      rate: options.pitch || 1,
      loop: options.loop || false
    });

    // 空間音效處理
    if (options.spatial && this.audioConfig.enableSpatialAudio) {
      this.applySpatialAudio(sound, options.spatial);
    }

    console.log(`🔊 播放音效: ${soundKey} (音量: ${finalVolume.toFixed(2)})`);
  }

  /**
   * 應用空間音效
   */
  private applySpatialAudio(
    sound: Phaser.Sound.BaseSound,
    position: { x: number; y: number }
  ): void {
    // 計算距離和方向
    const camera = this.scene.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2;
    
    const distance = Phaser.Math.Distance.Between(centerX, centerY, position.x, position.y);
    const maxDistance = Math.max(camera.width, camera.height);
    
    // 根據距離調整音量
    const distanceVolume = 1 - Math.min(distance / maxDistance, 1);
    
    // 應用空間音效（簡化實現）
    if ('setVolume' in sound) {
      (sound as any).setVolume((sound as any).volume * distanceVolume);
    }
  }

  /**
   * 觸發粒子效果
   */
  triggerParticleEffect(
    effectType: string,
    x: number,
    y: number,
    intensity: number = 1
  ): void {
    const particles = this.particleSystems.get(effectType);
    if (!particles) {
      console.warn(`⚠️ 粒子效果不存在: ${effectType}`);
      return;
    }

    particles.setPosition(x, y);
    
    // 根據強度調整粒子數量
    const baseQuantity = particles.quantity as number;
    const adjustedQuantity = Math.floor(baseQuantity * intensity * this.visualConfig.effectIntensity);
    
    particles.explode(adjustedQuantity);
    
    console.log(`✨ 觸發粒子效果: ${effectType} 在 (${x}, ${y})`);
  }

  /**
   * 觸發螢幕震動
   */
  triggerScreenShake(
    duration: number = 200,
    intensity: number = 0.01
  ): void {
    if (!this.visualConfig.enableScreenEffects) return;

    const adjustedIntensity = intensity * this.visualConfig.effectIntensity;
    this.scene.cameras.main.shake(duration, adjustedIntensity);
    
    console.log(`📺 觸發螢幕震動: ${duration}ms, 強度: ${adjustedIntensity}`);
  }

  /**
   * 觸發閃光效果
   */
  triggerFlashEffect(
    color: number = 0xffffff,
    duration: number = 100,
    alpha: number = 0.5
  ): void {
    if (!this.visualConfig.enableScreenEffects) return;

    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      color,
      alpha * this.visualConfig.effectIntensity
    );
    
    flash.setDepth(1000); // 確保在最上層
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      ease: 'Power2.easeOut',
      onComplete: () => {
        flash.destroy();
      }
    });
    
    console.log(`💡 觸發閃光效果: 顏色 0x${color.toString(16)}`);
  }

  /**
   * 觸發觸覺反饋
   */
  triggerHapticFeedback(
    pattern: 'short' | 'medium' | 'long' | 'double' | 'triple' | number[]
  ): void {
    if (!this.hapticConfig.enableVibration || !this.vibrationAPI) return;

    const patterns = {
      short: [50],
      medium: [100],
      long: [200],
      double: [50, 50, 50],
      triple: [50, 50, 50, 50, 50]
    };

    const vibrationPattern = Array.isArray(pattern) ? pattern : patterns[pattern];
    
    // 根據強度調整震動時間
    const adjustedPattern = vibrationPattern.map(
      duration => Math.floor(duration * this.hapticConfig.intensity)
    );

    this.vibrationAPI(adjustedPattern);
    
    console.log(`📳 觸發觸覺反饋: ${pattern}`);
  }

  /**
   * 組合效果 - 正確碰撞
   */
  playCorrectCollisionEffect(x: number, y: number): void {
    // 音效
    this.playSound('collision-correct', {
      volume: 0.8,
      pitch: 1.2,
      spatial: { x, y }
    });
    
    // 粒子效果
    this.triggerParticleEffect('correct-collision', x, y, 1.2);
    
    // 閃光效果
    this.triggerFlashEffect(0x00ff00, 150, 0.3);
    
    // 觸覺反饋
    this.triggerHapticFeedback('double');
    
    console.log('🎉 播放正確碰撞組合效果');
  }

  /**
   * 組合效果 - 錯誤碰撞
   */
  playIncorrectCollisionEffect(x: number, y: number): void {
    // 音效
    this.playSound('collision-incorrect', {
      volume: 0.9,
      pitch: 0.8,
      spatial: { x, y }
    });
    
    // 粒子效果
    this.triggerParticleEffect('incorrect-collision', x, y, 1.0);
    
    // 螢幕震動
    this.triggerScreenShake(300, 0.02);
    
    // 閃光效果
    this.triggerFlashEffect(0xff0000, 200, 0.4);
    
    // 觸覺反饋
    this.triggerHapticFeedback('long');
    
    console.log('💥 播放錯誤碰撞組合效果');
  }

  /**
   * 組合效果 - 中性碰撞
   */
  playNeutralCollisionEffect(x: number, y: number): void {
    // 音效
    this.playSound('collision-neutral', {
      volume: 0.5,
      spatial: { x, y }
    });
    
    // 粒子效果
    this.triggerParticleEffect('neutral-collision', x, y, 0.8);
    
    // 觸覺反饋
    this.triggerHapticFeedback('short');
    
    console.log('💫 播放中性碰撞組合效果');
  }

  /**
   * 更新配置
   */
  updateAudioConfig(config: Partial<AudioConfig>): void {
    this.audioConfig = { ...this.audioConfig, ...config };
    console.log('🔊 音效配置已更新');
  }

  updateVisualConfig(config: Partial<VisualEffectConfig>): void {
    this.visualConfig = { ...this.visualConfig, ...config };
    console.log('✨ 視覺效果配置已更新');
  }

  updateHapticConfig(config: Partial<HapticConfig>): void {
    this.hapticConfig = { ...this.hapticConfig, ...config };
    console.log('📳 觸覺反饋配置已更新');
  }

  /**
   * 銷毀特效管理器
   */
  destroy(): void {
    // 清理粒子系統
    this.particleSystems.forEach(particles => {
      particles.destroy();
    });
    this.particleSystems.clear();
    
    // 清理音效
    this.loadedSounds.forEach(sound => {
      sound.destroy();
    });
    this.loadedSounds.clear();
    
    // 清理螢幕效果
    this.screenEffects.clear();
    
    console.log('🧹 特效管理器已銷毀');
  }
}

export default EffectsManager;
