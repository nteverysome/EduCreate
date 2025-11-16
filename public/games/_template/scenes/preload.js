/**
 * Preload 場景 - 資源預載
 * 
 * 🏆 基於 shimozurdo-game 的標準架構
 * 
 * 🎯 功能：
 * 1. 載入遊戲資源（圖片、音效、字體等）
 * 2. 顯示載入進度
 * 3. 初始化管理器
 * 4. 完成後啟動遊戲場景
 * 
 * 📖 使用說明：
 * - 在這裡添加你的資源載入代碼
 * - 修改 GEPT/SRS/Bilingual 管理器的啟用狀態
 */

export default class PreloadScene extends Phaser.Scene {
  
  constructor() {
    super('preload');
  }
  
  preload() {
    console.log('🔄 [Preload] 開始載入資源');
    
    // 創建載入進度顯示
    this.createLoadingUI();
    
    // ===== 🔧 在這裡添加你的資源載入 =====
    // 範例：
    // this.load.image('logo', './assets/logo.png');
    // this.load.audio('bgm', './assets/bgm.mp3');
    // this.load.spritesheet('player', './assets/player.png', {
    //   frameWidth: 32,
    //   frameHeight: 32
    // });
    
    // 監聽載入進度
    this.load.on('progress', this.updateProgress, this);
    this.load.on('complete', this.loadComplete, this);
  }
  
  create() {
    console.log('✅ [Preload] 資源載入完成');
    
    // 初始化管理器
    this.initManagers();
    
    // 延遲後啟動遊戲場景
    this.time.delayedCall(500, () => {
      console.log('🚀 [Preload] 啟動遊戲場景');
      
      // 停止 Preload 場景
      this.scene.stop('preload');
      
      // 啟動遊戲場景
      const handler = this.scene.get('handler');
      handler.launchScene('game');
    });
  }
  
  /**
   * 創建載入進度 UI
   */
  createLoadingUI() {
    const centerX = this.game.screenBaseSize.width / 2;
    const centerY = this.game.screenBaseSize.height / 2;
    
    // 載入文字
    this.loadingText = this.add.text(centerX, centerY - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 進度條背景
    const progressBarWidth = 400;
    const progressBarHeight = 30;
    this.progressBarBg = this.add.rectangle(
      centerX,
      centerY,
      progressBarWidth,
      progressBarHeight,
      0x222222
    );
    
    // 進度條
    this.progressBar = this.add.rectangle(
      centerX - progressBarWidth / 2,
      centerY,
      0,
      progressBarHeight,
      0x00ff00
    ).setOrigin(0, 0.5);
    
    // 百分比文字
    this.percentText = this.add.text(centerX, centerY, '0%', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
  
  /**
   * 更新載入進度
   */
  updateProgress(progress) {
    const progressBarWidth = 400;
    this.progressBar.width = progressBarWidth * progress;
    this.percentText.setText(Math.round(progress * 100) + '%');
  }
  
  /**
   * 載入完成
   */
  loadComplete() {
    console.log('✅ [Preload] 所有資源載入完成');
  }
  
  /**
   * 初始化管理器
   * 🔧 根據你的需求啟用/禁用管理器
   */
  initManagers() {
    console.log('🔧 [Preload] 初始化管理器');
    
    // ===== GEPT 管理器 =====
    const enableGEPT = true;  // 🔧 改為 false 禁用
    if (enableGEPT && window.GEPTManager) {
      this.geptManager = new window.GEPTManager();
      console.log('✅ GEPT 管理器已初始化');
    }
    
    // ===== SRS 管理器 =====
    const enableSRS = true;  // 🔧 改為 false 禁用
    if (enableSRS && window.SRSManager) {
      this.srsManager = new window.SRSManager();
      console.log('✅ SRS 管理器已初始化');
    }
    
    // ===== Bilingual 管理器 =====
    const enableBilingual = true;  // 🔧 改為 false 禁用
    if (enableBilingual && window.BilingualManager) {
      this.bilingualManager = new window.BilingualManager();
      console.log('✅ Bilingual 管理器已初始化');
    }
  }
}

