/**
 * 碰撞檢測系統 - AirplaneCollisionGame 核心組件
 * 
 * 任務: Task 1.1.3 - 實現碰撞檢測系統
 * 目標: 移除射擊系統，實現直接碰撞檢測，包括特效和音效反饋
 * 狀態: 開發階段 (1/5)
 */

import { GEPTWord, GEPTLevel } from '../../../lib/gept/GEPTManager';
import { MemoryMetrics } from '../../../lib/memory-enhancement/MemoryEnhancementEngine';

export interface CollisionEvent {
  type: 'correct' | 'incorrect' | 'neutral';
  cloudWord: string;
  targetWord: string;
  responseTime: number;
  timestamp: number;
  playerPosition: { x: number; y: number };
  cloudPosition: { x: number; y: number };
}

export interface CollisionEffectConfig {
  enableParticles: boolean;
  enableScreenShake: boolean;
  enableSoundEffects: boolean;
  enableVisualFeedback: boolean;
  particleIntensity: 'low' | 'medium' | 'high';
  soundVolume: number;
}

/**
 * 碰撞檢測系統
 * 負責處理飛機與雲朵的碰撞檢測、特效觸發和學習數據記錄
 */
export class CollisionDetectionSystem {
  private scene: Phaser.Scene;
  private geptLevel: GEPTLevel;
  private effectConfig: CollisionEffectConfig;

  // 目標詞彙管理
  private targetEnglishWord: string = '';
  private targetChineseWord: string = '';
  private targetSetTime: number = 0;

  // 統計數據
  private collisionHistory: CollisionEvent[] = [];
  private correctCollisions: number = 0;
  private incorrectCollisions: number = 0;

  // 特效系統
  private particleEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  constructor(
    scene: Phaser.Scene,
    geptLevel: GEPTLevel = 'elementary',
    effectConfig: Partial<CollisionEffectConfig> = {}
  ) {
    this.scene = scene;
    this.geptLevel = geptLevel;
    this.effectConfig = {
      enableParticles: true,
      enableScreenShake: true,
      enableSoundEffects: true,
      enableVisualFeedback: true,
      particleIntensity: 'medium',
      soundVolume: 0.7,
      ...effectConfig
    };

    this.initializeEffectSystems();
    console.log('🎯 碰撞檢測系統初始化完成');
  }

  /**
   * 初始化特效系統
   */
  private initializeEffectSystems(): void {
    if (this.effectConfig.enableParticles) {
      this.createParticleEmitters();
    }

    if (this.effectConfig.enableSoundEffects) {
      this.preloadSounds();
    }
  }

