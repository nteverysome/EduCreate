/**
 * Handler 場景 - 場景管理器
 *
 * 🏆 基於 shimozurdo-game 的成功架構
 *
 * 🎯 功能：
 * 1. 管理場景切換
 * 2. Camera Zoom 響應式系統
 * 3. 統一的攝影機控制
 *
 * 📖 使用說明：
 * - 這個檔案通常不需要修改
 * - 如果需要自定義場景切換邏輯，可以在這裡修改
 */

export default class Handler extends Phaser.Scene {

  sceneRunning = null  // 追蹤當前正在運行的場景名稱

  constructor() {
    super('handler');
  }

  create() {
    // 設定主攝影機背景顏色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 啟動預載場景
    this.launchScene('preload');

    console.log('✅ [Handler] 場景管理器已啟動');
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
   * 響應式更新初始化方法 - 為指定場景設定響應式調整功能
   * 🏆 shimozurdo-game 的 Camera Zoom 方法
   * @param {Phaser.Scene} scene - 需要設定響應式功能的場景實例
   */
  updateResize(scene) {
    // 監聽場景的 resize 事件，當視窗大小改變時調用 resize 方法
    scene.scale.on('resize', this.resize, scene)

    // 獲取當前遊戲的實際顯示寬度
    const scaleWidth = scene.scale.gameSize.width
    // 獲取當前遊戲的實際顯示高度
    const scaleHeight = scene.scale.gameSize.height

    // 創建父容器尺寸結構，用於響應式計算的基準
    scene.parent = new Phaser.Structs.Size(scaleWidth, scaleHeight)
    // 創建調整器尺寸結構，使用 FIT 模式確保內容適應容器
    scene.sizer = new Phaser.Structs.Size(
      scene.game.screenBaseSize.width,
      scene.game.screenBaseSize.height,
      Phaser.Structs.Size.FIT,
      scene.parent
    )

    // 設定父容器的實際尺寸
    scene.parent.setSize(scaleWidth, scaleHeight)
    // 設定調整器的實際尺寸
    scene.sizer.setSize(scaleWidth, scaleHeight)

    // 立即更新攝影機設定以適應新的尺寸
    this.updateCamera(scene)

    console.log('✅ [Handler] updateResize 完成');
  }

  /**
   * 視窗大小調整處理方法 - 當視窗大小改變時自動調用
   * @param {Object} gameSize - 包含新的遊戲尺寸信息的物件
   * 注意：這個方法中的 'this' 指向當前正在運行的場景實例
   */
  resize(gameSize) {
    // 檢查場景是否已停止，避免在場景停止後繼續處理調整
    if (!this.sceneStopped) {
      // 從 gameSize 物件中提取新的寬度
      const width = gameSize.width
      // 從 gameSize 物件中提取新的高度
      const height = gameSize.height

      // 更新父容器的尺寸以匹配新的視窗大小
      this.parent.setSize(width, height)
      // 更新調整器的尺寸以匹配新的視窗大小
      this.sizer.setSize(width, height)

      // 🔥 [v73.0] 使用 RESIZE 模式的遊戲不需要攝影機縮放
      // 因為 Phaser.Scale.RESIZE 會自動調整遊戲尺寸
      console.log('🔥 [v73.0] resize - 使用 RESIZE 模式，不使用攝影機縮放', {
        width,
        height
      });

      // 重置攝影機縮放為 1
      const camera = this.cameras.main
      if (camera) {
        camera.setZoom(1);
      }
    }
  }

  /**
   * 攝影機更新方法 - 根據場景尺寸調整攝影機的縮放和位置
   * @param {Phaser.Scene} scene - 需要更新攝影機的場景實例
   */
  updateCamera(scene) {
    // 獲取指定場景的主攝影機實例
    const camera = scene.cameras.main

    // 🛡️ 防禦性檢查：確保 camera 存在
    if (!camera) {
      console.warn('⚠️ updateCamera: camera 不存在，跳過縮放設置');
      return;
    }

    // 🔥 [v73.0] 使用 RESIZE 模式的遊戲不需要攝影機縮放
    // 因為 Phaser.Scale.RESIZE 會自動調整遊戲尺寸
    console.log('🔥 [v73.0] updateCamera - 使用 RESIZE 模式，不使用攝影機縮放');

    // 重置攝影機縮放為 1
    camera.setZoom(1);

    // 不需要 centerOn，因為遊戲使用 RESIZE 模式
  }
}

