import { PlaneConfig } from '../../types/planes';

// B-17 轟炸機配置
export const B17_CONFIG: PlaneConfig = {
  id: 'b17',
  name: 'B-17 Flying Fortress',
  displayName: 'B-17 轟炸機',
  description: '四引擎重型轟炸機，擁有強大的火力和防護',
  type: 'bomber',
  
  // 性能參數
  speed: 250,
  fireRate: 300,
  health: 150,
  damage: 25,
  
  // 視覺參數
  scale: 0.8,
  color: '#1e3a8a',
  
  // 資源路徑
  assetPath: 'assets/planes/B-17/Type-1/B-17.png',
  soundPath: 'assets/sounds/heavy-engine.mp3',
  
  // 特殊能力
  abilities: [
    {
      id: 'heavy-bombardment',
      name: '重型轟炸',
      description: '發射多發重型炸彈',
      cooldown: 5000,
      effect: {
        type: 'multi-shot',
        duration: 2000,
        multiplier: 3
      }
    }
  ]
};

// BF-109E 戰鬥機配置
export const BF109_CONFIG: PlaneConfig = {
  id: 'bf109',
  name: 'Messerschmitt BF-109E',
  displayName: 'BF-109E 戰鬥機',
  description: '德國單引擎戰鬥機，機動性極佳',
  type: 'fighter',
  
  speed: 350,
  fireRate: 150,
  health: 80,
  damage: 20,
  
  scale: 0.7,
  color: '#dc2626',
  
  assetPath: 'assets/planes/BF-109E/Type-1/BF109E.png',
  soundPath: 'assets/sounds/fighter-engine.mp3',
  
  abilities: [
    {
      id: 'speed-boost',
      name: '加速衝刺',
      description: '短時間內大幅提升速度',
      cooldown: 8000,
      effect: {
        type: 'speed-boost',
        duration: 3000,
        multiplier: 1.5
      }
    }
  ]
};

// 雙翼戰鬥機配置
export const BIPLANE_CONFIG: PlaneConfig = {
  id: 'biplane',
  name: 'Biplane Fighter',
  displayName: '雙翼戰鬥機',
  description: '經典雙翼設計，操控靈活',
  type: 'biplane',
  
  speed: 200,
  fireRate: 400,
  health: 60,
  damage: 15,
  
  scale: 0.6,
  color: '#d97706',
  
  assetPath: 'assets/planes/Bipolar Plane/Type_1/Biploar_type1_5.png',
  soundPath: 'assets/sounds/vintage-engine.mp3',
  
  abilities: [
    {
      id: 'agile-maneuver',
      name: '敏捷機動',
      description: '提升機動性和閃避能力',
      cooldown: 6000,
      effect: {
        type: 'speed-boost',
        duration: 4000,
        multiplier: 1.3
      }
    }
  ]
};

// TBM-3 魚雷轟炸機配置
export const TBM3_CONFIG: PlaneConfig = {
  id: 'tbm3',
  name: 'TBM-3 Avenger',
  displayName: 'TBM-3 魚雷轟炸機',
  description: '美國海軍艦載轟炸機',
  type: 'torpedo',
  
  speed: 280,
  fireRate: 250,
  health: 120,
  damage: 30,
  
  scale: 0.75,
  color: '#065f46',
  
  assetPath: 'assets/planes/TBM3/Type_1/TBM-3.png',
  soundPath: 'assets/sounds/naval-engine.mp3',
  
  abilities: [
    {
      id: 'torpedo-strike',
      name: '魚雷攻擊',
      description: '發射威力強大的魚雷',
      cooldown: 10000,
      effect: {
        type: 'damage-boost',
        duration: 1000,
        multiplier: 3
      }
    }
  ]
};

// Hawker Tempest MKII 配置
export const HAWKER_CONFIG: PlaneConfig = {
  id: 'hawker',
  name: 'Hawker Tempest MKII',
  displayName: 'Hawker Tempest MKII',
  description: '英國高速戰鬥機',
  type: 'fighter',
  
  speed: 400,
  fireRate: 100,
  health: 90,
  damage: 22,
  
  scale: 0.7,
  color: '#1e40af',
  
  assetPath: 'assets/planes/Hawker Tempest MKII/Type_1/Hawker_type1.png',
  soundPath: 'assets/sounds/british-engine.mp3',
  
  abilities: [
    {
      id: 'rapid-fire',
      name: '快速射擊',
      description: '大幅提升射擊頻率',
      cooldown: 7000,
      effect: {
        type: 'damage-boost',
        duration: 5000,
        multiplier: 2
      }
    }
  ]
};

// JU-87B2 俯衝轟炸機配置
export const JU87_CONFIG: PlaneConfig = {
  id: 'ju87',
  name: 'Junkers JU-87B2 Stuka',
  displayName: 'JU-87B2 俯衝轟炸機',
  description: '德國俯衝轟炸機，精確打擊',
  type: 'dive-bomber',
  
  speed: 220,
  fireRate: 350,
  health: 100,
  damage: 35,
  
  scale: 0.75,
  color: '#4a5568',
  
  assetPath: 'assets/planes/JU-87B2/Type_1/JU87B2.png',
  soundPath: 'assets/sounds/stuka-engine.mp3',
  
  abilities: [
    {
      id: 'dive-bomb',
      name: '俯衝轟炸',
      description: '精確的俯衝攻擊',
      cooldown: 8000,
      effect: {
        type: 'damage-boost',
        duration: 2000,
        multiplier: 2.5
      }
    }
  ]
};

// Blenheim 轟炸機配置
export const BLENHEIM_CONFIG: PlaneConfig = {
  id: 'blenheim',
  name: 'Bristol Blenheim',
  displayName: 'Blenheim 轟炸機',
  description: '英國雙引擎中型轟炸機',
  type: 'bomber',
  
  speed: 260,
  fireRate: 280,
  health: 110,
  damage: 28,
  
  scale: 0.8,
  color: '#8b4513',
  
  assetPath: 'assets/planes/Blenheim/Type_1/Blenheim.png',
  soundPath: 'assets/sounds/twin-engine.mp3',
  
  abilities: [
    {
      id: 'formation-strike',
      name: '編隊攻擊',
      description: '召喚僚機協同攻擊',
      cooldown: 12000,
      effect: {
        type: 'multi-shot',
        duration: 3000,
        multiplier: 2
      }
    }
  ]
};

// 所有飛機配置
export const ALL_PLANE_CONFIGS: PlaneConfig[] = [
  B17_CONFIG,
  BF109_CONFIG,
  BIPLANE_CONFIG,
  TBM3_CONFIG,
  HAWKER_CONFIG,
  JU87_CONFIG,
  BLENHEIM_CONFIG
];

// 根據 ID 獲取飛機配置
export function getPlaneConfigById(id: string): PlaneConfig | null {
  return ALL_PLANE_CONFIGS.find(config => config.id === id) || null;
}

// 根據類型獲取飛機配置
export function getPlaneConfigsByType(type: string): PlaneConfig[] {
  return ALL_PLANE_CONFIGS.filter(config => config.type === type);
}
