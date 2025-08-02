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
import { BilingualManager } from '../managers/BilingualManager';
import { ChineseUIManager } from '../managers/ChineseUIManager';
import { HealthBar } from '../ui/HealthBar';

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
  private player!: Phaser.Physics.Arcade.Sprite;
  private shooterContainer?: Phaser.GameObjects.Container;
  private clouds!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private backgroundLayers: Phaser.GameObjects.TileSprite[] = [];

  // UI 元素
  private scoreText!: Phaser.GameObjects.Text;
  private healthBar!: HealthBar;  // 🔧 替換文字為血條
  private targetWordText!: Phaser.GameObjects.Text;
  private accuracyText!: Phaser.GameObjects.Text;
  private wordsLearnedText!: Phaser.GameObjects.Text;

  // 管理器系統
  private geptManager!: GEPTManager;
  private collisionSystem!: CollisionDetectionSystem;
  private memoryEngine!: MemoryEnhancementEngine;
  private bilingualManager!: BilingualManager;
  private chineseUIManager!: ChineseUIManager;

  // 雲朵圖片載入狀態
  private useBackupCloudTexture: boolean = false;

  // 遊戲邏輯
  private cloudSpawnTimer!: Phaser.Time.TimerEvent;
  private currentTargetWord?: GEPTWord;
  private targetWordSetTime: number = 0;

  // 遊戲統計
  private totalCollisions: number = 0;
  private correctCollisions: number = 0;
  private wrongCollisions: number = 0; // 🎯 追蹤錯誤次數

  // 開始畫面狀態 (Wordwall 風格)
  private showStartScreen: boolean = true;
  private gameStarted: boolean = false;
  private startScreen?: Phaser.GameObjects.Container;
  private playButton?: Phaser.GameObjects.Image;

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

    // 初始化雙語管理器
    this.bilingualManager = new BilingualManager(this, this.geptManager);

    // 初始化中文 UI 管理器
    this.chineseUIManager = new ChineseUIManager(this, this.geptManager, this.bilingualManager);

    console.log('🔧 管理器初始化完成（包含雙語系統）');
  }

  preload() {
    console.log('🎨 載入遊戲資源');

    // 載入月亮主題背景圖片
    this.loadMoonBackground();

    // 載入新的玩家太空船精靈表 - 一艘太空船的7幀飛行動畫
    // 根據實際檢測：總寬度2450px，7幀橫向排列，高度150px
    this.load.spritesheet('player_spaceship', 'assets/sprite_player_spaceship_up_down.png', {
      frameWidth: Math.floor(2450 / 7),  // 2450px ÷ 7幀 = 350px
      frameHeight: 150                   // 實際高度150px
    });

    // 添加載入完成事件來檢查紋理
    this.load.on('complete', () => {
      console.log('🔍 檢查精靈表載入狀況');
      const texture = this.textures.get('player_spaceship');
      if (texture) {
        console.log('✅ 精靈表載入成功:', {
          key: 'player_spaceship',
          width: texture.source[0].width,
          height: texture.source[0].height,
          frames: texture.frameTotal
        });
      } else {
        console.log('❌ 精靈表載入失敗: player_spaceship');
      }
    });

    // 保留原始精靈表作為備用方案
    this.load.spritesheet('random_shooter', 'assets/random_shooter-sheet.png', {
      frameWidth: 64,   // 備用方案
      frameHeight: 64   // 備用方案
    });

    // 備用：用戶自定義完整太空船圖片
    this.load.image('complete_spaceship', 'assets/complete_spaceship.png');

    // 備用方案：創建太空船形狀的動態精靈（暫時停用）
    // this.createSpaceshipSprite();

    // 修復紋理生成問題 - 使用正確的方法
    // 玩家飛機 - 藍色三角形
    const planeGraphics = this.add.graphics();
    planeGraphics.fillStyle(0x0066ff);
    planeGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    planeGraphics.generateTexture('player-plane', 32, 32);
    planeGraphics.destroy();

    // 載入真實雲朵圖片 (使用用戶提供的白色雲朵)
    this.load.image('cloud-word', 'assets/images/cloud_shape3_3.png');

    // 添加載入成功和錯誤處理
    this.load.on('filecomplete-image-cloud-word', () => {
      console.log('✅ 雲朵圖片載入成功');
    });

    this.load.on('loaderror', (fileObj: any) => {
      if (fileObj.key === 'cloud-word') {
        console.log('⚠️ 雲朵圖片載入失敗，使用淺藍色備用紋理（防止白色閃爍）');
        // 強制使用備用紋理
        this.useBackupCloudTexture = true;
      }
    });

    // 🔧 修復白色閃爍：備用雲朵使用淺藍色而不是白色
    const cloudGraphics = this.add.graphics();
    cloudGraphics.fillStyle(0xe6f3ff); // 淺藍色而不是純白色，防止白色閃爍
    cloudGraphics.fillEllipse(32, 16, 60, 28);
    cloudGraphics.lineStyle(2, 0x4a90e2); // 藍色邊框
    cloudGraphics.strokeEllipse(32, 16, 60, 28);
    cloudGraphics.generateTexture('cloud-word-fallback', 64, 32);
    cloudGraphics.destroy();

    console.log('☁️ 備用雲朵紋理已創建（淺藍色，防止白色閃爍）');

    // 背景星星 - 小白點
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xffffff);
    starGraphics.fillCircle(2, 2, 2);
    starGraphics.generateTexture('star', 4, 4);
    starGraphics.destroy();

    console.log('✅ 遊戲資源載入完成 - 包含月亮背景');
  }

  /**
   * 創建太空船動畫 - 使用新的玩家太空船精靈表
   */
  private createSpaceshipAnimation(): void {
    console.log('🚀 創建新太空船動畫配置');

    // 優先檢查新的玩家太空船精靈表
    if (this.textures.exists('player_spaceship')) {
      console.log('✨ 使用新的玩家太空船精靈表');

      // 檢查紋理詳細信息
      const texture = this.textures.get('player_spaceship');
      console.log('🔍 精靈表詳細信息:', {
        key: 'player_spaceship',
        width: texture.source[0].width,
        height: texture.source[0].height,
        frameTotal: texture.frameTotal,
        frames: Object.keys(texture.frames)
      });

      // 創建太空船飛行動畫 - 使用7幀飛行動畫（0-6）
      this.anims.create({
        key: 'spaceship_fly',
        frames: this.anims.generateFrameNumbers('player_spaceship', {
          start: 0,
          end: 6     // 使用7幀：0, 1, 2, 3, 4, 5, 6
        }),
        frameRate: 10,       // 每秒10幀，流暢的飛行動畫
        repeat: -1,          // 無限循環
        yoyo: false          // 不反向播放，正常循環
      });

      console.log('✅ 太空船飛行動畫創建完成: spaceship_fly (7幀動畫，292x512)');

    } else if (this.textures.exists('random_shooter')) {
      console.log('🔄 備用方案：使用原始精靈表');

      // 備用方案：使用原始精靈表
      this.anims.create({
        key: 'spaceship_fly',
        frames: this.anims.generateFrameNumbers('random_shooter', {
          start: 0,  // 第一幀
          end: 3     // 使用前4幀作為動畫
        }),
        frameRate: 6,        // 每秒6幀
        repeat: -1,          // 無限循環
        yoyo: false          // 不反向播放
      });

      console.log('✅ 備用太空船動畫創建完成: spaceship_fly (原始精靈表)');
    } else {
      console.warn('⚠️ 沒有可用的太空船精靈表，跳過動畫創建');
    }
  }

  /**
   * 創建太空船形狀的動態精靈（備用方案）
   */
  private createSpaceshipSprite(): void {
    // 創建多幀太空船精靈
    const frames = [];
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();

      // 太空船主體顏色變化
      const hue = 200 + (i * 10); // 藍色系變化
      const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.9);

      // 繪製太空船形狀
      graphics.fillStyle(color.color);

      // 主體（橢圓形）
      graphics.fillEllipse(32, 32, 24, 40);

      // 機翼
      graphics.fillTriangle(8, 20, 20, 32, 8, 44);
      graphics.fillTriangle(56, 20, 44, 32, 56, 44);

      // 駕駛艙
      graphics.fillStyle(0x00ffff);
      graphics.fillEllipse(32, 28, 8, 12);

      // 引擎噴射效果（根據幀變化）
      const flameIntensity = 0.5 + (i * 0.2);
      graphics.fillStyle(Phaser.Display.Color.GetColor(255, 100 + i * 30, 0));
      graphics.fillEllipse(32, 50 + i, 6, 8 * flameIntensity);

      graphics.generateTexture(`spaceship_${i}`, 64, 64);
      graphics.destroy();
      frames.push({ key: `spaceship_${i}` });
    }

    // 創建太空船動畫配置
    this.anims.create({
      key: 'spaceship_backup_anim',
      frames: frames,
      frameRate: 8,
      repeat: -1
    });
  }

  /**
   * 創建動態精靈圖片
   */
  private createDynamicSprite(): void {
    // 創建多幀圓形精靈
    const frames = [];
    for (let i = 0; i < 8; i++) {
      const graphics = this.add.graphics();
      const hue = (i * 45) % 360; // 每幀不同顏色
      const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.8, 0.9);
      graphics.fillStyle(color.color);
      graphics.fillCircle(32, 32, 28);
      graphics.lineStyle(3, 0xffffff);
      graphics.strokeCircle(32, 32, 28);
      graphics.generateTexture(`enemy_circle_${i}`, 64, 64);
      graphics.destroy();
      frames.push({ key: `enemy_circle_${i}` });
    }

    // 創建動畫配置
    this.anims.create({
      key: 'enemy_circle_anim',
      frames: frames,
      frameRate: 10,
      repeat: -1
    });
  }

  /**
   * 載入月亮主題背景圖片
   */
  private loadMoonBackground(): void {
    console.log('🌙 載入月亮主題背景');

    // 載入真實的月亮視差背景圖片
    try {
      // 天空層 - 最遠的背景
      this.load.image('moon-sky', 'assets/backgrounds/moon/moon_sky.png');

      // 後景層 - 遠山/星空
      this.load.image('moon-back', 'assets/backgrounds/moon/moon_back.png');

      // 中景層 - 月球表面
      this.load.image('moon-mid', 'assets/backgrounds/moon/moon_mid.png');

      // 地球層 - 地球視圖
      this.load.image('moon-earth', 'assets/backgrounds/moon/moon_earth.png');

      // 前景層 - 近景元素
      this.load.image('moon-front', 'assets/backgrounds/moon/moon_front.png');

      // 地面層 - 月球地面
      this.load.image('moon-floor', 'assets/backgrounds/moon/moon_floor.png');

      console.log('🌙 真實月亮背景圖片載入排程完成（相對路徑）');
    } catch (error) {
      console.warn('⚠️ 月亮背景載入失敗，將使用備用背景:', error);
    }
  }

  create() {
    console.log('🏗️ 創建遊戲場景');

    // 創建太空船動畫
    this.createSpaceshipAnimation();

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

    console.log('✅ 遊戲場景創建完成');

    // 🎯 暫時跳過開始畫面，直接開始遊戲（解決點擊問題）
    console.log('🚀 跳過開始畫面，直接開始遊戲');
    this.showStartScreen = false;
    this.gameStarted = true;

    // 延遲啟動遊戲，確保所有系統初始化完成
    this.time.delayedCall(1000, () => {
      console.log('🎮 延遲啟動遊戲...');
      this.startGame();

      // 🧪 測試雲朵已移除，遊戲更加乾淨

      // 🔴 紅色方塊測試已移除，遊戲更加乾淨
    });
  }



  /**
   * 更新雲朵位置和清理離開螢幕的雲朵
   */
  private updateClouds(): void {
    const cloudCount = this.clouds.children.entries.length;

    // 每 5 秒輸出一次雲朵狀態
    if (Math.floor(Date.now() / 1000) % 5 === 0) {
      console.log('🔄 雲朵更新檢查 - 總數:', cloudCount);
    }

    this.clouds.children.entries.forEach((cloud: any, index: number) => {
      // 每 5 秒輸出雲朵位置
      if (Math.floor(Date.now() / 1000) % 5 === 0) {
        console.log(`☁️ 雲朵 ${index}: x=${Math.round(cloud.x)}, y=${Math.round(cloud.y)}, velocity=${cloud.body?.velocity?.x || 'N/A'}`);
      }

      // 檢查雲朵是否移出螢幕左側
      if (cloud.x < -100) {
        // 清理雲朵和相關文字
        const wordText = cloud.getData('wordText');
        if (wordText) {
          wordText.destroy();
        }
        cloud.destroy();
        console.log('🗑️ 清理離開螢幕的雲朵 - 位置:', cloud.x);
      }
    });
  }

  /**
   * 創建 Wordwall 風格的開始畫面
   */
  private createStartScreen(): void {
    console.log('🎮 創建 Wordwall 風格開始畫面');
    console.log('🔍 當前狀態 - showStartScreen:', this.showStartScreen, 'gameStarted:', this.gameStarted);

    // 創建半透明遮罩 - 設為可互動，完整容器尺寸
    const overlay = this.add.rectangle(637, 369.5, 1274, 739, 0x000000, 0.7);
    overlay.setDepth(1000);
    overlay.setInteractive(); // 🎯 讓遮罩可以接收點擊事件

    // 在遮罩上添加點擊事件
    overlay.on('pointerdown', () => {
      console.log('🖱️ 遮罩點擊檢測，開始遊戲');
      if (this.showStartScreen) {
        this.hideStartScreen();
        this.startGame();
      }
    });

    // 創建開始畫面容器
    this.startScreen = this.add.container(634, 336);
    this.startScreen.setDepth(1001);

    // 遊戲標題
    const title = this.add.text(0, -150, '🛩️ 飛機英語學習遊戲', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 遊戲說明
    const instruction = this.add.text(0, -80, '駕駛飛機收集目標英文單字\n避開其他單字，學習更有效！', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#CCCCCC',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // 創建 Wordwall 風格的 Play 按鈕
    const playButtonBg = this.add.circle(0, 50, 80, 0x4CAF50);
    playButtonBg.setStrokeStyle(4, 0xFFFFFF);

    const playText = this.add.text(0, 50, 'PLAY', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加到容器
    this.startScreen.add([title, instruction, playButtonBg, playText]);

    // 設置按鈕互動 - 使用更大的互動區域
    playButtonBg.setInteractive(new Phaser.Geom.Circle(0, 0, 100), Phaser.Geom.Circle.Contains);
    playText.setInteractive({ useHandCursor: true });

    // 按鈕點擊事件
    const startGameHandler = () => {
      console.log('🎮 點擊 Play 按鈕，開始遊戲');
      this.hideStartScreen();
      this.startGame();
    };

    playButtonBg.on('pointerdown', startGameHandler);
    playText.on('pointerdown', startGameHandler);

    // 添加全畫面點擊監聽器作為備用
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('🖱️ 檢測到點擊事件，showStartScreen:', this.showStartScreen);
      if (this.showStartScreen) {
        console.log('🎮 全畫面點擊檢測，開始遊戲');
        this.hideStartScreen();
        this.startGame();
      } else {
        console.log('⚠️ 開始畫面已隱藏，忽略點擊');
      }
    });

    // 按鈕懸停效果
    playButtonBg.on('pointerover', () => {
      playButtonBg.setFillStyle(0x45a049);
      playButtonBg.setScale(1.1);
    });

    playButtonBg.on('pointerout', () => {
      playButtonBg.setFillStyle(0x4CAF50);
      playButtonBg.setScale(1.0);
    });

    console.log('✅ Wordwall 風格開始畫面創建完成');
  }

  /**
   * 隱藏開始畫面並開始遊戲
   */
  private hideStartScreen(): void {
    if (this.startScreen) {
      this.startScreen.destroy();
      this.startScreen = undefined;
    }

    // 移除遮罩（通過深度查找）
    this.children.list.forEach(child => {
      if ((child as any).depth === 1000) {
        child.destroy();
      }
    });

    this.showStartScreen = false;
    this.gameStarted = true;

    console.log('🎮 開始畫面已隱藏，遊戲開始');
  }

  /**
   * 創建月亮主題視差背景
   */
  private createParallaxBackground(): void {
    console.log('� 創建月亮主題視差背景');

    // 創建基礎背景色（深太空黑色）- 完整容器尺寸，消除白色空間
    const bgRect = this.add.rectangle(637, 369.5, 1274, 739, 0x000000);  // 🎯 完整容器尺寸 1274x739
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

    // 檢查真實月亮背景圖片是否載入成功
    const hasMoonSky = this.textures.exists('moon-sky');
    const hasMoonBack = this.textures.exists('moon-back');
    const hasMoonMid = this.textures.exists('moon-mid');
    const hasMoonEarth = this.textures.exists('moon-earth');
    const hasMoonFront = this.textures.exists('moon-front');
    const hasMoonFloor = this.textures.exists('moon-floor');

    if (hasMoonSky || hasMoonBack || hasMoonMid || hasMoonEarth || hasMoonFront || hasMoonFloor) {
      console.log('🌙 使用真實月亮主題背景圖片');

      // 天空層 - 最遠的背景
      if (hasMoonSky) {
        const skyLayer = this.add.tileSprite(0, 0, 1274, 739, 'moon-sky');
        skyLayer.setOrigin(0, 0);
        skyLayer.setDepth(-20);
        backgroundLayers.push(skyLayer);
      }

      // 後景層 - 遠山/星空
      if (hasMoonBack) {
        const backLayer = this.add.tileSprite(0, 0, 1274, 739, 'moon-back');
        backLayer.setOrigin(0, 0);
        backLayer.setDepth(-18);
        backgroundLayers.push(backLayer);
      }

      // 地球層 - 重新對比參考圖片，正確調整大小和位置
      if (hasMoonEarth) {
        console.log('🌍 重新分析參考圖片，修正地球大小和位置');
        const earthLayer = this.add.image(1220, 277, 'moon-earth');  // 🎯 第三次往上移動1/10
        earthLayer.setDepth(100);   // 🎯 最前景深度，確保可見
        earthLayer.setScale(0.45);  // 🎯 放大0.5倍：0.3*1.5=0.45，3800*0.45=1710px
        earthLayer.setAlpha(1.0);   // 🎯 完全不透明
        // 🎯 不裁剪，保持完整圖片

        console.log('🌍 地球第三次往上移動1/10完成:', {
          x: earthLayer.x,
          y: earthLayer.y,
          scale: earthLayer.scale,
          calculatedWidth: '3800*0.45=1710px',
          position: '第三次往上移動 (1220, 277)',
          depth: earthLayer.depth
        });
      }

      // 中景層 - 月球表面
      if (hasMoonMid) {
        const midLayer = this.add.tileSprite(0, 0, 1274, 739, 'moon-mid');
        midLayer.setOrigin(0, 0);
        midLayer.setDepth(-14);
        backgroundLayers.push(midLayer);
      }

      // 前景層 - 近景元素
      if (hasMoonFront) {
        const frontLayer = this.add.tileSprite(0, 0, 1274, 739, 'moon-front');
        frontLayer.setOrigin(0, 0);
        frontLayer.setDepth(-12);
        backgroundLayers.push(frontLayer);
      }

      // 地面層 - 月球地面
      if (hasMoonFloor) {
        const floorLayer = this.add.tileSprite(0, 0, 1274, 739, 'moon-floor');
        floorLayer.setOrigin(0, 0);
        floorLayer.setDepth(-10);
        backgroundLayers.push(floorLayer);
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

    // 創建星空效果 - 符合參考圖片的分布
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, 1268);  // 🎯 全寬度分布
      const y = Phaser.Math.Between(0, 500);   // 🎯 擴大垂直範圍，符合參考圖片
      const star = this.add.image(x, y, 'star');

      // 🎯 更小更精緻的星星，符合參考圖片
      const scale = Phaser.Math.FloatBetween(0.2, 0.8);
      const alpha = Phaser.Math.FloatBetween(0.6, 1.0);  // 🎯 更亮的星星

      star.setScale(scale);
      star.setAlpha(alpha);
      star.setDepth(-19);  // 🎯 調整深度層級

      // 🎯 更慢的閃爍效果，營造深太空氛圍
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.4,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * 創建玩家飛機 - 使用太空船動畫精靈表
   */
  private createPlayer(): void {
    console.log('🎯 創建玩家射手角色 - 使用太空船動畫');

    // 檢查可用的太空船資源（優先級順序）
    const hasPlayerSpaceshipImage = this.textures.exists('player_spaceship_image');
    const hasPlayerSpaceship = this.textures.exists('player_spaceship');
    const hasShooterImage = this.textures.exists('random_shooter');
    const hasCompleteSpaceship = this.textures.exists('complete_spaceship');

    if (hasPlayerSpaceship) {
      console.log('🚀 使用新的玩家太空船精靈表 - 創建一艘太空船');

      // 創建一艘太空船精靈（只創建1個精靈）
      this.player = this.physics.add.sprite(150, 336, 'player_spaceship');

      // 設置錨點為中心 (0.5, 0.5)
      this.player.setOrigin(0.5, 0.5);

      // 播放7幀飛行動畫（0-6幀）
      this.player.play('spaceship_fly');

      console.log('✅ 太空船創建完成：1個精靈 + 7幀飛行動畫 (292x512)');

    } else if (hasPlayerSpaceshipImage) {
      console.log('� 備用方案：使用新的玩家太空船圖片（普通圖片模式）');

      // 備用方案：使用普通圖片模式
      this.player = this.physics.add.sprite(150, 336, 'player_spaceship_image');

      console.log('✅ 新太空船圖片載入中（靜態模式）');

    } else if (hasShooterImage) {
      console.log('🔄 備用方案1：使用原始精靈表創建太空船動畫');

      // 備用方案1：使用原始精靈表創建太空船
      this.player = this.physics.add.sprite(150, 336, 'random_shooter');

      // 播放太空船飛行動畫（使用原始精靈表的多個幀）
      this.player.play('spaceship_fly');

      console.log('✅ 太空船動畫播放中：spaceship_fly (原始精靈表)');

    } else if (hasCompleteSpaceship) {
      console.log('🚀 備用方案1：使用用戶提供的完整太空船圖片');

      // 使用用戶提供的完整太空船圖片
      this.player = this.physics.add.sprite(150, 336, 'complete_spaceship');

      // 創建引擎火焰效果
      this.createEngineFlameEffect();

    } else if (hasShooterImage) {
      console.log('🚀 備用方案2：使用原始精靈表第0幀');

      // 備用方案：使用原始精靈表
      this.player = this.physics.add.sprite(150, 336, 'random_shooter', 0);

      // 創建引擎火焰效果
      this.createEngineFlameEffect();
    } else {
      console.log('❌ 沒有可用的太空船資源，使用預設飛機');

      // 最後備用方案：使用預設的藍色三角形飛機
      this.player = this.physics.add.sprite(150, 336, 'player-plane');
    }

    // 統一的太空船配置（適用於所有方案）
    this.setupSpaceshipProperties();
  }

  /**
   * 設置太空船的統一屬性，確保位置一致
   */
  private setupSpaceshipProperties(): void {
    console.log('⚙️ 設置太空船統一屬性');

    // 錨點已在創建時設置為中心 (0.5, 0.5)

    // 設置適當的縮放比例，讓太空船大小合適
    this.player.setScale(0.6);

    // 保持原始方向，不進行旋轉和翻轉

    // 設置物理屬性
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // 添加微妙的脈動效果（不影響位置）
    this.tweens.add({
      targets: this.player,
      scaleX: { from: 0.5, to: 0.53 },
      scaleY: { from: 0.5, to: 0.53 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('✅ 太空船屬性設置完成: 中心錨點 + 0.6倍縮放 + 保持原始方向（無旋轉翻轉）');

    // 視覺調試輔助線已隱藏
    // if (process.env.NODE_ENV === 'development') {
    //   // 在太空船位置畫十字線幫助視覺對齊檢查
    //   const graphics = this.add.graphics();
    //   graphics.lineStyle(2, 0xff0000, 0.8);
    //   // 水平線
    //   graphics.moveTo(this.player.x - 50, this.player.y);
    //   graphics.lineTo(this.player.x + 50, this.player.y);
    //   // 垂直線
    //   graphics.moveTo(this.player.x, this.player.y - 50);
    //   graphics.lineTo(this.player.x, this.player.y + 50);
    //   graphics.strokePath();
    //   console.log('🎯 添加視覺調試十字線: 中心點(' + this.player.x + ', ' + this.player.y + ')');
    // }

    console.log('🎯 玩家射手角色創建完成:', {
      x: this.player.x,
      y: this.player.y,
      visible: this.player.visible,
      alpha: this.player.alpha,
      depth: this.player.depth,
      scale: this.player.scale,
      texture: this.player.texture.key
    });
  }

  private createClouds() {
    this.clouds = this.physics.add.group();
    console.log('☁️ 創建雲朵群組');

    // 檢查物理世界狀態
    console.log('🌍 物理世界狀態:', {
      gravity: this.physics.world.gravity,
      bounds: this.physics.world.bounds,
      isPaused: this.physics.world.isPaused
    });

    // 強制確保物理世界運行
    if (this.physics.world.isPaused) {
      console.log('⚡ 物理世界已暫停，強制恢復');
      this.physics.world.resume();
    }
  }

  /**
   * 創建完整的遊戲 HUD
   */
  private createGameHUD(): void {
    console.log('📊 創建遊戲 HUD (已擴展目標詞彙顯示)');

    // 🔧 重新調整左上角文字佈局，平均分佈填補生命值空間

    // 分數顯示（保持原位置）
    this.scoreText = this.add.text(16, 16, '分數: 0', {
      fontSize: '24px',
      color: '#000000',  // 黑色文字適應白色背景
      backgroundColor: '#f8f9fa',  // 淺灰背景提供對比
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 準確率顯示（移到原生命值位置）
    this.accuracyText = this.add.text(16, 50, '準確率: 0%', {
      fontSize: '20px',  // 🔧 稍微增大字體填補空間
      color: '#000000',  // 黑色文字適應白色背景
      backgroundColor: '#f8f9fa',  // 淺灰背景提供對比
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 學習詞彙數顯示（調整位置平均分佈）
    this.wordsLearnedText = this.add.text(16, 84, '學習詞彙: 0', {
      fontSize: '20px',  // 🔧 稍微增大字體保持一致性
      color: '#000000',  // 黑色文字適應白色背景
      backgroundColor: '#f8f9fa',  // 淺灰背景提供對比
      padding: { x: 8, y: 4 }
    }).setDepth(100);

    // 🔧 血條顯示（移動到左下角）
    this.healthBar = new HealthBar(this, 16, this.cameras.main.height - 60);
    console.log('❤️ 血條 UI 已創建（左下角位置）');

    // 目標詞彙顯示 - 完整容器尺寸版本
    this.targetWordText = this.add.text(637, 20, '目標: 載入中...', {  // 🎯 完整容器寬度中央 (1274/2)
      fontSize: '32px',  // 🎯 放大字體適應完整尺寸
      color: '#1f2937',  // 深灰色文字適應白色背景
      backgroundColor: '#fef3c7',  // 淺黃背景保持目標詞彙的突出效果
      padding: { x: 16, y: 12 },  // 🎯 增加內邊距
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(100);

    // 移除 GEPT 等級顯示（不是統一控制的元素）
  }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();

    // WASD 控制
    const wasd = this.input.keyboard!.addKeys('W,S,A,D');
    (this as any).wasd = wasd;

    // 🖱️ 添加觸碰和滑鼠控制
    this.setupTouchAndMouseControls();

    console.log('🎮 設置輸入控制（鍵盤 + 觸碰 + 滑鼠）');
  }

  /**
   * 設置觸碰和滑鼠控制
   */
  private setupTouchAndMouseControls(): void {
    console.log('👆 設置觸碰和滑鼠控制');

    // 添加觸碰/滑鼠控制變數
    (this as any).touchControl = {
      isPressed: false,
      moveUp: false,
      moveDown: false
    };

    // 監聽指針按下事件（滑鼠左鍵或觸碰）
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 只在遊戲進行中響應控制
      if (!this.gameState.isPlaying || this.gameState.isPaused || this.showStartScreen) {
        return;
      }

      const touchControl = (this as any).touchControl;
      touchControl.isPressed = true;

      // 根據點擊位置決定移動方向
      const gameHeight = 739; // 遊戲容器高度
      const centerY = gameHeight / 2;

      if (pointer.y < centerY) {
        // 點擊上半部分 - 向上移動
        touchControl.moveUp = true;
        touchControl.moveDown = false;
        console.log('👆 觸碰控制：向上移動');
      } else {
        // 點擊下半部分 - 向下移動
        touchControl.moveUp = false;
        touchControl.moveDown = true;
        console.log('👇 觸碰控制：向下移動');
      }
    });

    // 監聽指針釋放事件
    this.input.on('pointerup', () => {
      const touchControl = (this as any).touchControl;
      touchControl.isPressed = false;
      touchControl.moveUp = false;
      touchControl.moveDown = false;
      console.log('✋ 觸碰控制：停止移動');
    });

    // 監聽指針移出遊戲區域
    this.input.on('pointerout', () => {
      const touchControl = (this as any).touchControl;
      touchControl.isPressed = false;
      touchControl.moveUp = false;
      touchControl.moveDown = false;
      console.log('🚫 觸碰控制：指針移出，停止移動');
    });

    console.log('✅ 觸碰和滑鼠控制設置完成');
    console.log('📱 使用方法：');
    console.log('  - 點擊/觸碰畫面上半部分：飛機向上移動');
    console.log('  - 點擊/觸碰畫面下半部分：飛機向下移動');
    console.log('  - 釋放滑鼠/手指：停止移動');
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

      // 更新雙語管理器的目標詞彙
      this.bilingualManager.updateTargetWord(this.currentTargetWord.english);

      // 更新中文 UI 管理器的目標詞彙
      this.chineseUIManager.updateTargetWord(this.currentTargetWord);

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
    console.log('☁️ 開始雲朵生成 - 每 2 秒生成一個雲朵');
    console.log('🎮 遊戲狀態:', this.gameState);

    // 立即生成第一個雲朵進行測試
    this.time.delayedCall(500, () => {
      console.log('🧪 測試：立即生成第一個雲朵');
      this.spawnCloud();
    });
  }

  /**
   * 生成詞彙雲朵 (修復版本)
   */
  private spawnCloud(): void {
    console.log('🔄 嘗試生成雲朵...');
    console.log('🎮 遊戲狀態 isPlaying:', this.gameState.isPlaying);

    if (!this.gameState.isPlaying) {
      console.log('❌ 遊戲未在進行中，跳過雲朵生成');
      return;
    }

    // 從 GEPT 管理器獲取隨機詞彙
    const word = this.geptManager.getRandomWord();
    console.log('📝 獲取詞彙:', word);

    if (!word) {
      console.log('❌ 無法獲取詞彙，跳過雲朵生成');
      return;
    }

    const x = 1350;  // 🎯 從最右邊邊界開始 (Wordwall 寬度 1274 + 邊距)
    const y = Phaser.Math.Between(100, 639);  // 🎯 Wordwall 高度 739 - 100 像素

    // 創建雲朵精靈 (使用備用紋理如果主圖片載入失敗)
    const cloudTexture = this.useBackupCloudTexture ? 'cloud-word-fallback' : 'cloud-word';
    const cloud = this.physics.add.image(x, y, cloudTexture);

    console.log('☁️ 使用雲朵紋理:', cloudTexture, '位置:', x, y);

    // 🔧 設定雲朵大小 (增加 44% = 1.2 * 1.2)
    cloud.setScale(1.44);

    // 🔧 強制確保物理體正確設定
    if (!cloud.body) {
      console.log('❌ 雲朵沒有物理體，強制啟用物理');
      this.physics.world.enable(cloud);
    }

    // 設定速度 - 使用多種方法確保生效
    cloud.setVelocityX(-200); // 方法1: 直接設定
    if (cloud.body) {
      cloud.body.setVelocityX(-200); // 方法2: 通過 body 設定
      cloud.body.velocity.x = -200;  // 方法3: 直接設定 velocity 屬性
    }

    // 調試：檢查物理屬性
    console.log('🔧 雲朵物理屬性 (修復後):', {
      hasBody: !!cloud.body,
      velocity: cloud.body?.velocity,
      velocityX: cloud.body?.velocity?.x,
      position: { x: cloud.x, y: cloud.y },
      bodyType: cloud.body?.constructor.name
    });
    cloud.setData('word', word);
    cloud.setData('isTarget', word.english === this.currentTargetWord?.english);
    cloud.setDepth(110); // 🌍 確保在地球(depth=100)上方
    cloud.setAlpha(1); // 確保不透明
    cloud.setVisible(true); // 確保可見

    // 添加詞彙文字 (增加 44% = 16px * 1.44 ≈ 23px)
    // 🔧 修復白色閃爍：使用透明背景而不是白色背景
    const isTarget = word.english === this.currentTargetWord?.english;
    const wordText = this.add.text(x, y, word.english, {
      fontSize: '23px',
      color: isTarget ? '#ff0000' : '#000000',
      fontStyle: isTarget ? 'bold' : 'normal',
      backgroundColor: isTarget ? '#ffff00' : 'rgba(255, 255, 255, 0.8)', // 半透明白色而不是純白色
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    wordText.setDepth(111); // 🌍 文字在雲朵(depth=110)之上，也在地球(depth=100)上方
    wordText.setAlpha(1);
    wordText.setVisible(true);

    // 將文字綁定到雲朵
    cloud.setData('wordText', wordText);

    // 如果是目標詞彙，顯示中文提示
    if (isTarget && this.bilingualManager) {
      this.bilingualManager.showChinesePrompt(word.english, { x: x, y: y - 60 });
    }

    // 🔧 在添加到群組前再次確認速度
    console.log('🔧 添加到群組前的速度:', cloud.body?.velocity?.x);

    this.clouds.add(cloud);

    // 🔧 添加到群組後檢查速度是否被重置
    console.log('🔧 添加到群組後的速度:', cloud.body?.velocity?.x);

    // 🚀 強制重新設定速度（防止群組重置）
    if (cloud.body?.velocity?.x !== -200) {
      console.log('⚠️ 速度被重置，強制恢復');
      cloud.setVelocityX(-200);
      cloud.body.velocity.x = -200;
    }

    console.log('☁️ 生成雲朵 (修復版本):', word.english, isTarget ? '(目標)' : '', {
      cloudVisible: cloud.visible,
      textVisible: wordText.visible,
      cloudDepth: cloud.depth,
      textDepth: wordText.depth
    });
  }

  /**
   * 強制生成測試雲朵（用於調試）
   */
  private forceSpawnTestCloud(): void {
    console.log('🧪 強制生成測試雲朵 - 開始');

    // 創建簡單的測試雲朵
    const x = 1000;  // 更靠左，確保在螢幕內可見
    const y = 300;   // 中間位置

    // 使用備用紋理如果主圖片載入失敗
    const cloudTexture = this.useBackupCloudTexture ? 'cloud-word-fallback' : 'cloud-word';
    const testCloud = this.physics.add.image(x, y, cloudTexture);

    // 🔧 強制確保測試雲朵物理體正確設定
    if (!testCloud.body) {
      console.log('❌ 測試雲朵沒有物理體，強制啟用物理');
      this.physics.world.enable(testCloud);
    }

    // 設定速度 - 使用多種方法確保生效
    testCloud.setVelocityX(-150); // 方法1: 直接設定
    if (testCloud.body) {
      testCloud.body.setVelocityX(-150); // 方法2: 通過 body 設定
      testCloud.body.velocity.x = -150;  // 方法3: 直接設定 velocity 屬性
    }

    testCloud.setDepth(10); // 最高深度
    testCloud.setAlpha(1);
    testCloud.setVisible(true);
    testCloud.setTint(0xff0000); // 紅色，容易識別

    console.log('🧪 測試雲朵使用紋理:', cloudTexture);
    console.log('🧪 測試雲朵物理屬性:', {
      hasBody: !!testCloud.body,
      velocity: testCloud.body?.velocity,
      velocityX: testCloud.body?.velocity?.x
    });

    // 添加測試文字
    const testText = this.add.text(x, y, 'TEST', {
      fontSize: '20px',
      color: '#ffffff',  // 白色文字在紅色背景上保持可見
      fontStyle: 'bold',
      backgroundColor: '#dc2626',  // 紅色背景保持測試標識
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    testText.setDepth(11);
    testText.setAlpha(1);
    testText.setVisible(true);

    // 綁定文字到雲朵
    testCloud.setData('wordText', testText);
    testCloud.setData('word', { english: 'test', chinese: '測試' });
    testCloud.setData('isTarget', false);

    // 🔧 在添加到群組前再次確認測試雲朵速度
    console.log('🧪 添加到群組前的測試雲朵速度:', testCloud.body?.velocity?.x);

    this.clouds.add(testCloud);

    // 🔧 添加到群組後檢查測試雲朵速度是否被重置
    console.log('🧪 添加到群組後的測試雲朵速度:', testCloud.body?.velocity?.x);

    // 🚀 強制重新設定測試雲朵速度（防止群組重置）
    if (testCloud.body?.velocity?.x !== -150) {
      console.log('⚠️ 測試雲朵速度被重置，強制恢復');
      testCloud.setVelocityX(-150);
      testCloud.body.velocity.x = -150;
    }

    console.log('🧪 測試雲朵已生成:', {
      x: x,
      y: y,
      visible: testCloud.visible,
      depth: testCloud.depth,
      velocity: testCloud.body?.velocity
    });
  }

  /**
   * 創建簡單的測試物件
   */
  private createSimpleTestObject(): void {
    console.log('🔴 創建簡單紅色方塊');

    const testRect = this.add.rectangle(600, 200, 50, 50, 0xff0000);
    testRect.setDepth(20);
    testRect.setAlpha(1);
    testRect.setVisible(true);

    // 添加移動動畫
    this.tweens.add({
      targets: testRect,
      x: 100,
      duration: 3000,
      ease: 'Linear'
    });

    console.log('🔴 紅色方塊已創建:', {
      x: testRect.x,
      y: testRect.y,
      visible: testRect.visible,
      depth: testRect.depth
    });
  }

  /**
   * 處理高級碰撞檢測
   */
  private handleAdvancedCollision(player: any, cloud: any): void {
    // 🎯 防止重複碰撞：如果遊戲已結束或暫停，忽略碰撞
    if (!this.gameState.isPlaying || this.gameState.isPaused) {
      return;
    }

    const word: GEPTWord = cloud.getData('word');
    const isTarget: boolean = cloud.getData('isTarget');
    const wordText = cloud.getData('wordText');

    // 🎯 防止重複碰撞：檢查雲朵是否已被處理
    if (cloud.getData('processed')) {
      return;
    }

    // 標記雲朵為已處理
    cloud.setData('processed', true);

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

      // 顯示成功提示
      if (this.chineseUIManager) {
        this.chineseUIManager.showSuccessMessage(word, 10);
      }

      // 隱藏中文提示
      if (this.bilingualManager) {
        this.bilingualManager.hideChinesePrompt();
      }

      // 設置新的目標詞彙
      this.setRandomTargetWord();

      console.log('✅ 正確碰撞:', word.english);
    } else {
      // 🎯 追蹤錯誤次數
      this.wrongCollisions++;

      console.log('❌ 錯誤碰撞:', word.english, `(第${this.wrongCollisions}次錯誤)`);

      // 🎯 第5次錯誤：分數歸零後立即結束遊戲
      if (this.wrongCollisions >= 5) {
        console.log('💥 第5次錯誤！分數歸零後結束遊戲');

        // 立即停止遊戲狀態，防止更多碰撞
        this.gameState.isPlaying = false;

        // 先將分數歸零
        this.gameState.currentScore = 0;
        this.updateUI(); // 立即更新UI顯示分數歸零

        // 顯示特殊提示
        if (this.chineseUIManager) {
          this.chineseUIManager.showErrorMessage(
            { english: 'GAME OVER', chinese: '遊戲結束' } as GEPTWord,
            0
          );
        }

        // 🔧 修復白色閃爍：使用淡出動畫移除雲朵和文字
        this.removeCloudWithAnimation(cloud, wordText);

        // 延遲1秒後結束遊戲，讓玩家看到分數歸零
        this.time.delayedCall(1000, () => {
          this.endGame();
        });
        return;
      }

      // 普通錯誤：減少生命值
      this.gameState.currentHealth -= 20;

      // 顯示錯誤提示
      if (this.chineseUIManager) {
        this.chineseUIManager.showErrorMessage(word, 20);
      }

      // 普通錯誤：檢查生命值
      if (this.gameState.currentHealth <= 0) {
        // 🔧 修復白色閃爍：使用淡出動畫移除雲朵和文字
        this.removeCloudWithAnimation(cloud, wordText);

        this.endGame();
        return;
      }
    }

    // 🔧 修復白色閃爍：使用淡出動畫移除雲朵和文字
    this.removeCloudWithAnimation(cloud, wordText);

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
    // 🔧 使用血條更新生命值顯示
    this.healthBar.updateHealth(this.gameState.currentHealth, true);
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

    // 🎯 重置遊戲統計（包括錯誤次數）
    this.totalCollisions = 0;
    this.correctCollisions = 0;
    this.wrongCollisions = 0;

    console.log('🚀 遊戲開始（錯誤次數已重置）');

    // 開始雲朵生成
    this.startCloudSpawning();

    this.sendMessageToParent({
      type: 'GAME_STATE_CHANGE',
      state: 'playing'
    });
  }

  private endGame() {
    this.gameState.isPlaying = false;

    // 🎯 遊戲結束時生命值歸零
    this.gameState.currentHealth = 0;

    // 立即更新UI顯示生命值為0
    this.updateUI();

    console.log('🏁 遊戲結束 - 生命值歸零');

    // 停止雲朵生成
    if (this.cloudSpawnTimer) {
      this.cloudSpawnTimer.destroy();
    }

    // 🔧 修復白色閃爍：漸進式清理雲朵而不是瞬間清空
    this.clearCloudsGradually();

    this.sendMessageToParent({
      type: 'GAME_COMPLETE',
      score: this.gameState.currentScore,
      health: this.gameState.currentHealth  // 現在會是0
    });
  }

  /**
   * 漸進式清理雲朵，防止白色閃爍
   */
  private clearCloudsGradually(): void {
    console.log('🌤️ 開始漸進式清理雲朵，防止白色閃爍');

    const clouds = this.clouds.children.entries;
    if (clouds.length === 0) {
      console.log('✅ 沒有雲朵需要清理');
      return;
    }

    // 為每個雲朵添加淡出動畫
    clouds.forEach((cloud: any, index: number) => {
      this.tweens.add({
        targets: cloud,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        delay: index * 50, // 錯開動畫時間
        ease: 'Power2',
        onComplete: () => {
          if (cloud && cloud.active) {
            cloud.destroy();
          }
        }
      });
    });

    // 延遲清理群組，確保所有動畫完成
    this.time.delayedCall(1000, () => {
      this.clouds.clear(false, false); // 不銷毀子物件，因為已經在動畫中銷毀
      console.log('✅ 雲朵漸進式清理完成');
    });
  }

  /**
   * 使用動畫移除單個雲朵，防止白色閃爍
   */
  private removeCloudWithAnimation(cloud: any, wordText?: any): void {
    console.log('🌤️ 使用淡出動畫移除雲朵');

    // 🔧 修復白色閃爍：先處理文字，確保白色背景不會造成閃爍
    if (wordText && wordText.active) {
      // 文字立即開始淡出，比雲朵稍快
      this.tweens.add({
        targets: wordText,
        alpha: 0,
        scale: 0.2,
        duration: 150, // 比雲朵快50ms
        ease: 'Power2',
        onComplete: () => {
          if (wordText && wordText.active) {
            wordText.destroy();
            console.log('✅ 文字已銷毀');
          }
        }
      });
    }

    // 雲朵稍後開始淡出
    this.tweens.add({
      targets: cloud,
      alpha: 0,
      scale: 0.3,
      duration: 200,
      delay: 50, // 延遲50ms，確保文字先開始淡出
      ease: 'Power2',
      onComplete: () => {
        if (cloud && cloud.active) {
          cloud.destroy();
          console.log('✅ 雲朵已銷毀');
        }
      }
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

    // 更新雲朵位置和清理
    this.updateClouds();

    // 太空船脈動效果已通過 Tween 自動處理

    // 更新中文 UI 系統
    this.updateChineseUI();

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
   * 更新中文 UI 系統
   */
  private updateChineseUI(): void {
    if (this.chineseUIManager) {
      // 更新分數顯示
      this.chineseUIManager.updateScore(this.gameState.currentScore);

      // 更新生命值顯示
      this.chineseUIManager.updateLives(this.gameState.currentHealth);

      // 更新遊戲狀態
      const status = this.gameState.isPlaying ? 'playing' :
                    this.gameState.isPaused ? 'paused' : 'waiting';
      this.chineseUIManager.updateGameStatus(status);
    }
  }

  /**
   * 處理玩家移動 - 只允許上下移動（鍵盤 + 觸碰 + 滑鼠）
   */
  private handlePlayerMovement(): void {
    const speed = 250;
    const wasd = (this as any).wasd;
    const touchControl = (this as any).touchControl;

    // 🚫 移除左右移動控制，飛機只能上下移動
    // 保持飛機在水平位置固定
    this.player.setVelocityX(0);

    // ✅ 整合所有控制方式：鍵盤 + 觸碰 + 滑鼠
    const moveUp = this.cursors.up.isDown || wasd?.W.isDown || touchControl?.moveUp;
    const moveDown = this.cursors.down.isDown || wasd?.S.isDown || touchControl?.moveDown;

    if (moveUp) {
      this.player.setVelocityY(-speed);
    } else if (moveDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  /**
   * 創建引擎火焰效果 - 只有引擎部分動畫
   */
  private createEngineFlameEffect(): void {
    console.log('🔥 創建引擎火焰效果');

    // 計算引擎火焰位置（太空船後方）
    const flameX = this.player.x;
    const flameY = this.player.y + 30; // 太空船後方位置

    // 使用簡單的動畫精靈作為引擎火焰
    const engineFlame = this.add.sprite(flameX, flameY, 'cloud');
    engineFlame.setScale(0.3);
    engineFlame.setTint(0xff6600); // 橙色火焰
    engineFlame.setDepth(this.player.depth - 1);

    // 創建火焰閃爍動畫
    this.tweens.add({
      targets: engineFlame,
      alpha: { from: 0.8, to: 0.3 },
      scaleX: { from: 0.3, to: 0.4 },
      scaleY: { from: 0.3, to: 0.4 },
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('🔥 引擎火焰效果創建完成');
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
