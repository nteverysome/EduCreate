/**
 * Game 場景 - 主遊戲場景
 * 
 * 🏆 基於 shimozurdo-game 的標準架構
 * 
 * 🎯 功能：
 * 1. 遊戲主邏輯
 * 2. 使用固定設計座標（960×540）
 * 3. Camera Zoom 自動縮放
 * 
 * 📖 使用說明：
 * 1. 在 create() 中初始化遊戲
 * 2. 使用固定座標開發（centerX = 480, centerY = 270）
 * 3. 不需要手動處理響應式（handler 自動處理）
 */

export default class GameScene extends Phaser.Scene {
  
  constructor() {
    super('game');
  }
  
  create() {
    console.log('🎮 [Game] 遊戲場景啟動');
    
    // 🔥 關鍵：啟用響應式系統
    const handler = this.scene.get('handler');
    handler.updateResize(this);
    
    // 獲取設計尺寸（固定座標）
    const designWidth = this.game.screenBaseSize.width;   // 960
    const designHeight = this.game.screenBaseSize.height; // 540
    const centerX = designWidth / 2;   // 480
    const centerY = designHeight / 2;  // 270
    
    console.log('📐 [Game] 設計尺寸:', designWidth, 'x', designHeight);
    
    // ===== 🔧 在這裡開始你的遊戲開發 =====
    
    // 範例：添加背景
    this.createBackground();
    
    // 範例：添加標題
    this.createTitle(centerX, centerY);
    
    // 範例：添加開始按鈕
    this.createStartButton(centerX, centerY + 100);
    
    // 範例：添加鍵盤控制
    this.setupInput();
  }
  
  update(time, delta) {
    // 遊戲更新邏輯
  }
  
  /**
   * 創建背景
   * 🔧 修改為你的背景
   */
  createBackground() {
    const designWidth = this.game.screenBaseSize.width;
    const designHeight = this.game.screenBaseSize.height;
    
    // 範例：純色背景
    this.add.rectangle(
      designWidth / 2,
      designHeight / 2,
      designWidth,
      designHeight,
      0x1a1a2e
    );
    
    // 範例：圖片背景
    // this.add.image(designWidth / 2, designHeight / 2, 'background');
  }
  
  /**
   * 創建標題
   * 🔧 修改為你的標題
   */
  createTitle(x, y) {
    this.add.text(x, y - 100, 'My Game', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(x, y - 30, 'Template Game', {
      fontSize: '32px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }
  
  /**
   * 創建開始按鈕
   * 🔧 修改為你的按鈕
   */
  createStartButton(x, y) {
    // 按鈕背景
    const button = this.add.rectangle(x, y, 200, 60, 0x4CAF50)
      .setInteractive({ useHandCursor: true });
    
    // 按鈕文字
    const buttonText = this.add.text(x, y, 'Start Game', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 按鈕互動
    button.on('pointerover', () => {
      button.setFillStyle(0x66BB6A);
    });
    
    button.on('pointerout', () => {
      button.setFillStyle(0x4CAF50);
    });
    
    button.on('pointerdown', () => {
      console.log('🎮 [Game] 開始遊戲');
      this.startGame();
    });
  }
  
  /**
   * 設置輸入控制
   * 🔧 修改為你的控制
   */
  setupInput() {
    // 鍵盤控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 空白鍵
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // ESC 鍵
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }
  
  /**
   * 開始遊戲
   * 🔧 修改為你的遊戲邏輯
   */
  startGame() {
    console.log('🎮 [Game] 遊戲開始！');
    
    // 範例：顯示訊息
    const centerX = this.game.screenBaseSize.width / 2;
    const centerY = this.game.screenBaseSize.height / 2;
    
    const message = this.add.text(centerX, centerY + 200, 'Game Started!', {
      fontSize: '32px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    // 2 秒後移除訊息
    this.time.delayedCall(2000, () => {
      message.destroy();
    });
  }
}

