/**
 * Game 場景 - 主遊戲場景 v2.0
 *
 * 🏆 基於 Match-up 遊戲的成功架構（FIT 模式）
 *
 * 🎯 功能：
 * 1. 遊戲主邏輯
 * 2. 使用固定設計座標（960×540）
 * 3. Phaser FIT 模式自動縮放
 * 4. 遊戲狀態管理（playing, paused, completed）
 * 5. 計時器系統（可選）
 * 6. 結果收集（用於分析）
 *
 * 📖 使用說明：
 * 1. 在 create() 中初始化遊戲
 * 2. 使用固定座標開發（centerX = 480, centerY = 270）
 * 3. 不需要手動處理響應式（FIT 模式自動處理）
 * 4. 實現 updateLayout() 方法來處理 resize 時的元素重新佈局
 *
 * 📚 參考遊戲：
 * - Match-up 配對遊戲 (/games/match-up-game/scenes/game.js)
 */

export default class GameScene extends Phaser.Scene {

  // ===== 遊戲配置（Match-up 風格）=====
  gameState = 'ready';        // ready, playing, paused, completed
  timerType = 'none';         // none, countUp, countDown
  timerMinutes = 5;           // 計時器分鐘數
  timerSeconds = 0;           // 計時器秒數
  startTime = null;           // 遊戲開始時間

  // ===== 遊戲數據 =====
  score = 0;                  // 分數
  correctCount = 0;           // 正確數量
  incorrectCount = 0;         // 錯誤數量

  constructor() {
    super('game');
  }

  create() {
    console.log('🎮 [Game] 遊戲場景啟動（FIT 模式）');

    // 🔥 初始化響應式系統
    const handler = this.scene.get('handler');
    handler.updateResize(this);

    // 獲取設計尺寸（固定座標）
    const designWidth = this.game.screenBaseSize.width;   // 960
    const designHeight = this.game.screenBaseSize.height; // 540
    const centerX = designWidth / 2;   // 480
    const centerY = designHeight / 2;  // 270

    console.log('📐 [Game] 設計尺寸:', designWidth, 'x', designHeight);

    // ===== 🔧 在這裡開始你的遊戲開發 =====

    // 創建遊戲元素
    this.createBackground();
    this.createTitle(centerX, centerY);
    this.createStartButton(centerX, centerY + 100);
    this.setupInput();

    // 初始化計時器（如果啟用）
    if (this.timerType !== 'none') {
      this.createTimer(centerX, 30);
    }

    console.log('✅ [Game] 遊戲初始化完成');
  }

  update(time, delta) {
    // 🔥 更新計時器
    if (this.gameState === 'playing' && this.timerType !== 'none') {
      this.updateTimer();
    }
  }

  /**
   * 🔥 響應式佈局更新方法
   * 當視窗大小改變時，Handler 會調用此方法
   * 在這裡重新計算和更新所有遊戲元素的位置
   */
  updateLayout() {
    console.log('📐 [Game] updateLayout 被調用');
    // 🔧 在這裡實現你的佈局更新邏輯
    // 例如：重新計算卡片位置、更新 UI 元素位置等
  }

  /**
   * 創建背景（白色 - Wordwall Classic 主題）
   */
  createBackground() {
    const designWidth = this.game.screenBaseSize.width;
    const designHeight = this.game.screenBaseSize.height;

    // 白色背景（Match-up 風格）
    this.add.rectangle(
      designWidth / 2,
      designHeight / 2,
      designWidth,
      designHeight,
      0xFFFFFF
    );
  }

  /**
   * 創建標題
   */
  createTitle(x, y) {
    this.add.text(x, y - 100, 'My Game', {
      fontSize: '48px',
      color: '#333333',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.add.text(x, y - 50, 'Template Game v2.0', {
      fontSize: '24px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  /**
   * 創建開始按鈕（Match-up 風格）
   */
  createStartButton(x, y) {
    // 按鈕背景（藍色 - Match-up 風格）
    const button = this.add.rectangle(x, y, 200, 60, 0x2196F3, 1)
      .setInteractive({ useHandCursor: true });

    // 圓角效果（使用 Graphics）
    button.setStrokeStyle(2, 0x1976D2);

    // 按鈕文字
    this.add.text(x, y, '▶ Start', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 按鈕互動
    button.on('pointerover', () => button.setFillStyle(0x42A5F5));
    button.on('pointerout', () => button.setFillStyle(0x2196F3));
    button.on('pointerdown', () => this.startGame());
  }

  /**
   * 創建計時器顯示
   */
  createTimer(x, y) {
    this.timerText = this.add.text(x, y, '0:00', {
      fontSize: '32px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  /**
   * 更新計時器
   */
  updateTimer() {
    if (!this.startTime) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    if (this.timerText) {
      this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }

  /**
   * 設置輸入控制
   */
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  /**
   * 開始遊戲
   */
  startGame() {
    console.log('🎮 [Game] 遊戲開始！');
    this.gameState = 'playing';
    this.startTime = Date.now();

    // 🔧 在這裡實現你的遊戲開始邏輯
  }

  /**
   * 結束遊戲
   */
  endGame() {
    console.log('🎮 [Game] 遊戲結束！');
    this.gameState = 'completed';

    // 收集遊戲結果
    const results = this.collectResults();
    console.log('📊 [Game] 遊戲結果:', results);

    // 🔧 在這裡實現你的遊戲結束邏輯
  }

  /**
   * 收集遊戲結果（用於分析）
   */
  collectResults() {
    const endTime = Date.now();
    const duration = this.startTime ? Math.floor((endTime - this.startTime) / 1000) : 0;

    return {
      score: this.score,
      correctCount: this.correctCount,
      incorrectCount: this.incorrectCount,
      totalQuestions: this.correctCount + this.incorrectCount,
      accuracy: this.correctCount + this.incorrectCount > 0
        ? (this.correctCount / (this.correctCount + this.incorrectCount) * 100).toFixed(1)
        : 0,
      duration: duration,
      completedAt: new Date().toISOString()
    };
  }
}

