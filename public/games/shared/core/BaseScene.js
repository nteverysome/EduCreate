/**
 * BaseScene - 所有 Phaser 遊戲場景的基礎類
 * 
 * 🎯 功能：
 * 1. 統一的響應式處理（Camera Zoom 方法）
 * 2. 自動管理器初始化（GEPT、SRS、Bilingual）
 * 3. 標準化的生命週期方法
 * 4. 固定設計尺寸 + 自動縮放
 * 
 * 📖 使用方法：
 * ```javascript
 * import BaseScene from '/games/shared/core/BaseScene.js';
 * 
 * export default class GameScene extends BaseScene {
 *   constructor() {
 *     super('game');  // 場景名稱
 *   }
 * 
 *   create() {
 *     super.create();  // ✅ 必須調用
 *     // 你的遊戲邏輯...
 *   }
 * }
 * ```
 */

export default class BaseScene extends Phaser.Scene {
  
  /**
   * 建構函數
   * @param {string} key - 場景鍵值
   * @param {Object} options - 場景選項
   */
  constructor(key, options = {}) {
    super(key);
    
    // 場景選項
    this.sceneOptions = {
      enableResponsive: true,      // 啟用響應式
      enableGEPT: true,            // 啟用 GEPT 管理器
      enableSRS: true,             // 啟用 SRS 管理器
      enableBilingual: true,       // 啟用雙語管理器
      designWidth: 1920,           // 設計寬度
      designHeight: 1080,          // 設計高度
      ...options
    };
    
    // 響應式相關
    this.parent = null;
    this.sizer = null;
    this.sceneStopped = false;
  }
  
  /**
   * 🔥 create 方法 - 所有子類必須調用 super.create()
   */
  create() {
    console.log(`🎮 [BaseScene] ${this.scene.key} 場景創建`);
    
    // 1. 初始化響應式系統
    if (this.sceneOptions.enableResponsive) {
      this.initResponsive();
    }
    
    // 2. 初始化管理器
    this.initManagers();
    
    // 3. 設置場景停止監聽
    this.events.on('shutdown', this.onShutdown, this);
  }
  
  /**
   * 初始化響應式系統（Camera Zoom 方法）
   */
  initResponsive() {
    console.log('📐 [BaseScene] 初始化響應式系統');
    
    // 監聽 resize 事件
    this.scale.on('resize', this.handleResize, this);
    
    // 獲取當前尺寸
    const scaleWidth = this.scale.gameSize.width;
    const scaleHeight = this.scale.gameSize.height;
    
    // 創建 Phaser.Structs.Size 對象
    this.parent = new Phaser.Structs.Size(scaleWidth, scaleHeight);
    this.sizer = new Phaser.Structs.Size(
      this.sceneOptions.designWidth,
      this.sceneOptions.designHeight,
      Phaser.Structs.Size.FIT,
      this.parent
    );
    
    // 設置初始尺寸
    this.parent.setSize(scaleWidth, scaleHeight);
    this.sizer.setSize(scaleWidth, scaleHeight);
    
    // 更新攝影機
    this.updateCamera();
    
    console.log('✅ [BaseScene] 響應式系統初始化完成');
  }
  
  /**
   * 處理 resize 事件
   */
  handleResize(gameSize) {
    if (this.sceneStopped) return;
    
    const { width, height } = gameSize;
    
    // 更新尺寸
    this.parent.setSize(width, height);
    this.sizer.setSize(width, height);
    
    // 更新攝影機
    this.updateCamera();
    
    // 調用子類的 onResize 方法（如果有）
    if (this.onResize) {
      this.onResize(width, height);
    }
  }
  
  /**
   * 更新攝影機縮放
   */
  updateCamera() {
    const camera = this.cameras.main;
    if (!camera) return;
    
    // 計算縮放比例
    const scaleX = this.sizer.width / this.sceneOptions.designWidth;
    const scaleY = this.sizer.height / this.sceneOptions.designHeight;
    
    // 設置 Camera Zoom
    camera.setZoom(Math.max(scaleX, scaleY));
    camera.centerOn(
      this.sceneOptions.designWidth / 2,
      this.sceneOptions.designHeight / 2
    );
  }
  
  /**
   * 初始化管理器
   */
  initManagers() {
    console.log('🔧 [BaseScene] 初始化管理器');
    
    // GEPT 管理器
    if (this.sceneOptions.enableGEPT && typeof GEPTManager !== 'undefined') {
      if (!this.game.geptManager) {
        this.game.geptManager = new GEPTManager();
      }
      this.geptManager = this.game.geptManager;
      console.log('✅ GEPT 管理器已初始化');
    }
    
    // SRS 管理器
    if (this.sceneOptions.enableSRS && typeof SRSManager !== 'undefined') {
      if (!this.game.srsManager) {
        this.game.srsManager = new SRSManager();
      }
      this.srsManager = this.game.srsManager;
      console.log('✅ SRS 管理器已初始化');
    }
    
    // Bilingual 管理器
    if (this.sceneOptions.enableBilingual && typeof BilingualManager !== 'undefined') {
      if (!this.game.bilingualManager) {
        this.game.bilingualManager = new BilingualManager();
      }
      this.bilingualManager = this.game.bilingualManager;
      console.log('✅ Bilingual 管理器已初始化');
    }
  }
  
  /**
   * 場景停止時的清理
   */
  onShutdown() {
    console.log(`🛑 [BaseScene] ${this.scene.key} 場景停止`);
    this.sceneStopped = true;
    
    // 移除 resize 監聽
    this.scale.off('resize', this.handleResize, this);
  }
  
  /**
   * 🎯 輔助方法：獲取設計尺寸座標
   * 使用固定設計尺寸，不需要動態計算
   */
  getDesignWidth() {
    return this.sceneOptions.designWidth;
  }
  
  getDesignHeight() {
    return this.sceneOptions.designHeight;
  }
  
  getDesignCenterX() {
    return this.sceneOptions.designWidth / 2;
  }
  
  getDesignCenterY() {
    return this.sceneOptions.designHeight / 2;
  }
}