  /**
   * 創建粒子發射器
   */
  private createParticleEmitters(): void {
    // 正確碰撞粒子效果
    const correctParticles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      tint: 0x00ff00,
      quantity: this.getParticleQuantity()
    });
    this.particleEmitters.set('correct', correctParticles);

    // 錯誤碰撞粒子效果
    const incorrectParticles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 30, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 400,
      tint: 0xff0000,
      quantity: this.getParticleQuantity()
    });
    this.particleEmitters.set('incorrect', incorrectParticles);
  }

  /**
   * 預載音效
   */
  private preloadSounds(): void {
    // 檢查音效是否已載入
    if (!this.scene.cache.audio.exists('collision-correct')) {
      this.scene.load.audio('collision-correct', 'assets/sounds/correct.mp3');
    }

    if (!this.scene.cache.audio.exists('collision-incorrect')) {
      this.scene.load.audio('collision-incorrect', 'assets/sounds/incorrect.mp3');
    }
  }

  /**
   * 根據強度設定獲取粒子數量
   */
  private getParticleQuantity(): number {
    switch (this.effectConfig.particleIntensity) {
      case 'low': return 5;
      case 'medium': return 15;
      case 'high': return 30;
      default: return 15;
    }
  }

  /**
   * 設置目標詞彙
   */
  public setTargetWord(englishWord: string, chineseWord: string): void {
    this.targetEnglishWord = englishWord.toLowerCase().trim();
    this.targetChineseWord = chineseWord.trim();
    this.targetSetTime = Date.now();

    console.log(`🎯 設置目標詞彙: ${englishWord} (${chineseWord})`);
  }

  /**
   * 處理碰撞事件
   */
  public handleCollision(
    cloudSprite: Phaser.GameObjects.Image,
    playerSprite: Phaser.GameObjects.Image
  ): CollisionEvent {
    const cloudWord = cloudSprite.getData('word') || '';
    const cloudChinese = cloudSprite.getData('chinese') || '';
    const currentTime = Date.now();

    // 計算響應時間
    const responseTime = this.targetSetTime > 0 ? currentTime - this.targetSetTime : 0;

    // 判斷碰撞類型
    const collisionType = this.determineCollisionType(cloudWord);

    // 創建碰撞事件
    const collisionEvent: CollisionEvent = {
      type: collisionType,
      cloudWord: cloudWord,
      targetWord: this.targetEnglishWord,
      responseTime: responseTime,
      timestamp: currentTime,
      playerPosition: { x: playerSprite.x, y: playerSprite.y },
      cloudPosition: { x: cloudSprite.x, y: cloudSprite.y }
    };

    // 記錄統計
    this.recordCollisionStatistics(collisionEvent);

    // 觸發特效
    this.triggerCollisionEffects(collisionEvent);

    // 銷毀雲朵
    this.destroyCloudSprite(cloudSprite);

    console.log(`💥 碰撞處理: ${cloudWord} - ${collisionType}`);

    return collisionEvent;
  }

  /**
   * 判斷碰撞類型
   */
  private determineCollisionType(cloudWord: string): 'correct' | 'incorrect' | 'neutral' {
    if (!this.targetEnglishWord) {
      return 'neutral';
    }

    const normalizedCloudWord = cloudWord.toLowerCase().trim();
    const normalizedTargetWord = this.targetEnglishWord.toLowerCase().trim();

    return normalizedCloudWord === normalizedTargetWord ? 'correct' : 'incorrect';
  }

  /**
   * 記錄碰撞統計
   */
  private recordCollisionStatistics(event: CollisionEvent): void {
    this.collisionHistory.push(event);

    switch (event.type) {
      case 'correct':
        this.correctCollisions++;
        break;
      case 'incorrect':
        this.incorrectCollisions++;
        break;
    }
  }

  /**
   * 觸發碰撞特效
   */
  private triggerCollisionEffects(event: CollisionEvent): void {
    const { cloudPosition } = event;

    // 觸發粒子效果
    if (this.effectConfig.enableParticles) {
      this.triggerParticleEffect(event.type, cloudPosition.x, cloudPosition.y);
    }

    // 觸發音效
    if (this.effectConfig.enableSoundEffects) {
      this.playCollisionSound(event.type);
    }

    // 觸發螢幕震動
    if (this.effectConfig.enableScreenShake && event.type === 'incorrect') {
      this.triggerScreenShake();
    }

    // 觸發視覺反饋
    if (this.effectConfig.enableVisualFeedback) {
      this.triggerVisualFeedback(event.type, cloudPosition.x, cloudPosition.y);
    }
  }

  /**
   * 觸發粒子效果
   */
  private triggerParticleEffect(type: string, x: number, y: number): void {
    const emitter = this.particleEmitters.get(type);
    if (emitter) {
      emitter.setPosition(x, y);
      emitter.explode(this.getParticleQuantity());
    }
  }

  /**
   * 播放碰撞音效
   */
  private playCollisionSound(type: string): void {
    const soundKey = `collision-${type}`;
    if (this.scene.sound.get(soundKey)) {
      this.scene.sound.play(soundKey, {
        volume: this.effectConfig.soundVolume
      });
    }
  }

  /**
   * 觸發螢幕震動
   */
  private triggerScreenShake(): void {
    this.scene.cameras.main.shake(200, 0.01);
  }

  /**
   * 觸發視覺反饋
   */
  private triggerVisualFeedback(type: string, x: number, y: number): void {
    const color = type === 'correct' ? 0x00ff00 : 0xff0000;
    const feedbackText = this.scene.add.text(x, y, type === 'correct' ? '✓' : '✗', {
      fontSize: '32px',
      color: `#${color.toString(16)}`
    });

    // 動畫效果
    this.scene.tweens.add({
      targets: feedbackText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => feedbackText.destroy()
    });
  }

  /**
   * 銷毀雲朵精靈
   */
  private destroyCloudSprite(cloudSprite: Phaser.GameObjects.Image): void {
    // 銷毀附加的文字物件
    const wordText = cloudSprite.getData('wordText');
    if (wordText) {
      wordText.destroy();
    }

    // 銷毀雲朵精靈
    cloudSprite.destroy();
  }

  /**
   * 獲取記憶指標
   */
  public getMemoryMetrics(): MemoryMetrics {
    const totalCollisions = this.correctCollisions + this.incorrectCollisions;
    const accuracyRate = totalCollisions > 0 ? this.correctCollisions / totalCollisions : 0;

    // 計算響應時間
    const responseTimes = this.collisionHistory.map(event => event.responseTime);

    // 計算認知負荷（基於響應時間變異性）
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const responseTimeVariance = responseTimes.length > 1
      ? responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
      : 0;

    const cognitiveLoadLevel = Math.min(1, responseTimeVariance / 1000000); // 正規化到 0-1

    return {
      responseTime: responseTimes,
      accuracyRate: accuracyRate,
      spacedRepetitionSchedule: new Map(), // 將由記憶增強引擎管理
      cognitiveLoadLevel: cognitiveLoadLevel
    };
  }

  /**
   * 重置統計數據
   */
  public resetStatistics(): void {
    this.collisionHistory = [];
    this.correctCollisions = 0;
    this.incorrectCollisions = 0;
    this.targetSetTime = 0;

    console.log('📊 碰撞統計數據已重置');
  }

  /**
   * 銷毀碰撞檢測系統
   */
  public destroy(): void {
    // 銷毀粒子發射器
    this.particleEmitters.forEach(emitter => emitter.destroy());
    this.particleEmitters.clear();

    // 重置統計數據
    this.resetStatistics();

    console.log('🧹 碰撞檢測系統已銷毀');
  }
}

export interface CollisionFeedback {
  visual: {
    color: string;
    message: string;
    duration: number;
    animation: 'bounce' | 'fade' | 'pulse' | 'shake';
  };
  audio: {
    soundKey: string;
    volume: number;
    pitch?: number;
  };
  haptic?: {
    pattern: 'success' | 'error' | 'neutral';
    intensity: number;
  };
}

// 默認導出以保持兼容性
export default CollisionDetectionSystem;
