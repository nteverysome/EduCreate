import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG, ASSET_KEYS } from '../config/gameConfig';
// import { AssetLoader } from '../../utils/AssetLoader';

export class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  // private _loadingProgress: number = 0;
  // private assetLoader!: AssetLoader;

  constructor() {
    super({ key: SCENE_KEYS.LOADING });
  }

  preload() {
    console.log('📦 LoadingScene: 開始載入資源');

    // 初始化資源載入器
    // this.assetLoader = new AssetLoader(this);

    // 創建載入畫面 UI
    this.createLoadingUI();

    // 設置載入事件監聽
    this.setupLoadingEvents();

    // 載入基本資源（暫時使用程序生成的圖形）
    this.loadBasicAssets();
  }

  create() {
    console.log('✅ LoadingScene: 資源載入完成');
    
    // 短暫延遲後切換到選單場景
    this.time.delayedCall(1000, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private createLoadingUI() {
    const { width, height } = this.cameras.main;
    
    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    
    // 標題
    this.add.text(width / 2, height / 2 - 100, '🛩️ Phaser 3 飛機選擇器', {
      fontSize: '32px',
      color: '#3498db',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 載入文字
    this.loadingText = this.add.text(width / 2, height / 2 + 50, '載入中...', {
      fontSize: '18px',
      color: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 進度條背景
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x34495e);
    this.progressBox.fillRect(width / 2 - 160, height / 2 + 80, 320, 20);
    
    // 進度條
    this.progressBar = this.add.graphics();
  }

  private setupLoadingEvents() {
    // 載入進度事件
    this.load.on('progress', (value: number) => {
      // this._loadingProgress = value;
      this.updateProgressBar(value);
      this.loadingText.setText(`載入中... ${Math.round(value * 100)}%`);
    });

    // 載入完成事件
    this.load.on('complete', () => {
      this.loadingText.setText('載入完成！');
      console.log('📦 所有資源載入完成');
    });

    // 載入錯誤事件
    this.load.on('loaderror', (file: any) => {
      console.error('❌ 資源載入失敗:', file.key);
      this.loadingText.setText(`載入失敗: ${file.key}`);
    });
  }

  private updateProgressBar(progress: number) {
    const { width, height } = this.cameras.main;

    this.progressBar.clear();
    this.progressBar.fillStyle(0x3498db);
    this.progressBar.fillRect(width / 2 - 158, height / 2 + 82, 316 * progress, 16);
  }

  private loadBasicAssets() {
    // 載入真實的飛機圖片
    this.loadPlaneAssets();

    // 創建基本的程序生成圖形作為佔位符
    this.load.image('plane-placeholder', this.createPlaneTexture());

    // 創建子彈精靈的佔位符
    this.load.image('bullet-placeholder', this.createBulletTexture());

    // 創建敵機精靈的佔位符
    this.load.image('enemy-placeholder', this.createEnemyTexture());

    // 創建背景精靈的佔位符
    this.load.image('background-placeholder', this.createBackgroundTexture());

    // 模擬載入時間
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy-${i}`, this.createDummyTexture());
    }
  }

  private loadPlaneAssets() {
    // 載入所有飛機圖片
    console.log('🛩️ 開始載入真實飛機圖片...');

    try {
      this.load.image(ASSET_KEYS.PLANES.B17, 'assets/planes/b17.png');
      this.load.image(ASSET_KEYS.PLANES.BF109, 'assets/planes/bf109.png');
      this.load.image(ASSET_KEYS.PLANES.BIPLANE, 'assets/planes/biplane.png');
      this.load.image(ASSET_KEYS.PLANES.TBM3, 'assets/planes/tbm3.png');
      this.load.image(ASSET_KEYS.PLANES.HAWKER, 'assets/planes/hawker.png');
      this.load.image(ASSET_KEYS.PLANES.JU87, 'assets/planes/ju87.png');
      this.load.image(ASSET_KEYS.PLANES.BLENHEIM, 'assets/planes/blenheim.png');

      // 載入雲朵敵人
      this.load.image('cloud-enemy', 'assets/cloud-enemy.png');

      // 載入月球視差背景
      this.load.image('moon-sky', 'assets/backgrounds/moon_sky.png');
      this.load.image('moon-earth', 'assets/backgrounds/moon_earth.png');
      this.load.image('moon-back', 'assets/backgrounds/moon_back.png');
      this.load.image('moon-mid', 'assets/backgrounds/moon_mid.png');
      this.load.image('moon-front', 'assets/backgrounds/moon_front.png');
      this.load.image('moon-floor', 'assets/backgrounds/moon_floor.png');

      // 載入射手精靈圖（替代太空梭）
      // 實際結構：2540x218，4幀動畫序列，每幀635x218像素
      this.load.spritesheet('shooter-sprite', 'assets/shooter-sprite.png', {
        frameWidth: 635,  // 每幀635像素寬
        frameHeight: 218  // 高度218像素
      });

      console.log('✅ 雲朵敵人、月球視差背景和射手精靈載入配置完成');
    } catch (error) {
      console.error('❌ 資源載入配置失敗:', error);
    }
  }

  private createPlaneTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // 繪製簡單的飛機形狀
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(32, 10);
    ctx.lineTo(20, 40);
    ctx.lineTo(32, 35);
    ctx.lineTo(44, 40);
    ctx.closePath();
    ctx.fill();
    
    // 機翼
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(15, 25, 34, 8);
    
    return canvas.toDataURL();
  }

  private createBulletTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(2, 0, 4, 16);
    
    return canvas.toDataURL();
  }

  private createEnemyTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    
    // 繪製敵機
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(24, 38);
    ctx.lineTo(12, 8);
    ctx.lineTo(24, 13);
    ctx.lineTo(36, 8);
    ctx.closePath();
    ctx.fill();
    
    // 機翼
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(8, 18, 32, 6);
    
    return canvas.toDataURL();
  }

  private createBackgroundTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = GAME_CONFIG.SCREEN.WIDTH;
    canvas.height = GAME_CONFIG.SCREEN.HEIGHT;
    const ctx = canvas.getContext('2d')!;

    // 創建漸變背景（純天空，無雲朵）
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4682B4');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 移除雲朵 - 現在雲朵將作為敵人出現
    console.log('🌤️ 創建純天空背景，雲朵將作為敵人出現');

    return canvas.toDataURL();
  }

  private createDummyTexture(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(0, 0, 32, 32);
    
    return canvas.toDataURL();
  }
}
