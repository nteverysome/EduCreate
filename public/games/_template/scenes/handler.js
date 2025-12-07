/**
 * Handler 場景 - 場景管理器 v2.0
 *
 * 🏆 基於 Match-up 遊戲的成功架構（Phaser.Scale.FIT 模式）
 *
 * 🎯 功能：
 * 1. 管理場景切換
 * 2. FIT 模式響應式系統（Phaser 自動處理縮放）
 * 3. 頁面可見性處理（防止切換標籤時重啟場景）
 *
 * 📖 使用說明：
 * - 這個檔案通常不需要修改
 * - 如果需要自定義場景切換邏輯，可以在這裡修改
 *
 * 📚 參考遊戲：
 * - Match-up 配對遊戲 (/games/match-up-game/scenes/handler.js)
 */

export default class Handler extends Phaser.Scene {

  sceneRunning = null  // 追蹤當前正在運行的場景名稱

  constructor() {
    super('handler');
  }

  create() {
    console.log('🎮 [Handler] 場景管理器啟動（FIT 模式）');

    // 設定主攝影機背景顏色（白色 - Wordwall Classic 主題）
    this.cameras.main.setBackgroundColor('#FFFFFF');

    // 🔥 FIT 模式會自動處理所有響應式邏輯
    console.log('🎮 [Handler] 使用 FIT 模式，Phaser 自動處理響應式');

    // 🔥 監聯頁面可見性變化，防止切換標籤時重啟場景
    this.setupVisibilityHandling();

    // 啟動預載場景
    this.launchScene('preload');

    console.log('✅ [Handler] 場景管理器已啟動');
  }

  /**
   * 🔥 設置頁面可見性處理（來自 Match-up 最佳實踐）
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📴 [Handler] 頁面隱藏（切換標籤/最小化）');
      } else {
        console.log('📱 [Handler] 頁面顯示（切回標籤/恢復）');
        // 確保遊戲場景仍在運行
        const gameScene = this.scene.get('game');
        if (gameScene && !gameScene.scene.isActive()) {
          console.log('⚠️ [Handler] GameScene 未運行，嘗試喚醒');
          this.scene.wake('game');
        }
      }
    });
    console.log('✅ [Handler] 頁面可見性處理已設置');
  }

  /**
   * 啟動場景
   * @param {string} scene - 場景鍵值
   * @param {Object} data - 傳遞給場景的數據
   */
  launchScene(scene, data) {
    console.log(`🚀 [Handler] 啟動場景: ${scene}`);

    // 主要場景使用 start（停止其他場景）
    if (scene === 'game' || scene === 'menu') {
      this.scene.start(scene, data);
    } else {
      // 背景場景使用 launch（並行運行）
      this.scene.launch(scene, data);
    }

    // 保存場景引用
    this.gameScene = this.scene.get(scene);
    this.sceneRunning = scene;

    console.log(`✅ [Handler] 場景 ${scene} 已啟動`, {
      isActive: this.gameScene?.scene.isActive(),
      isVisible: this.gameScene?.scene.isVisible()
    });
  }

  /**
   * 停止場景
   * @param {string} scene - 場景鍵值
   */
  stopScene(scene) {
    console.log(`🛑 [Handler] 停止場景: ${scene}`);
    this.scene.stop(scene);
  }

  /**
   * 🔥 響應式更新方法（FIT 模式版本）
   * 在 GameScene.create() 中調用此方法
   * @param {Phaser.Scene} scene - 需要設定響應式功能的場景實例
   *
   * 📖 在 FIT 模式下，Phaser 自動處理縮放
   * 我們只需要監聯 resize 事件並調用 GameScene 的 updateLayout
   */
  updateResize(scene) {
    console.log('📐 [Handler] 初始化響應式系統（FIT 模式）');

    // 🔥 在 FIT 模式下，監聯 resize 事件
    scene.scale.on('resize', (gameSize) => {
      console.log('📐 [Handler] Resize 事件:', {
        width: gameSize.width,
        height: gameSize.height
      });

      // 獲取 GameScene 並調用 updateLayout（如果存在）
      const gameScene = scene.scene.get('game');
      if (gameScene && typeof gameScene.updateLayout === 'function') {
        console.log('📐 [Handler] 調用 GameScene.updateLayout');
        gameScene.updateLayout();
      }
    });

    console.log('✅ [Handler] 響應式系統就緒（FIT 模式）', {
      scaleWidth: scene.scale.gameSize.width,
      scaleHeight: scene.scale.gameSize.height,
      baseWidth: scene.game.screenBaseSize.width,
      baseHeight: scene.game.screenBaseSize.height
    });
  }

  // 🔥 FIT 模式說明：
  // 舊的 resize() 和 updateCamera() 方法已被移除
  // 因為 Phaser.Scale.FIT 模式會自動處理所有縮放邏輯
  // 如果需要在 resize 時更新遊戲元素佈局，
  // 請在 GameScene 中實現 updateLayout() 方法
}

