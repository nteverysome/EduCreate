import Phaser from 'phaser';
import { ASSET_KEYS } from '../game/config/gameConfig';

export interface AssetManifest {
  images: { [key: string]: string };
  sounds: { [key: string]: string };
  fonts: { [key: string]: string };
  json: { [key: string]: string };
}

export class AssetLoader {
  private scene: Phaser.Scene;
  private loadedAssets: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private assetManifest: AssetManifest;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.assetManifest = this.createAssetManifest();
  }

  private createAssetManifest(): AssetManifest {
    return {
      images: {
        // 飛機圖片
        [ASSET_KEYS.PLANES.B17]: '/assets/planes/B-17/Type-1/B-17.png',
        [ASSET_KEYS.PLANES.BF109]: '/assets/planes/BF-109E/Type-1/BF109E.png',
        [ASSET_KEYS.PLANES.BIPLANE]: '/assets/planes/Bipolar Plane/Type_1/Biploar_type1_5.png',
        [ASSET_KEYS.PLANES.TBM3]: '/assets/planes/TBM3/Type_1/TBM-3.png',
        [ASSET_KEYS.PLANES.HAWKER]: '/assets/planes/Hawker Tempest MKII/Type_1/Hawker_type1.png',
        [ASSET_KEYS.PLANES.JU87]: '/assets/planes/JU-87B2/Type_1/JU87B2.png',
        [ASSET_KEYS.PLANES.BLENHEIM]: '/assets/planes/Blenheim/Type_1/Blenheim.png',
        
        // UI 圖片
        [ASSET_KEYS.UI.BUTTON]: '/assets/ui/button.png',
        [ASSET_KEYS.UI.PANEL]: '/assets/ui/panel.png',
        [ASSET_KEYS.UI.SELECTOR]: '/assets/ui/selector.png',
        
        // 遊戲物件
        'bullet': '/assets/game/bullet.png',
        'enemy': '/assets/game/enemy.png',
        'explosion': '/assets/game/explosion.png',
        'background': '/assets/game/background.jpg'
      },
      
      sounds: {
        [ASSET_KEYS.SOUNDS.SHOOT]: '/assets/sounds/shoot.mp3',
        [ASSET_KEYS.SOUNDS.EXPLOSION]: '/assets/sounds/explosion.mp3',
        [ASSET_KEYS.SOUNDS.ENGINE]: '/assets/sounds/engine.mp3',
        [ASSET_KEYS.SOUNDS.SELECT]: '/assets/sounds/select.mp3',
        
        // 飛機引擎音效
        'heavy-engine': '/assets/sounds/heavy-engine.mp3',
        'fighter-engine': '/assets/sounds/fighter-engine.mp3',
        'vintage-engine': '/assets/sounds/vintage-engine.mp3',
        'naval-engine': '/assets/sounds/naval-engine.mp3',
        'british-engine': '/assets/sounds/british-engine.mp3',
        'stuka-engine': '/assets/sounds/stuka-engine.mp3',
        'twin-engine': '/assets/sounds/twin-engine.mp3'
      },
      
      fonts: {
        'game-font': '/assets/fonts/game-font.woff2',
        'ui-font': '/assets/fonts/ui-font.woff2'
      },
      
      json: {
        'plane-data': '/assets/data/planes.json',
        'game-config': '/assets/data/config.json'
      }
    };
  }

  public async loadAsset(key: string, type: 'image' | 'sound' | 'font' | 'json'): Promise<void> {
    // 檢查是否已載入
    if (this.loadedAssets.has(key)) {
      return Promise.resolve();
    }

    // 檢查是否正在載入
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    // 開始載入
    const loadPromise = this.performLoad(key, type);
    this.loadingPromises.set(key, loadPromise);

    try {
      await loadPromise;
      this.loadedAssets.add(key);
      this.loadingPromises.delete(key);
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  private async performLoad(key: string, type: 'image' | 'sound' | 'font' | 'json'): Promise<void> {
    return new Promise((resolve, reject) => {
      const path = this.getAssetPath(key, type);
      
      if (!path) {
        console.warn(`⚠️ 找不到資源路徑: ${key}`);
        // 使用程序生成的備用資源
        this.createFallbackAsset(key, type);
        resolve();
        return;
      }

      // 檢查資源是否存在
      this.checkAssetExists(path).then(exists => {
        if (exists) {
          this.loadRealAsset(key, type, path, resolve, reject);
        } else {
          console.warn(`⚠️ 資源不存在，使用備用資源: ${path}`);
          this.createFallbackAsset(key, type);
          resolve();
        }
      });
    });
  }

  private async checkAssetExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private loadRealAsset(
    key: string, 
    type: 'image' | 'sound' | 'font' | 'json', 
    path: string,
    resolve: () => void,
    reject: (error: any) => void
  ) {
    switch (type) {
      case 'image':
        this.scene.load.image(key, path);
        break;
      case 'sound':
        this.scene.load.audio(key, path);
        break;
      case 'json':
        this.scene.load.json(key, path);
        break;
      case 'font':
        // 字體載入需要特殊處理
        this.loadFont(key, path).then(resolve).catch(reject);
        return;
    }

    this.scene.load.once('complete', resolve);
    this.scene.load.once('loaderror', reject);
    this.scene.load.start();
  }

  private async loadFont(key: string, path: string): Promise<void> {
    const font = new FontFace(key, `url(${path})`);
    await font.load();
    document.fonts.add(font);
  }

  private createFallbackAsset(key: string, type: 'image' | 'sound' | 'font' | 'json') {
    switch (type) {
      case 'image':
        this.createFallbackImage(key);
        break;
      case 'sound':
        this.createFallbackSound(key);
        break;
      case 'json':
        this.createFallbackJson(key);
        break;
    }
  }

  private createFallbackImage(key: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // 根據資源類型創建不同的備用圖片
    if (key.includes('plane')) {
      this.drawFallbackPlane(ctx, canvas.width, canvas.height);
    } else if (key.includes('bullet')) {
      this.drawFallbackBullet(ctx, canvas.width, canvas.height);
    } else if (key.includes('enemy')) {
      this.drawFallbackEnemy(ctx, canvas.width, canvas.height);
    } else {
      this.drawFallbackGeneric(ctx, canvas.width, canvas.height);
    }
    
    this.scene.textures.addCanvas(key, canvas);
  }

  private drawFallbackPlane(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX - 10, centerY + 15);
    ctx.lineTo(centerX, centerY + 10);
    ctx.lineTo(centerX + 10, centerY + 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(centerX - 15, centerY - 2, 30, 6);
  }

  private drawFallbackBullet(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(width / 2 - 2, 0, 4, height);
  }

  private drawFallbackEnemy(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 15);
    ctx.lineTo(centerX - 8, centerY - 15);
    ctx.lineTo(centerX, centerY - 10);
    ctx.lineTo(centerX + 8, centerY - 15);
    ctx.closePath();
    ctx.fill();
  }

  private drawFallbackGeneric(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', width / 2, height / 2 + 4);
  }

  private createFallbackSound(key: string) {
    // 創建靜音音頻作為備用
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    
    // 將靜音緩衝區添加到 Phaser 的音頻快取中
    this.scene.cache.audio.add(key, buffer);
  }

  private createFallbackJson(key: string) {
    const fallbackData = { error: 'Asset not found', key };
    this.scene.cache.json.add(key, fallbackData);
  }

  private getAssetPath(key: string, type: 'image' | 'sound' | 'font' | 'json'): string | null {
    switch (type) {
      case 'image':
        return this.assetManifest.images[key] || null;
      case 'sound':
        return this.assetManifest.sounds[key] || null;
      case 'font':
        return this.assetManifest.fonts[key] || null;
      case 'json':
        return this.assetManifest.json[key] || null;
      default:
        return null;
    }
  }

  public async loadAssetGroup(keys: string[], type: 'image' | 'sound' | 'font' | 'json'): Promise<void> {
    const loadPromises = keys.map(key => this.loadAsset(key, type));
    await Promise.all(loadPromises);
  }

  public isAssetLoaded(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  public getLoadedAssets(): string[] {
    return Array.from(this.loadedAssets);
  }

  public clearCache(): void {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
  }
}
