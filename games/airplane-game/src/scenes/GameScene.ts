/**
 * 主遊戲場景 - Vite + Phaser 3 版本
 * 基於記憶科學的飛機碰撞英語學習遊戲
 * 整合完整的遊戲邏輯和管理器系統
 */

import Phaser from 'phaser';
import { GameConfig, GameState, GEPTWord, ParentMessage } from '../types/game';
import { GEPTManager, GEPTLevel } from '../managers/GEPTManager';
import { CollisionDetectionSystem, CollisionEvent } from '../managers/CollisionDetectionSystem';
import { MemoryEnhancementEngine, LearningEvent } from '../managers/MemoryEnhancementEngine';

export default class GameScene extends Phaser.Scene {
  // 遊戲配置和狀態
  private gameConfig!: GameConfig;
  private gameState: GameState = {
    isPlaying: false,
    isPaused: false,
    currentScore: 0,
    currentHealth: 100,
    wordsLearned: 0,
    accuracy: 0
  };

  // 遊戲物件
  private player!: Phaser.Physics.Arcade.Image;
  private clouds!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private backgroundLayers: Phaser.GameObjects.TileSprite[] = [];

  // UI 元素
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private targetWordText!: Phaser.GameObjects.Text;
  private accuracyText!: Phaser.GameObjects.Text;
  private wordsLearnedText!: Phaser.GameObjects.Text;

  // 管理器系統
  private geptManager!: GEPTManager;
  private collisionSystem!: CollisionDetectionSystem;
  private memoryEngine!: MemoryEnhancementEngine;

  // 遊戲邏輯
  private cloudSpawnTimer!: Phaser.Time.TimerEvent;
  private currentTargetWord?: GEPTWord;
  private targetWordSetTime: number = 0;

  // 遊戲統計
  private totalCollisions: number = 0;
  private correctCollisions: number = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    console.log('🎮 初始化遊戲場景');

    // 從註冊表獲取遊戲配置
    this.gameConfig = this.registry.get('gameConfig') || {
      geptLevel: 'elementary',
      enableSound: true,
      enableHapticFeedback: true,
      difficulty: 'medium',
      gameMode: 'practice'
    };

    console.log('📋 遊戲配置:', this.gameConfig);

