/**
 * 碰撞檢測系統 - Vite + Phaser 3 版本
 * 負責處理飛機與雲朵的碰撞檢測、特效觸發和學習數據記錄
 */

import Phaser from 'phaser';
import { GEPTWord, GEPTLevel } from './GEPTManager';

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
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private screenShakeIntensity: number = 0;

  constructor(
    scene: Phaser.Scene,
    geptLevel: GEPTLevel,
    effectConfig: CollisionEffectConfig
  ) {
    this.scene = scene;
    this.geptLevel = geptLevel;
    this.effectConfig = effectConfig;
    
    this.initializeEffectSystems();
    console.log('🎯 碰撞檢測系統初始化完成');
  }

  /**
   * 初始化特效系統
   */
  private initializeEffectSystems(): void {
    if (this.effectConfig.enableParticles) {
      this.initializeParticleSystem();
    }
  }

  /**
   * 初始化粒子系統
   */
  private initializeParticleSystem(): void {
    // 創建粒子紋理
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();

    console.log('✨ 粒子系統初始化完成');
  }

  /**
   * 設置目標詞彙
   */
  setTargetWord(englishWord: string, chineseWord: string): void {
    this.targetEnglishWord = englishWord;
    this.targetChineseWord = chineseWord;
    this.targetSetTime = Date.now();
    
    console.log(`🎯 設置目標詞彙: ${englishWord} (${chineseWord})`);
  }

  /**
   * 處理碰撞事件
   */
  handleCollision(
    player: Phaser.GameObjects.GameObject,
    cloud: Phaser.GameObjects.GameObject,
    cloudWord: GEPTWord
  ): CollisionEvent {
    const currentTime = Date.now();
    const responseTime = currentTime - this.targetSetTime;
    
    // 判斷碰撞類型
    const isCorrect = cloudWord.english === this.targetEnglishWord;
    const collisionType: 'correct' | 'incorrect' = isCorrect ? 'correct' : 'incorrect';
    
    // 創建碰撞事件
    const collisionEvent: CollisionEvent = {
      type: collisionType,
      cloudWord: cloudWord.english,
      targetWord: this.targetEnglishWord,
      responseTime,
      timestamp: currentTime,
      playerPosition: { x: (player as any).x, y: (player as any).y },
      cloudPosition: { x: (cloud as any).x, y: (cloud as any).y }
    };

    // 記錄統計
    if (isCorrect) {
      this.correctCollisions++;
    } else {
      this.incorrectCollisions++;
    }
    
    this.collisionHistory.push(collisionEvent);

    // 觸發特效
    this.triggerCollisionEffects(collisionEvent, cloud as any);

    console.log(`💥 碰撞處理: ${cloudWord.english} - ${collisionType}`);
    
    return collisionEvent;
  }

  /**
   * 觸發碰撞特效 - 優化版本，減少閃爍
   */
  private triggerCollisionEffects(
    event: CollisionEvent,
    cloud: Phaser.GameObjects.GameObject
  ): void {
    const { x, y } = event.cloudPosition;

    // 視覺反饋 - 所有碰撞都顯示
    if (this.effectConfig.enableVisualFeedback && event.type !== 'neutral') {
      this.createVisualFeedback(event.type, x, y);
    }

    // 根據碰撞類型選擇性觸發特效，減少閃爍
    if (event.type === 'correct') {
      // 正確碰撞：只顯示粒子特效和音效，不震動
      if (this.effectConfig.enableParticles) {
        this.createParticleEffect(event.type, x, y);
      }
      if (this.effectConfig.enableSoundEffects) {
        this.playSoundEffect(event.type);
      }
      console.log('✅ 正確碰撞：溫和特效');
    } else if (event.type === 'incorrect') {
      // 錯誤碰撞：輕微震動 + 粒子特效 + 音效
      if (this.effectConfig.enableParticles) {
        this.createParticleEffect(event.type, x, y);
      }
      if (this.effectConfig.enableScreenShake) {
        this.triggerScreenShake(event.type);
      }
      if (this.effectConfig.enableSoundEffects) {
        this.playSoundEffect(event.type);
      }
      console.log('❌ 錯誤碰撞：輕微震動特效');
    }
  }

  /**
   * 創建視覺反饋
   */
  private createVisualFeedback(type: 'correct' | 'incorrect', x: number, y: number): void {
    const color = type === 'correct' ? '#00ff00' : '#ff0000';
    const text = type === 'correct' ? '✓' : '✗';
    
    const feedback = this.scene.add.text(x, y, text, {
      fontSize: '32px',
      color: color,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 動畫效果
    this.scene.tweens.add({
      targets: feedback,
      y: y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => feedback.destroy()
    });
  }

  /**
   * 創建粒子特效
   */
  private createParticleEffect(type: 'correct' | 'incorrect', x: number, y: number): void {
    const color = type === 'correct' ? 0x00ff00 : 0xff0000;
    const particleCount = this.getParticleCount();

    // 創建臨時粒子發射器
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      tint: color,
      lifespan: 500,
      quantity: particleCount
    });

    // 自動清理
    this.scene.time.delayedCall(1000, () => {
      emitter.destroy();
    });
  }

  /**
   * 獲取粒子數量
   */
  private getParticleCount(): number {
    switch (this.effectConfig.particleIntensity) {
      case 'low': return 5;
      case 'medium': return 10;
      case 'high': return 20;
      default: return 10;
    }
  }

  /**
   * 觸發螢幕震動 - 優化版本，減少閃爍
   */
  private triggerScreenShake(type: 'correct' | 'incorrect'): void {
    // 大幅降低震動強度和持續時間以減少閃爍
    const intensity = type === 'correct' ? 1 : 3;  // 從 5/10 降低到 1/3
    const duration = type === 'correct' ? 100 : 200;  // 從 200/400 降低到 100/200

    // 簡單的相機震動效果
    if (this.scene.cameras.main) {
      this.scene.cameras.main.shake(duration, intensity);
      console.log(`📳 觸發${type === 'correct' ? '輕微' : '溫和'}震動 (強度: ${intensity}, 時長: ${duration}ms)`);
    }
  }

  /**
   * 播放音效
   */
  private playSoundEffect(type: 'correct' | 'incorrect'): void {
    // 這裡可以添加音效播放邏輯
    // 目前只記錄日誌
    const soundType = type === 'correct' ? '正確音效' : '錯誤音效';
    console.log(`🔊 播放${soundType} (音量: ${this.effectConfig.soundVolume})`);
  }

  /**
   * 獲取統計數據
   */
  getStatistics(): {
    correctCollisions: number;
    incorrectCollisions: number;
    totalCollisions: number;
    accuracy: number;
    averageResponseTime: number;
  } {
    const totalCollisions = this.correctCollisions + this.incorrectCollisions;
    const accuracy = totalCollisions > 0 ? (this.correctCollisions / totalCollisions) * 100 : 0;
    
    const totalResponseTime = this.collisionHistory.reduce((sum, event) => sum + event.responseTime, 0);
    const averageResponseTime = this.collisionHistory.length > 0 ? totalResponseTime / this.collisionHistory.length : 0;

    return {
      correctCollisions: this.correctCollisions,
      incorrectCollisions: this.incorrectCollisions,
      totalCollisions,
      accuracy: Math.round(accuracy * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime)
    };
  }

  /**
   * 獲取碰撞歷史
   */
  getCollisionHistory(): CollisionEvent[] {
    return [...this.collisionHistory];
  }

  /**
   * 重置統計數據
   */
  resetStatistics(): void {
    this.correctCollisions = 0;
    this.incorrectCollisions = 0;
    this.collisionHistory = [];
    console.log('📊 碰撞統計數據已重置');
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<CollisionEffectConfig>): void {
    this.effectConfig = { ...this.effectConfig, ...newConfig };
    console.log('⚙️ 碰撞檢測配置已更新');
  }

  /**
   * 銷毀系統
   */
  destroy(): void {
    if (this.particles) {
      this.particles.destroy();
    }
    this.collisionHistory = [];
    console.log('🗑️ 碰撞檢測系統已銷毀');
  }
}
