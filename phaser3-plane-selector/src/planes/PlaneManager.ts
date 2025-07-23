import { PlaneConfig, IPlaneManager, PlaneSelectionEvent } from '../types/planes';
import { ALL_PLANE_CONFIGS } from './configs/index';
import { ASSET_KEYS, GAME_EVENTS } from '../game/config/gameConfig';

export class PlaneManager implements IPlaneManager {
  private currentPlaneId: string = 'b17';
  private planes: Map<string, PlaneConfig> = new Map();
  private eventEmitter: Phaser.Events.EventEmitter;
  // private _scene: Phaser.Scene | null = null;

  constructor(_scene?: Phaser.Scene) {
    this.eventEmitter = new Phaser.Events.EventEmitter();
    // this._scene = scene || null;
    this.initializePlanes();
  }

  private initializePlanes() {
    // 載入所有飛機配置到 Map 中
    ALL_PLANE_CONFIGS.forEach(config => {
      if (this.validatePlaneConfig(config)) {
        this.planes.set(config.id, config);
      } else {
        console.warn(`⚠️ 飛機配置驗證失敗: ${config.id}`);
      }
    });

    console.log(`✅ 飛機管理器初始化完成，載入 ${this.planes.size} 架飛機`);
  }

  private validatePlaneConfig(config: PlaneConfig): boolean {
    // 基本欄位驗證
    if (!config.id || !config.name || !config.displayName) {
      console.error('❌ 飛機配置缺少必要欄位:', config);
      return false;
    }

    // 數值範圍驗證
    if (config.speed <= 0 || config.fireRate <= 0 || config.health <= 0) {
      console.error('❌ 飛機配置數值無效:', config);
      return false;
    }

    // 縮放比例驗證
    if (config.scale <= 0 || config.scale > 3) {
      console.error('❌ 飛機縮放比例無效:', config);
      return false;
    }

    // 顏色格式驗證
    if (!config.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      console.error('❌ 飛機顏色格式無效:', config);
      return false;
    }

    return true;
  }

  public getCurrentPlane(): PlaneConfig {
    const plane = this.planes.get(this.currentPlaneId);
    if (!plane) {
      console.error(`❌ 找不到當前飛機: ${this.currentPlaneId}`);
      return this.planes.values().next().value || ALL_PLANE_CONFIGS[0]; // 返回第一架飛機作為備用
    }
    return plane;
  }

  public setCurrentPlane(planeId: string): void {
    const previousPlane = this.getCurrentPlane();
    
    if (!this.planes.has(planeId)) {
      console.error(`❌ 飛機不存在: ${planeId}`);
      return;
    }

    this.currentPlaneId = planeId;
    const currentPlane = this.getCurrentPlane();

    // 發送飛機選擇事件
    const event: PlaneSelectionEvent = {
      previousPlane,
      currentPlane,
      timestamp: Date.now()
    };

    this.eventEmitter.emit(GAME_EVENTS.PLANE_SELECTED, event);
    console.log(`✈️ 切換飛機: ${previousPlane.displayName} → ${currentPlane.displayName}`);
  }

  public getAllPlanes(): PlaneConfig[] {
    return Array.from(this.planes.values());
  }

  public getPlaneById(id: string): PlaneConfig | null {
    return this.planes.get(id) || null;
  }

  public getPlanesByType(type: string): PlaneConfig[] {
    return this.getAllPlanes().filter(plane => plane.type === type);
  }

  public createPlaneSprite(scene: Phaser.Scene, config: PlaneConfig): Phaser.GameObjects.Sprite {
    // 創建射手精靈（使用第0幀）
    const sprite = scene.add.sprite(0, 0, 'shooter-sprite', 0);

    // 設置射手縮放（縮小100%，再縮小50%）
    const adjustedScale = config.scale * 0.5 * 0.5; // 再縮小50%

    // 設置射手旋轉（轉向180度）
    sprite.setRotation(Math.PI); // 180度 = π弧度

    // 設置上下翻轉和縮放
    sprite.setScale(adjustedScale, -adjustedScale); // Y軸負值實現上下翻轉

    // 不對射手精靈應用tint，保持原始顏色

    // 設置射手的自定義屬性
    sprite.setData('planeConfig', config);
    sprite.setData('planeId', config.id);

    // 創建射手動畫
    this.createShooterAnimation(scene, config.id);

    console.log(`🎯 射手設置: ${config.displayName} - 縮放: ${adjustedScale}, 旋轉: 180度, 上下翻轉, 4幀動畫`);

    return sprite;
  }

  private createShooterAnimation(scene: Phaser.Scene, planeId: string) {
    // 創建射手的4幀動畫
    const animKey = `shooter-${planeId}`;

    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers('shooter-sprite', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });

      console.log(`🎬 創建射手動畫: ${animKey} (4幀循環)`);
    }
  }

  private getPlaneTextureKey(config: PlaneConfig): string {
    // 根據飛機 ID 返回對應的資源鍵值
    const textureMap: { [key: string]: string } = {
      'b17': ASSET_KEYS.PLANES.B17,
      'bf109': ASSET_KEYS.PLANES.BF109,
      'biplane': ASSET_KEYS.PLANES.BIPLANE,
      'tbm3': ASSET_KEYS.PLANES.TBM3,
      'hawker': ASSET_KEYS.PLANES.HAWKER,
      'ju87': ASSET_KEYS.PLANES.JU87,
      'blenheim': ASSET_KEYS.PLANES.BLENHEIM
    };

    return textureMap[config.id] || 'plane-placeholder';
  }

  public getPlaneStats(planeId: string) {
    const config = this.getPlaneById(planeId);
    if (!config) return null;

    return {
      id: config.id,
      name: config.displayName,
      type: config.type,
      performance: {
        speed: config.speed,
        fireRate: config.fireRate,
        health: config.health,
        damage: config.damage
      },
      abilities: config.abilities || []
    };
  }

  public getRecommendedPlane(playerStyle: 'aggressive' | 'defensive' | 'balanced'): PlaneConfig {
    const planes = this.getAllPlanes();
    
    switch (playerStyle) {
      case 'aggressive':
        // 推薦高速、高傷害的飛機
        return planes.reduce((best, current) => 
          (current.speed + current.damage) > (best.speed + best.damage) ? current : best
        );
      
      case 'defensive':
        // 推薦高生命值、低射擊頻率的飛機
        return planes.reduce((best, current) => 
          (current.health + (1000 - current.fireRate)) > (best.health + (1000 - best.fireRate)) ? current : best
        );
      
      case 'balanced':
      default:
        // 推薦平衡型飛機
        return planes.reduce((best, current) => {
          const currentScore = (current.speed + current.health + current.damage) / 3;
          const bestScore = (best.speed + best.health + best.damage) / 3;
          return currentScore > bestScore ? current : best;
        });
    }
  }

  public on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }

  public off(event: string, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
  }

  public emit(event: string, ...args: any[]): void {
    this.eventEmitter.emit(event, ...args);
  }

  public destroy(): void {
    this.eventEmitter.removeAllListeners();
    this.planes.clear();
    // this._scene = null;
  }

  // 靜態方法：創建單例實例
  private static instance: PlaneManager | null = null;

  public static getInstance(scene?: Phaser.Scene): PlaneManager {
    if (!PlaneManager.instance) {
      PlaneManager.instance = new PlaneManager(scene);
    }
    return PlaneManager.instance;
  }

  public static destroyInstance(): void {
    if (PlaneManager.instance) {
      PlaneManager.instance.destroy();
      PlaneManager.instance = null;
    }
  }
}