    // 初始化管理器系統
    this.initializeManagers();
  }

  /**
   * 初始化管理器系統
   */
  private initializeManagers(): void {
    // 初始化 GEPT 管理器
    this.geptManager = new GEPTManager();
    this.geptManager.setLevel(this.gameConfig.geptLevel);

    // 初始化記憶增強引擎
    this.memoryEngine = new MemoryEnhancementEngine();

    // 初始化碰撞檢測系統
    this.collisionSystem = new CollisionDetectionSystem(
      this,
      this.gameConfig.geptLevel,
      {
        enableParticles: true,
        enableScreenShake: true,
        enableSoundEffects: this.gameConfig.enableSound,
        enableVisualFeedback: true,
        particleIntensity: 'medium',
        soundVolume: 0.7
      }
    );

    console.log('🔧 管理器初始化完成');
  }

  preload() {
    console.log('🎨 載入遊戲資源');

    // 載入月亮主題背景圖片
    this.loadMoonBackground();

    // 修復紋理生成問題 - 使用正確的方法
    // 玩家飛機 - 藍色三角形
    const planeGraphics = this.add.graphics();
    planeGraphics.fillStyle(0x0066ff);
    planeGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    planeGraphics.generateTexture('player-plane', 32, 32);
    planeGraphics.destroy();

    // 詞彙雲朵 - 白色橢圓
    const cloudGraphics = this.add.graphics();
    cloudGraphics.fillStyle(0xffffff);
    cloudGraphics.fillEllipse(32, 16, 60, 28);
    cloudGraphics.lineStyle(2, 0x888888);
    cloudGraphics.strokeEllipse(32, 16, 60, 28);
    cloudGraphics.generateTexture('cloud-word', 64, 32);
    cloudGraphics.destroy();

    // 背景星星 - 小白點
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffffff);
    starGraphics.fillCircle(2, 2, 2);
    starGraphics.generateTexture('star', 4, 4);
    starGraphics.destroy();

    console.log('✅ 遊戲資源載入完成 - 包含月亮背景');
  }

  /**
   * 載入月亮主題背景圖片
   */
  private loadMoonBackground(): void {
    console.log('🌙 載入月亮主題背景');

    // 嘗試載入背景圖片，如果不存在則使用備用方案
    try {
      // 背景層 1 - 最遠的背景（天空/星空）
      this.load.image('moon-bg-1', '/assets/backgrounds/moon/layer-1.png');

      // 背景層 2 - 中景（山脈/地形）
      this.load.image('moon-bg-2', '/assets/backgrounds/moon/layer-2.png');

      // 背景層 3 - 近景（樹木/建築）
      this.load.image('moon-bg-3', '/assets/backgrounds/moon/layer-3.png');

      // 月亮
      this.load.image('moon', '/assets/backgrounds/moon/moon.png');

      console.log('🌙 月亮背景圖片載入排程完成');
    } catch (error) {
      console.warn('⚠️ 月亮背景載入失敗，將使用備用背景:', error);
    }
  }

  create() {
    console.log('🏗️ 創建遊戲場景');

    // 創建視差背景
    this.createParallaxBackground();

    // 創建玩家飛機
    this.createPlayer();

    // 創建雲朵群組
    this.createClouds();

    // 創建完整的 UI
    this.createGameHUD();

    // 設置輸入控制
    this.setupInput();

    // 設置物理碰撞
    this.setupPhysics();

    // 設置目標詞彙
    this.setRandomTargetWord();

    // 開始雲朵生成
    this.startCloudSpawning();

    console.log('✅ 遊戲場景創建完成');

    // 自動開始遊戲
    this.startGame();
  }

  /**
   * 創建月亮主題視差背景
   */
  private createParallaxBackground(): void {
    console.log('� 創建月亮主題視差背景');

    // 創建基礎背景色（深夜藍色）
    const bgRect = this.add.rectangle(400, 300, 800, 600, 0x0a0a2e);
    bgRect.setDepth(-20);

    // 嘗試使用月亮主題背景，如果載入失敗則使用備用方案
    this.createMoonBackgroundLayers();

    // 創建星空背景
    this.createStarField();

    console.log('🌙 月亮主題視差背景創建完成');
  }

  /**
   * 創建月亮主題背景層
   */
  private createMoonBackgroundLayers(): void {
    const backgroundLayers: Phaser.GameObjects.TileSprite[] = [];

    // 檢查月亮背景圖片是否載入成功
    const hasMoonBg1 = this.textures.exists('moon-bg-1');
    const hasMoonBg2 = this.textures.exists('moon-bg-2');
    const hasMoonBg3 = this.textures.exists('moon-bg-3');
    const hasMoon = this.textures.exists('moon');

    if (hasMoonBg1 || hasMoonBg2 || hasMoonBg3) {
      console.log('🌙 使用月亮主題背景圖片');

      // 背景層 1 - 最遠的背景（天空）
      if (hasMoonBg1) {
        const layer1 = this.add.tileSprite(0, 0, 800, 600, 'moon-bg-1');
        layer1.setOrigin(0, 0);
        layer1.setDepth(-15);
        backgroundLayers.push(layer1);
      }

      // 月亮
      if (hasMoon) {
        const moon = this.add.image(650, 150, 'moon');
        moon.setDepth(-14);
        moon.setScale(0.8);
        moon.setAlpha(0.9);
      }

      // 背景層 2 - 中景（山脈）
      if (hasMoonBg2) {
        const layer2 = this.add.tileSprite(0, 0, 800, 600, 'moon-bg-2');
        layer2.setOrigin(0, 0);
        layer2.setDepth(-13);
        backgroundLayers.push(layer2);
      }

      // 背景層 3 - 近景（樹木）
      if (hasMoonBg3) {
        const layer3 = this.add.tileSprite(0, 0, 800, 600, 'moon-bg-3');
        layer3.setOrigin(0, 0);
        layer3.setDepth(-12);
        backgroundLayers.push(layer3);
      }

    } else {
      console.log('🌌 使用備用漸層背景');

      // 備用方案：創建漸層背景
      const layer1 = this.add.graphics();
      layer1.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a1a4e, 0x1a1a4e);
      layer1.fillRect(0, 0, 800, 600);
      layer1.generateTexture('fallback-bg-1', 800, 600);
      layer1.destroy();

      const layer2 = this.add.graphics();
      layer2.fillGradientStyle(0x1a1a4e, 0x1a1a4e, 0x2a2a6e, 0x2a2a6e);
      layer2.fillRect(0, 0, 800, 600);
      layer2.generateTexture('fallback-bg-2', 800, 600);
      layer2.destroy();

      const fallbackLayer1 = this.add.tileSprite(0, 0, 800, 600, 'fallback-bg-1');
      fallbackLayer1.setOrigin(0, 0);
      fallbackLayer1.setDepth(-15);
      fallbackLayer1.setAlpha(0.7);
      backgroundLayers.push(fallbackLayer1);

      const fallbackLayer2 = this.add.tileSprite(0, 0, 800, 600, 'fallback-bg-2');
      fallbackLayer2.setOrigin(0, 0);
      fallbackLayer2.setDepth(-13);
      fallbackLayer2.setAlpha(0.5);
      backgroundLayers.push(fallbackLayer2);
    }

    this.backgroundLayers = backgroundLayers;
  }

  /**
   * 創建星空背景
   */
  private createStarField(): void {
    console.log('⭐ 創建星空背景');

    // 創建不同大小的星星
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 400); // 星星主要在上半部分
      const star = this.add.image(x, y, 'star');

      const scale = Phaser.Math.FloatBetween(0.3, 1.2);
      const alpha = Phaser.Math.FloatBetween(0.4, 1);

      star.setScale(scale);
      star.setAlpha(alpha);
      star.setDepth(-11);

      // 添加閃爍效果
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * 創建玩家飛機
   */
  private createPlayer(): void {
    console.log('✈️ 創建玩家飛機 (修復版本)');

    this.player = this.physics.add.image(100, 300, 'player-plane');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5);
    this.player.setDepth(10); // 確保在前景
    this.player.setAlpha(1); // 確保不透明
    this.player.setVisible(true); // 確保可見

    console.log('✈️ 玩家飛機創建完成:', {
      x: this.player.x,
      y: this.player.y,
      visible: this.player.visible,
      alpha: this.player.alpha,
      depth: this.player.depth,
      texture: this.player.texture.key
    });
  }

  private createClouds() {
    this.clouds = this.physics.add.group();
    console.log('☁️ 創建雲朵群組');
  }

  /**
   * 創建完整的遊戲 HUD
   */
  private createGameHUD(): void {
    console.log('📊 創建遊戲 HUD (已擴展目標詞彙顯示)');

    // 分數顯示
    this.scoreText = this.add.text(16, 16, '分數: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 生命值顯示
    this.healthText = this.add.text(16, 50, '生命值: 100', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 準確率顯示
    this.accuracyText = this.add.text(16, 84, '準確率: 0%', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 學習詞彙數顯示
    this.wordsLearnedText = this.add.text(16, 118, '學習詞彙: 0', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 目標詞彙顯示 - 更大更明顯
    this.targetWordText = this.add.text(400, 16, '目標: 載入中...', {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 12, y: 8 },
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(100);

    // GEPT 等級顯示
    const geptLevelText = this.add.text(400, 50, `GEPT: ${this.gameConfig.geptLevel}`, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0).setDepth(100);
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // WASD 控制
    const wasd = this.input.keyboard!.addKeys('W,S,A,D');
    (this as any).wasd = wasd;
    
    console.log('🎮 設置輸入控制');
  }

  /**
   * 設置物理碰撞系統
   */
  private setupPhysics(): void {
    console.log('⚡ 設置物理碰撞 (已移除子彈碰撞，修改玩家碰撞)');

    // 玩家與雲朵碰撞 - 使用完整的碰撞檢測系統
    this.physics.add.overlap(
      this.player,
      this.clouds,
      this.handleAdvancedCollision,
      undefined,
      this
    );
  }

  /**
   * 設置隨機目標詞彙
   */
  private setRandomTargetWord(): void {
    // 從 GEPT 管理器獲取詞彙
    const randomWord = this.geptManager.getRandomWord();
    this.currentTargetWord = randomWord || undefined;
    this.gameState.currentTargetWord = this.currentTargetWord;
    this.targetWordSetTime = Date.now();

    if (this.targetWordText && this.currentTargetWord) {
      this.targetWordText.setText(`目標: ${this.currentTargetWord.chinese} (${this.currentTargetWord.english})`);

      // 更新碰撞檢測系統的目標詞彙
      this.collisionSystem.setTargetWord(
        this.currentTargetWord.english,
        this.currentTargetWord.chinese
      );

      console.log('🎯 設置目標詞彙:', this.currentTargetWord.english);
    }
  }

  private startCloudSpawning() {
    this.cloudSpawnTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnCloud,
      callbackScope: this,
      loop: true
    });
    console.log('☁️ 開始雲朵生成');
  }

  /**
   * 生成詞彙雲朵 (修復版本)
   */
  private spawnCloud(): void {
    if (!this.gameState.isPlaying) return;

    // 從 GEPT 管理器獲取隨機詞彙
    const word = this.geptManager.getRandomWord();
    if (!word) return;

    const x = 850;
    const y = Phaser.Math.Between(100, 500);

    const cloud = this.physics.add.image(x, y, 'cloud-word');
    cloud.setVelocityX(-100);
    cloud.setData('word', word);
    cloud.setData('isTarget', word.english === this.currentTargetWord?.english);
    cloud.setDepth(5); // 確保在前景
    cloud.setAlpha(1); // 確保不透明
    cloud.setVisible(true); // 確保可見

    // 添加詞彙文字
    const isTarget = word.english === this.currentTargetWord?.english;
    const wordText = this.add.text(x, y, word.english, {
      fontSize: '16px',
      color: isTarget ? '#ff0000' : '#000000',
      fontStyle: isTarget ? 'bold' : 'normal',
      backgroundColor: isTarget ? '#ffff00' : '#ffffff',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    wordText.setDepth(6); // 文字在雲朵之上
    wordText.setAlpha(1);
    wordText.setVisible(true);

    // 將文字綁定到雲朵
    cloud.setData('wordText', wordText);

    this.clouds.add(cloud);

    console.log('☁️ 生成雲朵 (修復版本):', word.english, isTarget ? '(目標)' : '', {
      cloudVisible: cloud.visible,
      textVisible: wordText.visible,
      cloudDepth: cloud.depth,
      textDepth: wordText.depth
    });
  }

  /**
   * 處理高級碰撞檢測
   */
  private handleAdvancedCollision(player: any, cloud: any): void {
    const word: GEPTWord = cloud.getData('word');
    const isTarget: boolean = cloud.getData('isTarget');
    const wordText = cloud.getData('wordText');

    // 使用碰撞檢測系統處理碰撞
    const collisionEvent = this.collisionSystem.handleCollision(player, cloud, word);

    // 記錄學習事件到記憶增強引擎
    const learningEvent: LearningEvent = {
      wordId: word.id,
      word: word.english,
      timestamp: Date.now(),
      responseTime: Date.now() - this.targetWordSetTime,
      isCorrect: collisionEvent.type === 'correct',
      attemptNumber: this.totalCollisions + 1,
      contextData: {
        targetWord: this.currentTargetWord?.english,
        geptLevel: this.gameConfig.geptLevel,
        gameMode: this.gameConfig.gameMode
      }
    };

    this.memoryEngine.recordLearningEvent(learningEvent);

    // 更新統計
    this.totalCollisions++;
    if (collisionEvent.type === 'correct') {
      this.correctCollisions++;
      this.gameState.currentScore += 10;
      this.gameState.wordsLearned++;

      // 設置新的目標詞彙
      this.setRandomTargetWord();

      console.log('✅ 正確碰撞:', word.english);
    } else {
      this.gameState.currentHealth -= 20;
      console.log('❌ 錯誤碰撞:', word.english);

      if (this.gameState.currentHealth <= 0) {
        this.endGame();
        return;
      }
    }

    // 移除雲朵和文字
    if (wordText) wordText.destroy();
    cloud.destroy();

    // 更新 UI 和統計
    this.updateGameStats();
    this.updateUI();

    // 向父頁面發送更新
    this.sendMessageToParent({
      type: 'GAME_SCORE_UPDATE',
      score: this.gameState.currentScore,
      health: this.gameState.currentHealth
    });
  }

  /**
   * 更新遊戲統計
   */
  private updateGameStats(): void {
    // 計算準確率
    this.gameState.accuracy = this.totalCollisions > 0
      ? Math.round((this.correctCollisions / this.totalCollisions) * 100)
      : 0;
  }

  /**
   * 更新 UI 顯示
   */
  private updateUI(): void {
    this.scoreText.setText(`分數: ${this.gameState.currentScore}`);
    this.healthText.setText(`生命值: ${this.gameState.currentHealth}`);
    this.accuracyText.setText(`準確率: ${this.gameState.accuracy}%`);
    this.wordsLearnedText.setText(`學習詞彙: ${this.gameState.wordsLearned}`);

    console.log('📊 更新 HUD:', {
      分數: this.gameState.currentScore,
      生命值: this.gameState.currentHealth,
      準確率: this.gameState.accuracy,
      學習詞彙: this.gameState.wordsLearned
    });
  }

  private startGame() {
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
    console.log('🚀 遊戲開始');
    
    this.sendMessageToParent({
      type: 'GAME_STATE_CHANGE',
      state: 'playing'
    });
  }

  private endGame() {
    this.gameState.isPlaying = false;
    console.log('🏁 遊戲結束');
    
    // 停止雲朵生成
    if (this.cloudSpawnTimer) {
      this.cloudSpawnTimer.destroy();
    }
    
    // 清除所有雲朵
    this.clouds.clear(true, true);
    
    this.sendMessageToParent({
      type: 'GAME_COMPLETE',
      score: this.gameState.currentScore,
      health: this.gameState.currentHealth
    });
  }

  private sendMessageToParent(message: ParentMessage) {
    if (window.parent !== window) {
      window.parent.postMessage(message, '*');
    }
  }

  update(_time: number, _delta: number): void {
    if (!this.gameState.isPlaying || this.gameState.isPaused) return;

    // 更新視差背景
    this.updateParallaxBackground();

    // 玩家移動控制
    this.handlePlayerMovement();

    // 清理超出邊界的物件
    this.cleanupObjects();
  }

  /**
   * 更新月亮主題視差背景
   */
  private updateParallaxBackground(): void {
    // 移動背景層創造視差效果
    this.backgroundLayers.forEach((layer, index) => {
      // 不同層有不同的移動速度，創造深度感
      const speed = (index + 1) * 0.3; // 減慢速度讓效果更自然
      layer.tilePositionX += speed;
    });

    // 每隔一段時間輸出日誌（減少頻率）
    if (Math.floor(Date.now() / 1000) % 10 === 0) {
      console.log('� 更新月亮主題視差背景');
    }
  }

  /**
   * 處理玩家移動
   */
  private handlePlayerMovement(): void {
    const speed = 250;
    const wasd = (this as any).wasd;

    if (this.cursors.left.isDown || wasd?.A.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || wasd?.D.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown || wasd?.W.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || wasd?.S.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  /**
   * 清理超出邊界的物件
   */
  private cleanupObjects(): void {
    this.clouds.children.entries.forEach((cloud: any) => {
      if (cloud.x < -100) {
        const wordText = cloud.getData('wordText');
        if (wordText) wordText.destroy();
        cloud.destroy();
      } else {
        // 更新文字位置
        const wordText = cloud.getData('wordText');
        if (wordText) {
          wordText.setPosition(cloud.x, cloud.y);
        }
      }
    });
  }
}
