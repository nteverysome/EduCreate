// 飛機類型定義
export interface PlaneConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: PlaneType;
  
  // 性能參數
  speed: number;
  fireRate: number;
  health: number;
  damage: number;
  
  // 視覺參數
  scale: number;
  color: string;
  
  // 資源路徑
  assetPath?: string;
  soundPath?: string;
  
  // 特殊能力
  abilities?: PlaneAbility[];
}

export type PlaneType = 
  | 'fighter'      // 戰鬥機
  | 'bomber'       // 轟炸機
  | 'biplane'      // 雙翼機
  | 'torpedo'      // 魚雷機
  | 'dive-bomber'; // 俯衝轟炸機

export interface PlaneAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  effect: AbilityEffect;
}

export interface AbilityEffect {
  type: 'speed-boost' | 'damage-boost' | 'shield' | 'multi-shot';
  duration: number;
  multiplier: number;
}

export interface PlaneGraphicsConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    detail: string;
  };
}

export interface PlaneRenderData {
  config: PlaneConfig;
  graphics: Phaser.GameObjects.Graphics;
  sprite?: Phaser.GameObjects.Sprite;
  animations?: Phaser.Animations.Animation[];
}

// 飛機管理器介面
export interface IPlaneManager {
  getCurrentPlane(): PlaneConfig;
  setCurrentPlane(planeId: string): void;
  getAllPlanes(): PlaneConfig[];
  getPlaneById(id: string): PlaneConfig | null;
  createPlaneSprite(scene: Phaser.Scene, config: PlaneConfig): Phaser.GameObjects.Sprite;
}

// 飛機渲染器介面
export interface IPlaneRenderer {
  renderPlane(graphics: Phaser.GameObjects.Graphics, config: PlaneConfig): void;
  createPlaneTexture(scene: Phaser.Scene, config: PlaneConfig): Phaser.Textures.Texture;
  updatePlaneGraphics(graphics: Phaser.GameObjects.Graphics, config: PlaneConfig): void;
}

// 飛機選擇事件
export interface PlaneSelectionEvent {
  previousPlane: PlaneConfig | null;
  currentPlane: PlaneConfig;
  timestamp: number;
}

export interface PlaneStats {
  totalFlightTime: number;
  enemiesDestroyed: number;
  bulletsShot: number;
  accuracy: number;
  highScore: number;
}
